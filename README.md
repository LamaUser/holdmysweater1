# Multi-Tool SaaS Platform

A comprehensive SaaS platform hosting multiple income-generating web tools, all served from a single Express backend. Perfect for deployment on Render's free tier.

## 🚀 Features

This platform includes **10 independent income-generating tools**:

1. **AI Content Generator** (`/content`) - Generate social media posts, blog content, and marketing copy
2. **Lead Generator** (`/leads`) - Generate business leads and export to CSV
3. **Digital Product Generator** (`/products`) - Create guides, templates, and digital products
4. **Prompt Marketplace** (`/prompts`) - Generate and browse AI prompts
5. **Trend Analyzer** (`/trends`) - Analyze industry trends and discover opportunities
6. **Resume Generator** (`/resume`) - Create professional resumes and cover letters
7. **Cold Email Generator** (`/email`) - Generate personalized cold emails
8. **Newsletter Generator** (`/newsletter`) - Create engaging newsletters with trends
9. **SEO Blog Generator** (`/seo`) - Write SEO-optimized blog posts
10. **Simple AI API** (`/api`) - RESTful API for AI text generation

## 📋 Prerequisites

- Node.js 18+ (ES Modules support)
- A free HuggingFace API key ([Get one here](https://huggingface.co/settings/tokens))
- Optional: OpenRouter API key ([Get one here](https://openrouter.ai/keys))
- Optional: NewsAPI key ([Get one here](https://newsapi.org/register))

## 🛠️ Installation

1. **Clone or download this repository**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your API keys:
   ```
   HUGGINGFACE_API_KEY=your_actual_api_key_here
   OPENROUTER_API_KEY=your_openrouter_key_here  # Optional
   NEWS_API_KEY=your_newsapi_key_here  # Optional
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Local: http://localhost:3000
   - The landing page will show all available tools

## 🌐 Routes

- `/` - Landing page with links to all tools
- `/content` - AI Content Generator
- `/leads` - Lead Generator
- `/products` - Digital Product Generator
- `/prompts` - Prompt Marketplace
- `/trends` - Trend Analyzer
- `/resume` - Resume & Cover Letter Generator
- `/email` - Cold Email Generator
- `/newsletter` - Newsletter Generator
- `/seo` - SEO Blog Generator
- `/api` - Simple AI API Documentation
- `/health` - Health check endpoint

## 🚢 Deploying to Render

### Step 1: Prepare Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket

### Step 2: Create a Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure the service:
   - **Name**: `multi-tool-saas` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables

In Render dashboard, go to your service → Environment:
- Add `HUGGINGFACE_API_KEY` with your API key value (required)
- Add `OPENROUTER_API_KEY` (optional, for alternative AI models)
- Add `NEWS_API_KEY` (optional, for news features)
- `NODE_ENV` = `production` (optional)

### Step 4: Deploy

Click "Create Web Service" and Render will automatically:
- Install dependencies
- Start your server
- Provide a public URL (e.g., `https://your-app.onrender.com`)

## 🔧 API Endpoints

All endpoints return JSON responses:

### POST `/api/content/generate`
Generate AI content.
```json
{
  "topic": "Remote work benefits",
  "type": "social media post",
  "tone": "engaging"
}
```

### POST `/api/leads/generate`
Generate business leads.
```json
{
  "industry": "Technology",
  "location": "New York",
  "companySize": "11-50"
}
```

### POST `/api/products/generate`
Generate digital products.
```json
{
  "productType": "Guide",
  "topic": "How to start a blog",
  "format": "markdown"
}
```

### POST `/api/prompts/generate`
Generate AI prompts.
```json
{
  "category": "Content Writing",
  "useCase": "Blog posts",
  "style": "Professional"
}
```

### POST `/api/trends/analyze`
Analyze industry trends.
```json
{
  "industry": "Technology",
  "timeframe": "2024",
  "focus": "AI integration"
}
```

### POST `/api/resume/generate`
Generate professional resume.
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "jobTitle": "Software Engineer",
  "experience": "5 years...",
  "skills": "JavaScript, React...",
  "education": "BS Computer Science"
}
```

### POST `/api/email/generate`
Generate cold email.
```json
{
  "recipientName": "Sarah Johnson",
  "recipientCompany": "Tech Corp",
  "purpose": "Partnership opportunity",
  "valueProposition": "Increase revenue by 30%",
  "callToAction": "Schedule a call"
}
```

### POST `/api/newsletter/generate`
Generate newsletter.
```json
{
  "topic": "Technology trends",
  "audience": "Entrepreneurs",
  "sections": "weekly",
  "includeTrends": true
}
```

### POST `/api/seo/generate`
Generate SEO blog post.
```json
{
  "keyword": "best productivity apps",
  "targetAudience": "Small business owners",
  "wordCount": 1000,
  "includeTrends": true
}
```

### POST `/api/v1/generate`
Simple AI API endpoint.
```json
{
  "prompt": "Write a short story",
  "maxTokens": 200,
  "temperature": 0.7
}
```

### GET `/api/prompts/list`
List available prompts.

### GET `/health`
Health check endpoint.

## 🛡️ Error Handling

The application includes comprehensive error handling:
- All API calls are wrapped in try-catch blocks
- Missing API keys return readable errors (no crashes)
- Invalid requests return 400 status codes
- Server errors return 500 status codes
- Graceful shutdown on SIGTERM/SIGINT
- Uncaught exceptions are logged but don't crash the server

## 📁 Project Structure

```
.
├── index.js                 # Express server (main entry point)
├── package.json             # Dependencies and scripts
├── .env.example            # Environment variables template
├── README.md               # This file
└── public/                 # Static frontend files
    ├── index.html          # Landing page
    ├── content/
    │   └── index.html      # AI Content Generator
    ├── leads/
    │   └── index.html      # Lead Generator
    ├── products/
    │   └── index.html      # Digital Product Generator
    ├── prompts/
    │   └── index.html      # Prompt Marketplace
    └── trends/
        └── index.html      # Trend Analyzer
```

## 🔑 API Configuration

This project uses multiple free APIs:
- **HuggingFace Inference API** (primary) - Uses new router endpoint: `https://router.huggingface.co/hf-inference/models/{model}`
  - Model: `mistralai/Mistral-7B-Instruct`
  - Free tier available
- **OpenRouter** (optional) - Alternative AI models
- **Reddit Public API** - No authentication required
- **NewsAPI** (optional) - Free tier available

API keys are read from environment variables. If keys are missing, the application will still run but return helpful error messages instead of crashing.

**Important**: This project uses the updated HuggingFace router endpoint. The deprecated `api-inference.huggingface.co` endpoint is no longer used.

## 💰 Monetization Strategies

Each tool is designed with realistic monetization potential:

### 1. AI Content Generator
- **Freemium Model**: Free for 10 generations/month, then $9.99/month
- **Affiliate Links**: Add affiliate links to recommended tools/products
- **Brand Partnerships**: Sponsored content templates
- **API Access**: Charge per API call for integrations

### 2. Lead Generator
- **Pay-per-Lead**: $0.50-$2.00 per verified lead
- **Subscription**: $49/month for unlimited leads
- **CSV Export**: Free tier limits exports, premium unlocks unlimited
- **B2B Service**: White-label for agencies ($199/month)

### 3. Digital Product Generator
- **Marketplace**: Sell generated products on Gumroad/Etsy (30% commission)
- **Subscription**: $19/month for unlimited product generation
- **Custom Products**: $99 one-time for custom-branded products
- **Templates Library**: Premium templates pack ($29)

### 4. Prompt Marketplace
- **Prompt Packs**: Sell curated prompt bundles ($9.99-$49.99)
- **Subscription**: $14.99/month for unlimited premium prompts
- **Custom Prompts**: $4.99 per custom prompt generation
- **API Access**: Developers pay $0.01 per prompt API call

### 5. Trend Analyzer
- **Trend Reports**: Sell monthly trend reports ($29/month)
- **Premium Access**: $49/month for real-time alerts
- **API Access**: $99/month for API access to trend data
- **Consulting**: Upsell trend analysis consulting ($199/hour)

### 6. Resume Generator
- **Pay-per-Download**: $4.99 per resume download
- **Premium Templates**: $9.99/month for premium templates
- **ATS Optimization**: $19.99 for ATS-optimized resume
- **Career Services**: Upsell to resume review services ($49)

### 7. Cold Email Generator
- **B2B Service**: $99/month for unlimited emails
- **Per-Email Pricing**: $0.10 per email generated
- **Agency Plans**: $299/month for agencies (white-label)
- **Email Warm-up**: Add-on service ($49/month)

### 8. Newsletter Generator
- **Subscription**: $29/month for unlimited newsletters
- **Sponsored Content**: Add sponsored sections ($99/sponsor)
- **Newsletter Hosting**: Host newsletters for $19/month
- **Custom Branding**: $49/month for custom-branded newsletters

### 9. SEO Blog Generator
- **Per-Article**: $9.99 per SEO article
- **Monthly Plans**: $79/month for 10 articles
- **SEO Audit**: Add-on service ($149 per audit)
- **Content Marketing**: Full-service packages ($499/month)

### 10. Simple AI API
- **Usage-Based**: $0.01 per 100 tokens
- **Tiered Pricing**: 
  - Free: 10,000 tokens/month
  - Pro: $29/month for 1M tokens
  - Enterprise: Custom pricing
- **API Keys**: Charge for API access
- **Rate Limits**: Higher limits for paid tiers

### General Monetization Tips:
- **Freemium Model**: Always offer a free tier to attract users
- **Payment Integration**: Add Stripe/PayPal for subscriptions
- **Analytics**: Track usage to identify premium features
- **Email Collection**: Build email list for marketing
- **Upsells**: Offer premium features within free tools
- **Affiliate Marketing**: Add affiliate links where relevant

## 💡 Usage Tips

1. **API Key**: Get a free HuggingFace API key from their settings page
2. **Rate Limits**: Free tier has rate limits; consider upgrading for production use
3. **Customization**: Each tool's frontend can be customized in the respective `index.html` files
4. **Styling**: All tools use modern CSS with gradients and responsive design
5. **Export**: Lead Generator and Product Generator support CSV/text downloads

## 🐛 Troubleshooting

**Server won't start:**
- Check Node.js version (18+ required)
- Verify `npm install` completed successfully
- Check that port 3000 (or your PORT) is available

**API errors:**
- Verify `HUGGINGFACE_API_KEY` is set correctly
- Check API key is valid and has credits
- Review error messages in the response

**Routes not working:**
- Ensure `public/` directory structure matches routes
- Check Express static middleware is configured correctly
- Verify file paths are correct

## 📝 License

MIT License - feel free to use this project for your own SaaS applications.

## 🤝 Contributing

This is a complete, production-ready project. Feel free to:
- Add more tools
- Customize the UI
- Add database integration
- Implement user authentication
- Add payment processing

## ⚠️ Important Notes

- **No hardcoded secrets**: All sensitive data comes from environment variables
- **No database required**: All data is generated on-demand
- **No filesystem writes**: All exports happen client-side
- **Render-compatible**: Configured for Render's free tier
- **Production-ready**: Includes error handling, validation, and graceful shutdown

---

Built with ❤️ using Express.js and HuggingFace AI
