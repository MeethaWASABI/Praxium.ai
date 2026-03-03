import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

async function main() {
    console.log("🌱 Starting Full Database Seed Process...");

    // 1. Seed Users from JSON
    try {
        const filePath = path.join(DATA_DIR, `users.json`);
        const data = await fs.readFile(filePath, 'utf-8');
        const users = JSON.parse(data);

        console.log(`Found ${users.length} users in JSON. Seeding User base...`);

        for (const user of users) {
            const userData = {
                id: user.id || `USR-${Math.random().toString(36).substring(2, 9)}`,
                name: user.name || "Unknown",
                email: user.email,
                password: user.password,
                role: user.role || "student",
                permissions: user.permissions || "standard",
                phone: user.phone || null,
                bio: user.bio || null,
                personalEmail: user.personalEmail || null,
                photo: user.photo || null,
                streak: user.streak || 0,
                currentStreak: user.currentStreak || 0,
                completedCourses: user.completedCourses ? JSON.stringify(user.completedCourses) : "[]",
                achievements: user.achievements ? JSON.stringify(user.achievements) : "[]",
                completedModules: user.completedModules ? JSON.stringify(user.completedModules) : null,
            };

            await prisma.user.upsert({
                where: { email: userData.email },
                update: userData,
                create: userData
            });
        }
    } catch (error) {
        console.log("⚠️ Could not strictly seed users.json. Proceeding to relational seeding...");
    }

    // 2. Ensure an Admin and Teacher exist for Course Creation
    const admin = await prisma.user.upsert({
        where: { email: 'admin@praxium.ai' },
        update: {},
        create: { id: 'ADM-001', name: 'System Admin', email: 'admin@praxium.ai', password: 'adminpassword', role: 'admin' }
    });

    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@praxium.ai' },
        update: {},
        create: { id: 'TCH-001', name: 'Lead Teacher', email: 'teacher@praxium.ai', password: 'teacherpassword', role: 'teacher' }
    });

    // 3. Seed Courses & Modules
    console.log("📚 Seeding Courses and educational content...");
    const course1 = await prisma.course.upsert({
        where: { id: 'crs_advanced_react' }, // using a fixed ID conceptually or checking manually, since id is uuid by default usually we'd search by title.
        update: {},
        create: {
            id: 'crs_advanced_react', // fixed for seeding
            title: 'Advanced React Architecture',
            description: 'Master enterprise-level React applications.',
            level: 'Advanced',
            authorId: teacher.id,
            modules: {
                create: [
                    { title: 'Component Patterns', orderIndex: 1, lessons: { create: [{ title: 'HOCs', orderIndex: 1 }, { title: 'Render Props', orderIndex: 2 }] } },
                    { title: 'State Management', orderIndex: 2, lessons: { create: [{ title: 'Redux Toolkit', orderIndex: 1 }, { title: 'Zustand', orderIndex: 2 }] } }
                ]
            }
        }
    });

    const course2 = await prisma.course.upsert({
        where: { id: 'crs_sys_design' },
        update: {},
        create: {
            id: 'crs_sys_design',
            title: 'System Design for Interviews',
            description: 'Learn how to scale distributed systems.',
            level: 'Intermediate',
            authorId: admin.id,
            modules: {
                create: [
                    { title: 'Load Balancing', orderIndex: 1, lessons: { create: [{ title: 'Consistent Hashing', orderIndex: 1 }] } },
                    { title: 'Database Sharding', orderIndex: 2, lessons: { create: [{ title: 'CAP Theorem', orderIndex: 1 }] } }
                ]
            }
        }
    });

    // 4. Seed Placement Profiles for Students
    console.log("📈 Seeding Student Placement Data...");
    const students = await prisma.user.findMany({ where: { role: 'student' } });

    for (const student of students) {
        const technical = Math.floor(Math.random() * 40) + 60; // 60-100
        const communication = Math.floor(Math.random() * 40) + 60;
        const resume = Math.floor(Math.random() * 40) + 60;
        const overall = (technical + communication + resume) / 3;

        await prisma.placementProfile.upsert({
            where: { userId: student.id },
            update: { overallScore: overall, technicalScore: technical, communicationScore: communication, resumeScore: resume },
            create: {
                userId: student.id,
                overallScore: overall,
                technicalScore: technical,
                communicationScore: communication,
                resumeScore: resume,
                status: overall > 85 ? 'placed' : 'ready',
                company: overall > 85 ? 'Tech Innovators Inc.' : null
            }
        });

        // 5. Seed Activity Logs
        await prisma.activityLog.create({
            data: {
                action: 'profile_updated',
                details: { system: 'seed script', type: 'placement_generation' },
                userId: student.id
            }
        });

        // 6. Enroll students in courses randomly
        if (Math.random() > 0.5) {
            const existingCount = await prisma.enrollment.count({ where: { userId: student.id, courseId: course1.id } });
            if (existingCount === 0) {
                await prisma.enrollment.create({
                    data: {
                        userId: student.id,
                        courseId: course1.id,
                        progressPercent: Math.floor(Math.random() * 100),
                        status: 'active'
                    }
                });
            }
        }
    }

    console.log("🌳 Seeding Finished Successfully. Dashboard tables are ready!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
