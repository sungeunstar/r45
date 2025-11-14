# Joyful Church - R45 Worship Team Check-In App

A mobile-first attendance check-in web application for the R45 Worship Team at Joyful Church.

## Features

- **Mobile-First Design**: Optimized 420px layout, black & white minimal aesthetic
- **Session Management**: Create and manage worship sessions with public check-in links
- **Member Management**: Organize team members by groups (보컬, 악기, 음향)
- **Public Check-In**: No-login attendance check-in via unique session links
- **Admin Dashboard**: Full CRUD operations for sessions, members, and admin users
- **CSV Export**: Download attendance records for reporting

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Iron Session + bcrypt
- **Server Actions**: Next.js Server Actions for all API operations

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
SESSION_SECRET="your-secret-key-minimum-32-characters"
```

### 3. Initialize Database

1. Go to your Supabase project's SQL Editor
2. Copy the entire contents of `schema.sql`
3. Paste and run it in the SQL Editor

This creates:
- All required tables with proper indexes and constraints
- Default admin: `admin@joyful.app` / `admin123`
- Sample members: 김하늘, 이가은, 박요한, 최민수, 정현우

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Default Credentials

After database initialization, login with:
- **Email**: `admin@joyful.app`
- **Password**: `admin123`

⚠️ **Important**: Change the default password immediately after first login!

## Application Structure

```
/app
  /admin
    /login          → Admin login page
    /sessions       → Session management (CRUD)
    /members        → Member management (CRUD)
    /admins         → Admin user management (CRUD)
  /s
    /[token]        → Public check-in page
```

## Usage

### Creating a Session

1. Login to admin dashboard
2. Navigate to "Sessions" tab
3. Click "Create Session"
4. Fill in session details (name, date, note)
5. Session is created with a unique public token
6. Copy the check-in link and share with team members

### Team Member Check-In

1. Open the public check-in link (e.g., `/s/abc123xyz`)
2. Enter the last 4 digits of your phone number
3. Select "참석" or "불참"
4. If absent, provide a reason
5. See confirmation message

### Managing Members

1. Navigate to "Members" tab
2. Filter by group (보컬, 악기, 음향)
3. Add new members or edit existing ones
4. Toggle active/inactive status

### Viewing Attendance

1. Navigate to "Sessions" tab
2. Click on a session to view details
3. See attended and absent members
4. Export CSV for reporting

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Application Configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Session Secret (minimum 32 characters)
SESSION_SECRET="your-secret-key-minimum-32-characters-long"
```

Get your Supabase credentials from: **Supabase Dashboard → Project Settings → API**

## Design Guidelines

- **Layout**: Max width 420px, centered on all devices
- **Colors**: Black (#000), White (#fff), Gray (#666, #999, #e5e5e5)
- **Typography**: Inter or system fonts
- **Radius**: 12px (inputs/cards), 8px (buttons)
- **Spacing**: 16-20px between form elements

## Security Notes

- Admin routes protected by middleware
- Passwords hashed with bcrypt (10 rounds)
- HttpOnly cookies for sessions
- Session expires after 7 days
- IP and User-Agent logged for attendance

## Troubleshooting

### Database Issues

If you encounter database errors:

1. **Check your Supabase connection:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
   - Check if your Supabase project is active

2. **Reset the database:**
   - Run `db-verify-and-clear.sql` in Supabase SQL Editor to completely reset
   - Or run `schema.sql` to reinitialize from scratch

3. **Check table names:**
   - All tables use PascalCase: `Session`, `Member`, `Attendance`
   - All columns use snake_case: `public_token`, `phone_last4`

### Quick Database Check

Run `db-quick-check.sql` in Supabase SQL Editor to verify current database state:
- Shows all existing tables
- Displays record counts
- Lists current sessions

## License

Private use for Joyful Church R45 Worship Team.
