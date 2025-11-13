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
- **Database**: Prisma + SQLite
- **Authentication**: Iron Session + bcrypt
- **Server Actions**: Next.js Server Actions for all API operations

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Generate Prisma client and create database:

```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Database

Seed with default admin and sample members:

```bash
npm run db:seed
```

This creates:
- Default admin: `admin@joyful.app` / `admin1234`
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

After seeding, login with:
- **Email**: `admin@joyful.app`
- **Password**: `admin1234`

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
2. Search and select your name
3. Click "출석하기"
4. See confirmation message

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

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
SESSION_SECRET="your-secret-key-minimum-32-characters"
```

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

### Prisma Issues

If you encounter Prisma binary download issues:

```bash
# Clear Prisma cache
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# Reinstall
npm install

# Try again
npx prisma generate
```

### Database Reset

To reset the database:

```bash
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

## License

Private use for Joyful Church R45 Worship Team.
