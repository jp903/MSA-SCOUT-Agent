# MSASCOUT - AI Property Investment Agent

## 🏢 Overview

**MSASCOUT** is an advanced AI-powered property investment analysis platform that leverages real-time data from the US Census Bureau, Bureau of Labor Statistics (BLS), and Federal Reserve Economic Data (FRED) to provide comprehensive market insights and investment recommendations.

### 🚀 Key Features

- **Real-time Market Data Integration**: Access to live Census, BLS, and FRED data for accurate market analysis
- **AI-Powered Investment Insights**: Advanced analysis using OpenAI's GPT models for property investment recommendations
- **Interactive Chat Interface**: Natural language conversations with the investment agent
- **Automated Report Generation**: Create professional reports in PDF or DOCX formats
- **Presentation Creation**: Generate slide presentations for investment opportunities
- **Demographic Analysis**: Detailed population, income, and employment trend analysis
- **Risk Assessment**: Comprehensive market risk evaluation and recommendations

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Integration**: Vercel AI SDK with OpenAI
- **State Management**: React Client Components
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm package manager
- OpenAI API Key
-FRED API Key for enhanced economic data

## 🚀 Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd MSASCOUT-AI-Agent
npm install
# or
pnpm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory and add the following environment variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
FRED_API_KEY=your_fred_api_key_here 
Census key
BLS key
```

### 3. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 💡 Usage

### Investment Analysis
- Ask questions about property markets, demographics, and economic trends
- Get real-time data-backed investment recommendations
- Receive risk assessments and market outlook reports

### Report Generation
- Request "generate report" to create detailed investment reports
- Choose between PDF and DOCX formats for professional documentation
- Access comprehensive market analysis with charts and data tables

### Presentation Creation
- Use "generate slides" to create slide presentations
- Perfect for sharing investment opportunities with stakeholders

## 🏗️ Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── api/chat/route.ts   # AI chat API endpoint
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Main application page
├── components/            # Reusable UI components
│   ├── client-wrapper.tsx # Client component wrapper
│   ├── theme-provider.tsx # Theme management
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
└── public/              # Static assets
```

## 🤖 AI Capabilities

The MSASCOUT AI agent specializes in:

- **Market Analysis**: Using Census, BLS, and FRED data for accurate insights
- **ROI Calculations**: Property investment return projections
- **Demographic Trends**: Population and economic pattern analysis
- **Risk Assessment**: Market timing and investment risk evaluation
- **Data Visualization**: Charts and tables for data presentation

## 🌐 Deployment

### Vercel (Recommended)

The application is optimized for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Select Next.js as the framework preset
3. Add environment variables (OPENAI_API_KEY)
4. Deploy!

### Environment Variables for Production

- `OPENAI_API_KEY`: Required for AI functionality
- `FRED_API_KEY`: Optional for enhanced economic data
- `NODE_ENV`: Set to `production` for production builds

## 🔧 Customization

### Adding New Data Sources
You can extend the data integration by modifying the `fetchRealTimeMarketData` function in `app/api/chat/route.ts`.

### UI Customization
- Modify theme in `components/theme-provider.tsx`
- Customize UI components in `components/ui/`
- Update styling in `app/globals.css` and `tailwind.config.ts`

## 🔒 Security

- API keys are securely managed through environment variables
- Server-side API routes prevent client-side exposure of keys
- Input validation and sanitization for user queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/MSASCOUT-AI-Agent/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the React framework
- [Vercel AI SDK](https://sdk.vercel.ai) for AI integration
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- OpenAI for advanced language models
- US Census Bureau, BLS, and FRED for economic data sources
