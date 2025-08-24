# Property Investment Agent

An AI-powered property investment analysis platform built with Next.js, featuring real-time market data, property search, and intelligent investment recommendations.

## Features

- 🏠 **Property Search & Analysis** - Search properties with detailed investment metrics
- 🤖 **AI-Powered Chat** - Get intelligent property investment advice
- 📊 **Market Insights** - Real-time market data and trends
- 💼 **Portfolio Tracking** - Track and manage your property investments
- 🔐 **Authentication** - Secure user authentication and data protection
- 📱 **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Neon PostgreSQL
- **AI**: OpenAI GPT-4, Vercel AI SDK
- **Authentication**: JWT-based auth
- **APIs**: FRED Economic Data, RentCast, Property APIs

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/property-investment-agent.git
cd property-investment-agent
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your environment variables in `.env.local`:

\`\`\`env
# Database
DATABASE_URL="your-neon-database-url"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Property APIs
RAPIDAPI_KEY="your-rapidapi-key"
RENTCAST_API_KEY="your-rentcast-api-key"
FRED_API_KEY="your-fred-api-key"

# JWT Secret
JWT_SECRET="your-jwt-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

4. Initialize the database:
\`\`\`bash
pnpm run dev
# Visit http://localhost:3000/api/init-db to initialize tables
\`\`\`

5. Start the development server:
\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/auth/verify` - Token verification

### Property Search
- `GET /api/property-search` - Search properties
- `GET /api/property-search/status` - API status check

### Market Data
- `GET /api/fred-data` - Economic indicators
- `GET /api/msa-info` - Metropolitan area info

### AI Chat
- `POST /api/chat` - AI chat interactions

### Portfolio
- `GET /api/portfolio` - Get user portfolios
- `POST /api/portfolio` - Create portfolio
- `GET /api/portfolio/[id]` - Get specific portfolio

## Environment Setup

See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for detailed environment configuration instructions.

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm env:check` - Check environment variables
- `pnpm api:test` - Test API connections

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@msascout.com or join our Discord community.
