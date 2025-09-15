# **Buyer Leads Mini App**

Live Demo: [https://your-vercel-deploy-link.vercel.app](https://buyer-lead-intake-red.vercel.app/)

## **Demo Login:**

Email: likhithvarunsai@gmail.com

Password: Likhith@01082002

## **Tech Stack**

Frontend: Next.js, React, ESLint

Authentication: Clerk

Database / ORM: PostgreSQL, Drizzle ORM

Validation: Zod (client & server)

Utilities: PapaParse (CSV parsing)

Language / Tools: TypeScript


## **Setup**

1.Clone the repo:
```
git clone https://github.com/likhith1072/Buyer-Lead-Intake.git
cd Buyer-Lead-Intake 
```
2.Install dependencies:
```
npm install
```
3.Create .env file with:
```
DATABASE_URL='postgresql://<user>:<password>@<host>/<db>?sslmode=require&channel_binding=require'
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>
NODE_ENV=development
```
4.Run database migrations:
```
npm run db:migrate:dev
```
5.Start the dev server:
```
npm run dev
```

## Design Notes

**Validation:**  
- Zod on both client and server ensures consistent validation for all forms (create/edit) and CSV imports.

**SSR vs Client:**  
- Listing (`/buyers`) uses SSR for pagination, filters, and search.  
- Form (`/buyers/new`) is a client component for interactive editing.  
- Form (`/buyers/[id]`) is a server component for interactive editing and fetching existing buyer leads from the database.

**Ownership Enforcement:**  
- Users can only edit/delete leads they own (`ownerId`).  
- All logged-in users can read leads.

## What’s Done vs Skipped

**Done:**  
- Full CRUD (create, list, view, edit, delete)  
- SSR pagination, filtering, search  
- URL-synced filters and debounced search  
- CSV import/export (validated, transactional)  
- Concurrency checks with `updatedAt`  
- Error boundary + empty state  
- Accessibility basics: labels, keyboard focus, form errors announced  
- Basic full-text search on `fullName`, `email`, `notes`  
- Simple rate limit on create/update (per user/IP)  

**Skipped:**  
- File upload for optional attachment  
- Tag chips with typeahead  
- Optimistic edit with rollback 



