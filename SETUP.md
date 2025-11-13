# Quick Setup Guide

Follow these steps to get the application running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Initialize Database

```bash
npx prisma generate
npx prisma db push
```

## Step 3: Seed Database

```bash
npm run db:seed
```

This will create:
- Default admin account: `admin@joyful.app` / `admin1234`
- 5 sample members (김하늘, 이가은, 박요한, 최민수, 정현우)

## Step 4: Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## Step 5: Login

1. Go to http://localhost:3000/admin/login
2. Login with `admin@joyful.app` / `admin1234`
3. You'll be redirected to the Sessions page

## Next Steps

1. **Create a Session**
   - Click "Create Session" button
   - Fill in session name, date, and optional note
   - A unique check-in link will be generated

2. **Share Check-In Link**
   - View the session details
   - Click "Copy Check-in Link"
   - Share with team members

3. **Test Check-In**
   - Open the public link in a new incognito window
   - Select a member and click "출석하기"
   - See the success confirmation

4. **View Attendance**
   - Go back to admin dashboard
   - View the session to see attended/absent members
   - Export CSV if needed

## Production Deployment

For production deployment:

```bash
npm run build
npm start
```

Remember to:
- Set proper environment variables
- Change default admin password
- Use HTTPS in production
- Set `NODE_ENV=production`

## Need Help?

Check the full README.md for detailed documentation.
