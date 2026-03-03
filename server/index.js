import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

// OTP Store (In-memory for demo, should be Redis/Database in prod)
const otpStore = new Map();

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

// Ensure Data Directory Exists
(async () => {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log(`📂 Data directory ready at ${DATA_DIR}`);
    } catch (err) {
        console.error("Failed to create data dir:", err);
    }
})();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors()); // Allow Cross-Origin requests (configure strict origin in prod)
app.use(express.json({ limit: '10mb' })); // Limit body size to prevent DoS

// Rate Limiting: 15 requests per minute per IP
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 15,
    message: { error: { message: "Too many requests, please slow down." } },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- Persistence Routes ---

// GET Data
app.get('/api/data/:key', async (req, res) => {
    try {
        const { key } = req.params;
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
            return res.status(400).json({ error: "Invalid key format" });
        }

        // Special handling for 'users' to use the new Database
        if (key === 'users') {
            const users = await prisma.user.findMany();
            return res.json(users);
        }

        const filePath = path.join(DATA_DIR, `${key}.json`);
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            res.json(JSON.parse(data));
        } catch (err) {
            if (err.code === 'ENOENT') {
                return res.json(null);
            }
            throw err;
        }
    } catch (error) {
        console.error("Read Error:", error);
        res.status(500).json({ error: "Failed to read data" });
    }
});

// SAVE Data
app.post('/api/data/:key', async (req, res) => {
    try {
        const { key } = req.params;
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
            return res.status(400).json({ error: "Invalid key format" });
        }

        // Special handling for 'users' to use the new Database
        if (key === 'users') {
            const users = req.body;
            if (Array.isArray(users)) {
                for (const user of users) {
                    await prisma.user.upsert({
                        where: { email: user.email },
                        update: { ...user },
                        create: { ...user }
                    });
                }
            }
            return res.json({ success: true });
        }

        const filePath = path.join(DATA_DIR, `${key}.json`);
        await fs.writeFile(filePath, JSON.stringify(req.body, null, 2));

        res.json({ success: true });
    } catch (error) {
        console.error("Write Error:", error);
        res.status(500).json({ error: "Failed to save data" });
    }
});

// --- Auth Routes ---

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ error: "Identifier and password required" });
        }

        // Search by email or ID
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { id: identifier }
                ]
            }
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const { password: _, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error during login" });
    }
});

// --- OTP Auth Routes ---

// Send OTP
app.post('/api/auth/otp/send', async (req, res) => {
    try {
        const { identifier, type } = req.body; // type: 'email' or 'mobile'
        if (!identifier) return res.status(400).json({ error: "Identifier required" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(identifier, { otp, expires: Date.now() + 5 * 60 * 1000 });

        console.log(`[AUTH] OTP for ${identifier}: ${otp}`);

        if (type === 'email') {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const mailOptions = {
                    from: `"Praxium Security" <${process.env.EMAIL_USER}>`,
                    to: identifier,
                    subject: '🔒 Your Praxium Access Code',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2>Secure Authorization Code</h2>
                            <p>Verify your identity with the following code:</p>
                            <h1 style="background: #f4f4f4; padding: 20px; letter-spacing: 5px; text-align: center; border-radius: 8px;">${otp}</h1>
                            <p>This code expires in 5 minutes.</p>
                        </div>
                    `
                };
                await transporter.sendMail(mailOptions);
            } else {
                console.warn("[AUTH] SMTP credentials missing. OTP sent to log only.");
            }
        } else if (type === 'mobile') {
            console.log(`[SMS MOCK] Sending OTP ${otp} to ${identifier}`);
        }

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("OTP Send Error:", error);
        res.status(500).json({ error: "Failed to send OTP" });
    }
});

// Verify OTP
app.post('/api/auth/otp/verify', async (req, res) => {
    try {
        const { identifier, otp } = req.body;
        const stored = otpStore.get(identifier);

        if (!stored) return res.status(400).json({ error: "OTP not requested or expired" });
        if (stored.expires < Date.now()) {
            otpStore.delete(identifier);
            return res.status(400).json({ error: "OTP expired" });
        }
        if (stored.otp !== otp) return res.status(400).json({ error: "Invalid OTP code" });

        otpStore.delete(identifier); // Clear after use
        res.json({ success: true, message: "OTP verified" });
    } catch (error) {
        console.error("OTP Verify Error:", error);
        res.status(500).json({ error: "Verification failed" });
    }
});

// --- AI Routes ---
const generateSchema = z.object({
    prompt: z.string().min(1).max(5000), // Enforce reasonable length
    image: z.object({
        mime_type: z.string().regex(/^image\/(png|jpeg|webp|heic|heif)$/),
        data: z.string().base64()
    }).optional()
});

// API Route
app.post('/api/generate', apiLimiter, async (req, res) => {
    try {
        // 1. Validate Input
        const validation = generateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: { message: "Invalid input", details: validation.error.errors }
            });
        }

        const { prompt, image } = validation.data;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("Server Error: JSON Key missing");
            return res.status(500).json({ error: { message: "Server configuration error" } });
        }

        // 2. Prepare payload for Gemini
        const parts = [{ text: prompt }];
        if (image) {
            parts.push({
                inline_data: {
                    mime_type: image.mime_type,
                    data: image.data
                }
            });
        }

        // 3. Call Google API (Server-to-Server)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts }] }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle specific upstream errors
            if (response.status === 429) {
                return res.status(429).json({ error: { message: "AI Service busy (Quota exceeded). Try again later." } });
            }

            return res.status(response.status).json({
                error: { message: errorData.error?.message || "AI Service Error" }
            });
        }

        const data = await response.json();

        // Return only the text content to the client
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            return res.status(500).json({ error: { message: "No response text generated" } });
        }

        res.json({ text });

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: { message: "Internal Server Error" } });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
