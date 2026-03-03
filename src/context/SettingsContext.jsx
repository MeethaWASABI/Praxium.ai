import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const SettingsContext = createContext(null);
export const useSettings = () => useContext(SettingsContext);

// ─── Translation Strings ─────────────────────────────
const translations = {
    english: {
        dashboard: 'Dashboard', courses: 'Courses', liveClasses: 'Live Classes', messenger: 'Messenger',
        chatWithAI: 'Chat with AI', assessments: 'Assessments', placementPortal: 'Placement Portal',
        myAccount: 'My Account', signOut: 'Sign Out', settings: 'Settings', profile: 'Profile',
        appearance: 'Appearance', security: 'Security', notifications: 'Notifications', language: 'Language',
        dataPrivacy: 'Data & Privacy', helpSupport: 'Help & Support', aboutPraxium: 'About Praxium',
        save: 'Save Changes', cancel: 'Cancel', welcomeBack: 'Welcome back',
        curriculumTests: 'Curriculum Tests', aiPracticeLab: 'AI Practice Lab', resultsAnalytics: 'Results & Analytics',
    },
    hindi: {
        dashboard: 'डैशबोर्ड', courses: 'पाठ्यक्रम', liveClasses: 'लाइव कक्षाएं', messenger: 'मैसेंजर',
        chatWithAI: 'AI से चैट करें', assessments: 'मूल्यांकन', placementPortal: 'प्लेसमेंट पोर्टल',
        myAccount: 'मेरा खाता', signOut: 'साइन आउट', settings: 'सेटिंग्स', profile: 'प्रोफ़ाइल',
        appearance: 'दिखावट', security: 'सुरक्षा', notifications: 'सूचनाएं', language: 'भाषा',
        dataPrivacy: 'डेटा और गोपनीयता', helpSupport: 'सहायता और समर्थन', aboutPraxium: 'प्रैक्सियम के बारे में',
        save: 'बदलाव सहेजें', cancel: 'रद्द करें', welcomeBack: 'वापस स्वागत है',
        curriculumTests: 'पाठ्यक्रम परीक्षा', aiPracticeLab: 'AI अभ्यास लैब', resultsAnalytics: 'परिणाम और विश्लेषण',
    },
    spanish: {
        dashboard: 'Panel', courses: 'Cursos', liveClasses: 'Clases en vivo', messenger: 'Mensajero',
        chatWithAI: 'Chat con IA', assessments: 'Evaluaciones', placementPortal: 'Portal de colocación',
        myAccount: 'Mi cuenta', signOut: 'Cerrar sesión', settings: 'Configuración', profile: 'Perfil',
        appearance: 'Apariencia', security: 'Seguridad', notifications: 'Notificaciones', language: 'Idioma',
        dataPrivacy: 'Datos y privacidad', helpSupport: 'Ayuda y soporte', aboutPraxium: 'Acerca de Praxium',
        save: 'Guardar cambios', cancel: 'Cancelar', welcomeBack: 'Bienvenido de nuevo',
        curriculumTests: 'Pruebas curriculares', aiPracticeLab: 'Laboratorio de práctica IA', resultsAnalytics: 'Resultados y análisis',
    },
    french: {
        dashboard: 'Tableau de bord', courses: 'Cours', liveClasses: 'Cours en direct', messenger: 'Messagerie',
        chatWithAI: 'Chat avec IA', assessments: 'Évaluations', placementPortal: 'Portail de placement',
        myAccount: 'Mon compte', signOut: 'Déconnexion', settings: 'Paramètres', profile: 'Profil',
        appearance: 'Apparence', security: 'Sécurité', notifications: 'Notifications', language: 'Langue',
        dataPrivacy: 'Données et confidentialité', helpSupport: 'Aide et support', aboutPraxium: 'À propos de Praxium',
        save: 'Enregistrer', cancel: 'Annuler', welcomeBack: 'Content de vous revoir',
        curriculumTests: 'Tests de programme', aiPracticeLab: 'Labo pratique IA', resultsAnalytics: 'Résultats et analyses',
    },
    german: {
        dashboard: 'Dashboard', courses: 'Kurse', liveClasses: 'Live-Kurse', messenger: 'Nachrichten',
        chatWithAI: 'Chat mit KI', assessments: 'Bewertungen', placementPortal: 'Vermittlungsportal',
        myAccount: 'Mein Konto', signOut: 'Abmelden', settings: 'Einstellungen', profile: 'Profil',
        appearance: 'Darstellung', security: 'Sicherheit', notifications: 'Benachrichtigungen', language: 'Sprache',
        dataPrivacy: 'Daten & Datenschutz', helpSupport: 'Hilfe & Support', aboutPraxium: 'Über Praxium',
        save: 'Änderungen speichern', cancel: 'Abbrechen', welcomeBack: 'Willkommen zurück',
        curriculumTests: 'Lehrplantests', aiPracticeLab: 'KI-Übungslabor', resultsAnalytics: 'Ergebnisse & Analysen',
    },
    japanese: {
        dashboard: 'ダッシュボード', courses: 'コース', liveClasses: 'ライブ授業', messenger: 'メッセージ',
        chatWithAI: 'AIチャット', assessments: '評価', placementPortal: '就職ポータル',
        myAccount: 'マイアカウント', signOut: 'サインアウト', settings: '設定', profile: 'プロフィール',
        appearance: '外観', security: 'セキュリティ', notifications: '通知', language: '言語',
        dataPrivacy: 'データとプライバシー', helpSupport: 'ヘルプとサポート', aboutPraxium: 'Praxiumについて',
        save: '変更を保存', cancel: 'キャンセル', welcomeBack: 'おかえりなさい',
        curriculumTests: 'カリキュラムテスト', aiPracticeLab: 'AI練習ラボ', resultsAnalytics: '結果と分析',
    }
};

