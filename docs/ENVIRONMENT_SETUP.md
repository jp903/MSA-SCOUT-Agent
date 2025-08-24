# Environment Setup Guide

This guide will help you set up the required environment variables for the MSA Scout Property Investment Agent.

## Required APIs

### 1. RapidAPI (Required)
- Go to [RapidAPI](https://rapidapi.com/)
- Sign up for an account
- Subscribe to these APIs:
  - **Zillow API** (search for "Zillow" in RapidAPI marketplace)
  - **LoopNet API** (search for "LoopNet" in RapidAPI marketplace)
- Copy your RapidAPI key from the dashboard
- Add to `.env.local`: `RAPIDAPI_KEY=your-key-here`

### 2. RentCast API (Optional)
- Go to [RentCast](https://www.rentcast.io/)
- Sign up for an API account
- Get your API key
- Add to `.env.local`: `RENTCAST_API_KEY=your-key-here`

### 3. FRED API (Optional - for economic data)
- Go to [FRED API](https://fred.stlouisfed.org/docs/api/api_key.html)
- Request an API key
- Add to `.env.local`: `FRED_API_KEY=your-key-here`

## Database Setup (Neon)

1. Go to [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection strings
4. Add to `.env.local`:
   \`\`\`
   DATABASE_URL=your-neon-url
   POSTGRES_URL=your-postgres-url
   POSTGRES_PRISMA_URL=your-prisma-url
   \`\`\`

## Authentication Setup

1. Generate a random secret:
   \`\`\`bash
   openssl rand -base64 32
   \`\`\`
2. Add to `.env.local`: `NEXTAUTH_SECRET=your-secret`

## Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
6. Add to `.env.local`:
   \`\`\`
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   \`\`\`

## Verification

Run these commands to verify your setup:

\`\`\`bash
# Check environment variables
npm run env:check

# Test API connections
npm run api:test

# Check RapidAPI subscriptions
npm run rapidapi:check
\`\`\`

## Troubleshooting

### Common Issues

1. **"Not subscribed" errors**
   - Check your RapidAPI subscriptions
   - Make sure you're subscribed to the correct APIs
   - Verify your RapidAPI key is correct

2. **Database connection errors**
   - Check your Neon database URLs
   - Make sure the database is running
   - Verify connection string format

3. **Authentication issues**
   - Check NEXTAUTH_SECRET is set
   - Verify NEXTAUTH_URL matches your domain
   - For Google OAuth, check client ID and secret

### Getting Help

1. Check the console logs for detailed error messages
2. Use the API status endpoint: `/api/property-search/status`
3. Run the test scripts to identify specific issues
4. Check the RapidAPI dashboard for usage limits and subscription status

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `RAPIDAPI_KEY` | Yes | Your RapidAPI key for Zillow/LoopNet |
| `RENTCAST_API_KEY` | No | RentCast API for rental data |
| `FRED_API_KEY` | No | FRED API for economic data |
| `DATABASE_URL` | Yes | Neon database connection string |
| `NEXTAUTH_SECRET` | Yes | Random secret for authentication |
| `NEXTAUTH_URL` | Yes | Your app URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
