# StudyNao Web

Student and teacher portal for StudyNao, built with Next.js 16, React 19, Mantine UI, and the shared NAO Service.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The portal uses port 3001. Set `NEXT_PUBLIC_API_URL` to NAO Service (default `http://localhost:8000`). The service must include the StudyNao migration and permit `http://localhost:3001` in `CORS_ORIGINS`.

## Current scope

Registration with a student/teacher choice, shared account login, product-role checks, student and teacher onboarding, teacher approval status, light/dark mode, and dashboard entry states are implemented. Class requests, availability, timetable, sessions, and payroll are subsequent phases.
