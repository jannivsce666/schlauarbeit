# Schlauarbeit.de - Next.js KI-Platform

Eine moderne, dunkle KI-Platform für Dienstleister-Vermittlung mit Glassmorphism-Design und Firebase Authentication.

## 🚀 Features

- **KI-Window**: Zentrales, quadratisches Interface mit Glassmorphism-Effekten
- **5 Hauptfunktionen**: Suche, Auftrag erstellen, Bild Upload, Google Login, Chat
- **Dark Theme**: Modernes AI-Design mit Neon-Akzenten in Grün (#10B981)
- **Responsive**: Mobile-First, optimiert für alle Geräte
- **Firebase Auth**: Google Sign-In mit iOS-Redirect-Support
- **Framer Motion**: Sanfte Animationen und Spotlight-Effekte
- **shadcn/ui**: Hochwertige, zugängliche UI-Komponenten

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + @tailwindcss/forms
- **UI Components**: shadcn/ui (Radix UI)
- **Animations**: Framer Motion
- **Authentication**: Firebase Auth
- **Language**: TypeScript
- **Icons**: Lucide React

## 📦 Installation

1. **Repository klonen**:
   ```bash
   git clone <repository-url>
   cd anderesschlauarbeit
   ```

2. **Dependencies installieren**:
   ```bash
   npm install
   ```

3. **Environment Variablen einrichten**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Trage deine Firebase-Konfiguration ein:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Development Server starten**:
   ```bash
   npm run dev
   ```

## 🔧 Firebase Setup

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Erstelle ein neues Projekt
3. Aktiviere Authentication → Sign-in method → Google
4. Füge deine Domain zu den autorisierten Domains hinzu
5. Kopiere die Konfiguration in deine `.env.local`

## 🎨 Design System

### Farben
- **Primary**: Brand Green (#10B981)
- **Background**: Dark Gradient (Gray 900 → Black)
- **Glassmorphism**: White/5 mit Backdrop Blur
- **Accents**: Purple/Blue für Highlights

### Komponenten
- **KI-Window**: Zentraler Container mit Tabs
- **Glassmorphism Cards**: Transparente Karten mit Blur-Effekt
- **Animated Spotlight**: Framer Motion Hintergrund-Animation
- **Responsive Tabs**: Mobile-optimierte Navigation

## 🚀 Deployment (Netlify)

1. **Build erstellen**:
   ```bash
   npm run build
   ```

2. **Netlify deployen**:
   - Verknüpfe dein Git Repository
   - Build Command: `npm run build`
   - Publish Directory: `out` oder `.next`
   - Environment Variablen in Netlify Settings hinzufügen

3. **Redirects**: Die `public/_redirects` Datei ist bereits konfiguriert

## 📱 Tastaturkürzel

- **`/`**: Fokussiert die Suchleiste
- **`g` + `a`**: Öffnet "Auftrag erstellen"
- **`g` + `c`**: Navigiert zum Chat

## 🔧 Entwicklung

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

### Projektstruktur
```
├── app/
│   ├── (marketing)/page.tsx    # Startseite
│   ├── chat/page.tsx           # Chat-Bereich
│   ├── layout.tsx              # Root Layout
│   └── globals.css             # Global Styles
├── components/
│   ├── ui/                     # shadcn/ui Komponenten
│   ├── KiWindow.tsx            # Haupt-Interface
│   ├── SearchBar.tsx           # Suchfunktion
│   ├── CreateJobForm.tsx       # Auftrag erstellen
│   ├── ImageDropzone.tsx       # Bild Upload
│   ├── GoogleLoginButton.tsx   # Authentication
│   └── ChatCTA.tsx             # Chat Call-to-Action
├── lib/
│   ├── firebase.ts             # Firebase Config
│   ├── auth.ts                 # Auth Helpers
│   └── utils.ts                # Utility Functions
└── hooks/
    └── use-toast.ts            # Toast Hook
```

## 🎯 Features im Detail

### KI-Window Tabs
1. **Suchen**: Dienstleister finden mit Standort-Filter
2. **Auftrag**: Projekt erstellen mit Kategorie und Budget
3. **Bild**: Drag & Drop Upload mit Vorschau
4. **Login**: Google Authentication
5. **Chat**: Navigation zum Chat-Bereich

### Accessibility
- ARIA Labels für Screen Reader
- Keyboard Navigation
- Focus States
- High Contrast Mode Support

## 🐛 Bekannte Issues

- TypeScript Compile Errors werden während Development ignoriert
- Demo-Funktionen (keine echten Backend-Calls)
- iOS Safari benötigt Redirect für Google Auth

## 📄 Lizenz

Dieses Projekt ist für Demo-Zwecke erstellt. Alle Rechte vorbehalten.

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Öffne einen Pull Request

---

**Entwickelt mit ❤️ für Schlauarbeit.de**