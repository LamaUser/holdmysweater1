# Multi-Tool SaaS Platform

A comprehensive SaaS platform hosting multiple income-generating web tools, all served from a single Express backend. Perfect for deployment on Render's free tier.

## 🚀 Features

This platform includes **5 independent income-generating tools**:

1. **AI Content Generator** (`/content`) - Generate social media posts, blog content, and marketing copy
2. **Lead Generator** (`/leads`) - Generate business leads and export to CSV
3. **Digital Product Generator** (`/products`) - Create guides, templates, and digital products
4. **Prompt Marketplace** (`/prompts`) - Generate and browse AI prompts
5. **Trend Analyzer** (`/trends`) - Analyze industry trends and discover opportunities

## 📋 Prerequisites

- Node.js 18+ (ES Modules support)
- A free HuggingFace API key ([Get one here](https://huggingface.co/settings/tokens))

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
   Then edit `.env` and add your HuggingFace API key:
   ```
   HUGGINGFACE_API_KEY=your_actual_api_key_here
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
- Add `HUGGINGFACE_API_KEY` with your API key value
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

This project uses the **HuggingFace Inference API** (free tier available). The API key is read from `process.env.HUGGINGFACE_API_KEY`.

**Note**: If the API key is missing, the application will still run but return helpful error messages instead of crashing.

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
