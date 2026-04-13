# AGENTS.md - Doutor Agenda

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Auth**: BetterAuth
- **Payments**: Stripe
- **UI**: shadcn/ui + Tailwind CSS v4
- **Forms**: React Hook Form + Zod
- **Server Actions**: next-safe-action

## Developer Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Apply migrations
pnpm db:push      # Push schema to database (no migrations)
pnpm db:studio    # Open Drizzle Studio
pnpm db:check     # Check migration status
```

## Database
- Schema: `src/db/schema.ts`
- Use `db` from `@/db` for all queries
- All time fields stored as UTC strings (`HH:mm:ss`)

### Questionnaire Tables
- `questionnaire_fields` - Catálogo de campos (text, number, select, etc)
- `questionnaire_templates` - Templates de questionários por clínica
- `questionnaire_template_fields` - Campos de cada template (relação N:N)
- `questionnaires` - Questionários reais criados pelo médico
- `questionnaire_responses` - Respostas preenchidas nos atendimentos

## Key Patterns

### Server Actions (src/actions/)
- Use `protectedWithClinicActionClient` for authenticated actions requiring a clinic
- Schema files colocated: `actions/{action}/schema.ts`
- Import schema: `import { upsertDoctorSchema } from "./schema";`
- Always call `revalidatePath()` after mutations

### Route Groups
- `(protected)/` = authenticated routes (require clinic)
- API routes in `app/api/`
- Auth routes in `app/authentication/`

## File Conventions
- **Naming**: kebab-case for all files and folders
- **Page components**: wrap in `PageContainer` for consistent spacing
- **Forms**: colocate in `_components/` folder of the page
- **Date handling**: use `dayjs` with UTC plugin

## Architecture
- Multi-tenant: users belong to clinics via `usersToClinicsTable`
- Session includes `clinic.id` (single clinic per user for now)
- Medical workflow: Vital Signs → Anamnese → Prescription → Certificate

## Cursor Rules
See `.cursor/rules/general.mdc` for detailed conventions.
