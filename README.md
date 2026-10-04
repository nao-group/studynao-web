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

Registration with a student/teacher choice, shared account login, product-role checks, onboarding, teacher approval status, and light/dark mode are implemented. Students can request classes and join available groups; private students and teachers submit weekly availability. The portal displays generated class sessions in day, week, and month views. Session attendance, Zoom account assignment, and payroll are later phases.

## Code organization

Each route keeps its `page.tsx` as a small entry point. Its `api.ts` contains endpoint calls, `types.ts` contains route-specific data and component contracts, and `components/` contains the interactive UI. Shared API transport, StudyNao endpoints, data types, and scheduling utilities live in `lib/`; shared visual components such as the authenticated shell live in the top-level `components/` directory.