export const SettingsProvider = ({ children }) => {
    // ─── Load persisted settings ─────────────────────────
    const loadSetting = (key, fallback) => {
        try { const v = localStorage.getItem(`praxium_${key}`); return v !== null ? JSON.parse(v) : fallback; }
        catch { return fallback; }
    };

    // Theme & Appearance
    const [accentColor, setAccentColorState] = useState(() => loadSetting('accentColor', '#4A70A9'));
    const [fontSize, setFontSizeState] = useState(() => loadSetting('fontSize', 'medium'));
    const [compactMode, setCompactModeState] = useState(() => loadSetting('compactMode', false));
    const [darkMode, setDarkModeState] = useState(() => loadSetting('darkMode', false));

    // Language
    const [language, setLanguageState] = useState(() => loadSetting('language', 'english'));

    // Notifications
    const [notificationPrefs, setNotificationPrefsState] = useState(() => loadSetting('notificationPrefs', {
        assessmentResults: true, courseUpdates: true, placementAlerts: false,
        aiSuggestions: true, upcomingClasses: true, messages: true,
        emailEnabled: true, smsEnabled: false
    }));

    // Privacy
    const [privacyPrefs, setPrivacyPrefsState] = useState(() => loadSetting('privacyPrefs', {
        profileVisible: true, showOnLeaderboard: true, usageAnalytics: false
    }));

    // 2FA
    const [twoFactorEnabled, setTwoFactorEnabledState] = useState(() => loadSetting('twoFactorEnabled', false));

    // ─── Persist helpers ─────────────────────────────────
    const persist = (key, value) => localStorage.setItem(`praxium_${key}`, JSON.stringify(value));

    const setAccentColor = useCallback((color) => {
        setAccentColorState(color);
        persist('accentColor', color);
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--accent', color);
        // Derive soft and secondary variants
        const r = parseInt(color.slice(1, 3), 16), g = parseInt(color.slice(3, 5), 16), b = parseInt(color.slice(5, 7), 16);
        document.documentElement.style.setProperty('--primary-soft', `rgba(${r}, ${g}, ${b}, 0.12)`);
        // Secondary = lighter tint of primary
        const lr = Math.min(255, r + Math.round((255 - r) * 0.45));
        const lg = Math.min(255, g + Math.round((255 - g) * 0.45));
        const lb = Math.min(255, b + Math.round((255 - b) * 0.45));
        const sec = `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
        document.documentElement.style.setProperty('--secondary', sec);
    }, []);

    // ─── Font Size ───────────────────────────────────────
    const setFontSize = useCallback((size) => {
        setFontSizeState(size);
        persist('fontSize', size);
        const map = { small: '14px', medium: '16px', large: '18px' };
        document.documentElement.style.fontSize = map[size] || '16px';
    }, []);

    // ─── Compact Mode ────────────────────────────────────
    const setCompactMode = useCallback((enabled) => {
        setCompactModeState(enabled);
        persist('compactMode', enabled);
        if (enabled) document.body.classList.add('compact-mode');
        else document.body.classList.remove('compact-mode');
    }, []);

    // ─── Dark Mode ───────────────────────────────────────
    const toggleDarkMode = useCallback(() => {
        setDarkModeState(prev => {
            const next = !prev;
            persist('darkMode', next);
            if (next) document.body.classList.add('dark-mode');
            else document.body.classList.remove('dark-mode');
            return next;
        });
    }, []);

    // ─── Language ────────────────────────────────────────
    const setLanguage = useCallback((lang) => {
        setLanguageState(lang);
        persist('language', lang);
    }, []);

    const t = useCallback((key) => {
        return translations[language]?.[key] || translations.english[key] || key;
    }, [language]);

    // ─── Notifications ──────────────────────────────────
    const updateNotificationPref = useCallback((key, value) => {
        setNotificationPrefsState(prev => {
            const next = { ...prev, [key]: value };
            persist('notificationPrefs', next);
            return next;
        });
    }, []);

    // ─── Privacy ────────────────────────────────────────
    const updatePrivacyPref = useCallback((key, value) => {
        setPrivacyPrefsState(prev => {
            const next = { ...prev, [key]: value };
            persist('privacyPrefs', next);
            return next;
        });
    }, []);

    // ─── 2FA ────────────────────────────────────────────
    const setTwoFactorEnabled = useCallback((enabled) => {
        setTwoFactorEnabledState(enabled);
        persist('twoFactorEnabled', enabled);
    }, []);

    // ─── Apply persisted settings on mount ──────────────
    useEffect(() => {
        // Accent color
        if (accentColor !== '#4A70A9') {
            document.documentElement.style.setProperty('--primary', accentColor);
            document.documentElement.style.setProperty('--accent', accentColor);
            const r = parseInt(accentColor.slice(1, 3), 16), g = parseInt(accentColor.slice(3, 5), 16), b = parseInt(accentColor.slice(5, 7), 16);
            document.documentElement.style.setProperty('--primary-soft', `rgba(${r}, ${g}, ${b}, 0.12)`);
            const lr = Math.min(255, r + Math.round((255 - r) * 0.45));
            const lg = Math.min(255, g + Math.round((255 - g) * 0.45));
            const lb = Math.min(255, b + Math.round((255 - b) * 0.45));
            const sec = `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
            document.documentElement.style.setProperty('--secondary', sec);
        }
        // Font size
        const map = { small: '14px', medium: '16px', large: '18px' };
        document.documentElement.style.fontSize = map[fontSize] || '16px';
        // Compact
        if (compactMode) document.body.classList.add('compact-mode');
        // Dark
        if (darkMode) document.body.classList.add('dark-mode');
    }, []); // Only on mount

    const value = {
        accentColor, setAccentColor,
        fontSize, setFontSize,
        compactMode, setCompactMode,
        darkMode, toggleDarkMode,
        language, setLanguage, t,
        notificationPrefs, updateNotificationPref,
        privacyPrefs, updatePrivacyPref,
        twoFactorEnabled, setTwoFactorEnabled,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
