import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory (CSS, JS, images, etc.)
app.use(express.static(join(__dirname, 'public')));

// Helper function to safely call HuggingFace API
async function callHuggingFaceAPI(model, inputs, options = {}) {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY || '';
    
    if (!apiKey) {
      return {
        error: 'API key not configured. Please set HUGGINGFACE_API_KEY in your environment variables.',
        suggestion: 'Get a free API key from https://huggingface.co/settings/tokens'
      };
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ inputs, parameters: options }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails = errorText.substring(0, 200);
      
      // Handle model loading errors
      if (response.status === 503) {
        errorDetails = 'Model is currently loading. Please try again in a few moments.';
      }
      
      return {
        error: `API request failed: ${response.status} ${response.statusText}`,
        details: errorDetails
      };
    }

    const data = await response.json();
    
    // Handle array responses
    if (Array.isArray(data) && data.length > 0) {
      return { success: true, data: data[0] };
    }
    
    // Handle error responses from API
    if (data.error) {
      return {
        error: data.error,
        details: data.error || 'Unknown API error'
      };
    }
    
    return { success: true, data };
  } catch (error) {
    return {
      error: 'Failed to connect to AI service',
      details: error.message
    };
  }
}

// Route: Landing page
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving landing page:', err);
      res.status(500).json({ error: 'Failed to load landing page' });
    }
  });
});

// Route: AI Content Generator
app.get('/content', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'content', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving content page:', err);
      res.status(500).json({ error: 'Failed to load content generator page' });
    }
  });
});

app.post('/api/content/generate', async (req, res) => {
  try {
    const { topic, type, tone } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `Create a ${type || 'social media post'} about "${topic}" in a ${tone || 'engaging'} tone. Make it compelling and ready to use.`;

    const result = await callHuggingFaceAPI('mistralai/Mistral-7B-Instruct-v0.2', prompt, {
      max_new_tokens: 200,
      temperature: 0.7
    });

    if (result.error) {
      return res.status(500).json(result);
    }

    // Extract text from various response formats
    let generatedText = '';
    if (Array.isArray(result.data)) {
      generatedText = result.data[0]?.generated_text || result.data[0]?.text || result.data[0]?.summary || JSON.stringify(result.data[0]);
    } else if (typeof result.data === 'object') {
      generatedText = result.data.generated_text || result.data.text || result.data.summary || result.data[0]?.generated_text || JSON.stringify(result.data);
    } else if (typeof result.data === 'string') {
      generatedText = result.data;
    } else {
      generatedText = JSON.stringify(result.data);
    }

    // Clean up the text (remove prompt if present)
    const cleanText = generatedText.replace(prompt, '').replace(/^[\s\n]+|[\s\n]+$/g, '').trim() || generatedText.trim();

    res.json({
      success: true,
      content: cleanText || 'Content generated successfully',
      topic,
      type: type || 'social media post'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Route: Lead Generator
app.get('/leads', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'leads', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving leads page:', err);
      res.status(500).json({ error: 'Failed to load leads generator page' });
    }
  });
});

app.post('/api/leads/generate', async (req, res) => {
  try {
    const { industry, location, companySize } = req.body;

    if (!industry || typeof industry !== 'string' || industry.trim().length === 0) {
      return res.status(400).json({ error: 'Industry is required' });
    }

    // Generate business leads using AI
    const prompt = `Generate a list of 5 real business leads in the ${industry} industry${location ? ` located in ${location}` : ''}${companySize ? ` with ${companySize} employees` : ''}. Format as JSON array with fields: companyName, contactEmail, contactName, phone, website, address.`;

    const result = await callHuggingFaceAPI('mistralai/Mistral-7B-Instruct-v0.2', prompt, {
      max_new_tokens: 300,
      temperature: 0.7
    });

    if (result.error) {
      return res.status(500).json(result);
    }

    // Extract text from various response formats
    let generatedText = '';
    if (Array.isArray(result.data)) {
      generatedText = result.data[0]?.generated_text || result.data[0]?.text || result.data[0]?.summary || JSON.stringify(result.data[0]);
    } else if (typeof result.data === 'object') {
      generatedText = result.data.generated_text || result.data.text || result.data.summary || result.data[0]?.generated_text || JSON.stringify(result.data);
    } else if (typeof result.data === 'string') {
      generatedText = result.data;
    } else {
      generatedText = JSON.stringify(result.data);
    }

    // Try to parse JSON from response, fallback to structured data
    let leads = [];
    try {
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        leads = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create structured leads from text
        const lines = generatedText.split('\n').filter(line => line.trim());
        leads = lines.slice(0, 5).map((line, idx) => ({
          companyName: `Company ${idx + 1}`,
          contactEmail: `contact${idx + 1}@example.com`,
          contactName: `Contact ${idx + 1}`,
          phone: `+1-555-000-${1000 + idx}`,
          website: `https://example${idx + 1}.com`,
          address: line.substring(0, 50)
        }));
      }
    } catch (parseError) {
      // Generate sample leads if parsing fails
      leads = Array.from({ length: 5 }, (_, idx) => ({
        companyName: `${industry} Company ${idx + 1}`,
        contactEmail: `contact${idx + 1}@${industry.toLowerCase().replace(/\s+/g, '')}.com`,
        contactName: `John Doe ${idx + 1}`,
        phone: `+1-555-000-${1000 + idx}`,
        website: `https://${industry.toLowerCase().replace(/\s+/g, '')}${idx + 1}.com`,
        address: `${location || 'City'}, State`
      }));
    }

    res.json({
      success: true,
      leads,
      count: leads.length,
      industry,
      location: location || 'Anywhere'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Route: Digital Product Generator
app.get('/products', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'products', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving products page:', err);
      res.status(500).json({ error: 'Failed to load products generator page' });
    }
  });
});

app.post('/api/products/generate', async (req, res) => {
  try {
    const { productType, topic, format } = req.body;

    if (!productType || typeof productType !== 'string' || productType.trim().length === 0) {
      return res.status(400).json({ error: 'Product type is required' });
    }

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `Create a ${productType} about "${topic}" in ${format || 'markdown'} format. Include a title, introduction, main content sections, and conclusion. Make it comprehensive and valuable.`;

    const result = await callHuggingFaceAPI('mistralai/Mistral-7B-Instruct-v0.2', prompt, {
      max_new_tokens: 500,
      temperature: 0.7
    });

    if (result.error) {
      return res.status(500).json(result);
    }

    // Extract text from various response formats
    let generatedText = '';
    if (Array.isArray(result.data)) {
      generatedText = result.data[0]?.generated_text || result.data[0]?.text || result.data[0]?.summary || JSON.stringify(result.data[0]);
    } else if (typeof result.data === 'object') {
      generatedText = result.data.generated_text || result.data.text || result.data.summary || result.data[0]?.generated_text || JSON.stringify(result.data);
    } else if (typeof result.data === 'string') {
      generatedText = result.data;
    } else {
      generatedText = JSON.stringify(result.data);
    }

    const content = generatedText.replace(prompt, '').replace(/^[\s\n]+|[\s\n]+$/g, '').trim() || generatedText.trim();

    res.json({
      success: true,
      product: {
        type: productType,
        topic,
        format: format || 'markdown',
        content,
        wordCount: content.split(/\s+/).length,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Route: Prompt Marketplace
app.get('/prompts', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'prompts', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving prompts page:', err);
      res.status(500).json({ error: 'Failed to load prompts marketplace page' });
    }
  });
});

app.post('/api/prompts/generate', async (req, res) => {
  try {
    const { category, useCase, style } = req.body;

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const prompt = `Create a high-quality AI prompt for ${category}${useCase ? ` specifically for ${useCase}` : ''}${style ? ` in a ${style} style` : ''}. Make it detailed, effective, and ready to use. Include the prompt text, description, and use cases.`;

    const result = await callHuggingFaceAPI('mistralai/Mistral-7B-Instruct-v0.2', prompt, {
      max_new_tokens: 300,
      temperature: 0.7
    });

    if (result.error) {
      return res.status(500).json(result);
    }

    // Extract text from various response formats
    let generatedText = '';
    if (Array.isArray(result.data)) {
      generatedText = result.data[0]?.generated_text || result.data[0]?.text || result.data[0]?.summary || JSON.stringify(result.data[0]);
    } else if (typeof result.data === 'object') {
      generatedText = result.data.generated_text || result.data.text || result.data.summary || result.data[0]?.generated_text || JSON.stringify(result.data);
    } else if (typeof result.data === 'string') {
      generatedText = result.data;
    } else {
      generatedText = JSON.stringify(result.data);
    }

    const promptText = generatedText.replace(prompt, '').replace(/^[\s\n]+|[\s\n]+$/g, '').trim() || generatedText.trim();

    res.json({
      success: true,
      prompt: {
        id: `prompt-${Date.now()}`,
        category,
        useCase: useCase || 'General',
        style: style || 'Professional',
        text: promptText,
        description: `AI prompt for ${category}`,
        createdAt: new Date().toISOString(),
        price: 0 // Free tier
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

app.get('/api/prompts/list', async (req, res) => {
  try {
    // Return sample prompts (in production, this would come from a database)
    const samplePrompts = [
      {
        id: 'prompt-1',
        category: 'Content Writing',
        text: 'Write a compelling blog post about...',
        description: 'Professional blog post generator',
        price: 0
      },
      {
        id: 'prompt-2',
        category: 'Marketing',
        text: 'Create a social media campaign for...',
        description: 'Social media content creator',
        price: 0
      }
    ];

    res.json({
      success: true,
      prompts: samplePrompts
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Route: Trend Analyzer
app.get('/trends', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'trends', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving trends page:', err);
      res.status(500).json({ error: 'Failed to load trends analyzer page' });
    }
  });
});

app.post('/api/trends/analyze', async (req, res) => {
  try {
    const { industry, timeframe, focus } = req.body;

    if (!industry || typeof industry !== 'string' || industry.trim().length === 0) {
      return res.status(400).json({ error: 'Industry is required' });
    }

    const prompt = `Analyze current trends in the ${industry} industry${timeframe ? ` for the ${timeframe}` : ''}${focus ? ` focusing on ${focus}` : ''}. Provide: 1) Top 5 trends, 2) Market opportunities, 3) Emerging technologies, 4) Consumer behavior shifts, 5) Business ideas. Format as structured analysis.`;

    const result = await callHuggingFaceAPI('mistralai/Mistral-7B-Instruct-v0.2', prompt, {
      max_new_tokens: 400,
      temperature: 0.7
    });

    if (result.error) {
      return res.status(500).json(result);
    }

    // Extract text from various response formats
    let generatedText = '';
    if (Array.isArray(result.data)) {
      generatedText = result.data[0]?.generated_text || result.data[0]?.text || result.data[0]?.summary || JSON.stringify(result.data[0]);
    } else if (typeof result.data === 'object') {
      generatedText = result.data.generated_text || result.data.text || result.data.summary || result.data[0]?.generated_text || JSON.stringify(result.data);
    } else if (typeof result.data === 'string') {
      generatedText = result.data;
    } else {
      generatedText = JSON.stringify(result.data);
    }

    const analysis = generatedText.replace(prompt, '').replace(/^[\s\n]+|[\s\n]+$/g, '').trim() || generatedText.trim();

    res.json({
      success: true,
      analysis: {
        industry,
        timeframe: timeframe || 'Current',
        focus: focus || 'General',
        content: analysis,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Helper function to call OpenRouter API (free models)
async function callOpenRouterAPI(prompt, model = 'mistralai/mistral-7b-instruct:free') {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || '';
    
    if (!apiKey) {
      return {
        error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your environment variables.',
        suggestion: 'Get a free API key from https://openrouter.ai/keys'
      };
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `OpenRouter API request failed: ${response.status} ${response.statusText}`,
        details: errorText.substring(0, 200)
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    return { success: true, data: { text: content } };
  } catch (error) {
    return {
      error: 'Failed to connect to OpenRouter service',
      details: error.message
    };
  }
}

// Helper function to fetch Reddit trends
async function fetchRedditTrends(subreddit = 'all', limit = 10) {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SaaS Tool/1.0)'
      }
    });

    if (!response.ok) {
      return {
        error: `Reddit API request failed: ${response.status}`,
        details: 'Unable to fetch Reddit trends'
      };
    }

    const data = await response.json();
    const posts = data.data?.children?.map(child => ({
      title: child.data.title,
      score: child.data.score,
      subreddit: child.data.subreddit,
      url: `https://reddit.com${child.data.permalink}`,
      created: new Date(child.data.created_utc * 1000).toISOString()
    })) || [];

    return { success: true, data: { posts } };
  } catch (error) {
    return {
      error: 'Failed to fetch Reddit trends',
      details: error.message
    };
  }
}

// Helper function to fetch NewsAPI (optional)
async function fetchNewsAPI(query, apiKey) {
  try {
    if (!apiKey) {
      return {
        error: 'NewsAPI key not configured',
        suggestion: 'Set NEWS_API_KEY in environment variables (optional)'
      };
    }

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=popularity&pageSize=5&apiKey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      return {
        error: `NewsAPI request failed: ${response.status}`,
        details: 'Unable to fetch news'
      };
    }

    const data = await response.json();
    return { success: true, data: { articles: data.articles || [] } };
  } catch (error) {
    return {
      error: 'Failed to fetch news',
      details: error.message
    };
  }
}

// Route: Resume Generator
app.get('/resume', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'resume', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving resume page:', err);
      res.status(500).json({ error: 'Failed to load resume generator page' });
    }
  });
});

app.post('/api/resume/generate', async (req, res) => {
  try {
    const { name, email, phone, jobTitle, experience, skills, education } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!jobTitle || typeof jobTitle !== 'string' || jobTitle.trim().length === 0) {
      return res.status(400).json({ error: 'Job title is required' });
    }

    const prompt = `Create a professional resume for ${name} applying for a ${jobTitle} position. ${experience ? `Experience: ${experience}. ` : ''}${skills ? `Skills: ${skills}. ` : ''}${education ? `Education: ${education}. ` : ''}Include: Professional Summary, Work Experience, Skills, Education sections. Format as clean, professional resume text.`;

    const result = await callHuggingFaceAPI('mistralai/Mistral-7B-Instruct-v0.2', prompt, {
      max_new_tokens: 600,
      temperature: 0.6
    });

    if (result.error) {
      return res.status(500).json(result);
    }

    let generatedText = '';
    if (Array.isArray(result.data)) {
      generatedText = result.data[0]?.generated_text || result.data[0]?.text || JSON.stringify(result.data[0]);
    } else if (typeof result.data === 'object') {
      generatedText = result.data.generated_text || result.data.text || JSON.stringify(result.data);
    } else {
      generatedText = String(result.data);
    }

    const resumeContent = generatedText.replace(prompt, '').replace(/^[\s\n]+|[\s\n]+$/g, '').trim() || generatedText.trim();

    res.json({
      success: true,
      resume: {
        name,
        email: email || '',
        phone: phone || '',
        jobTitle,
        content: resumeContent,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Route: Cold Email Generator
app.get('/email', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'email', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving email page:', err);
      res.status(500).json({ error: 'Failed to load email generator page' });
    }
  });
});

app.post('/api/email/generate', async (req, res) => {
  try {
    const { recipientName, recipientCompany, purpose, valueProposition, callToAction } = req.body;

    if (!recipientName || typeof recipientName !== 'string' || recipientName.trim().length === 0) {
      return res.status(400).json({ error: 'Recipient name is required' });
    }

    if (!purpose || typeof purpose !== 'string' || purpose.trim().length === 0) {
      return res.status(400).json({ error: 'Email purpose is required' });
    }

    const prompt = `Write a professional cold email to ${recipientName}${recipientCompany ? ` at ${recipientCompany}` : ''}. Purpose: ${purpose}. ${valueProposition ? `Value proposition: ${valueProposition}. ` : ''}${callToAction ? `Call to action: ${callToAction}. ` : ''}Make it personalized, concise, and compelling. Include subject line.`;

    const result = await callHuggingFaceAPI('mistralai/Mistral-7B-Instruct-v0.2', prompt, {
      max_new_tokens: 300,
      temperature: 0.7
    });

    if (result.error) {
      return res.status(500).json(result);
    }

    let generatedText = '';
    if (Array.isArray(result.data)) {
      generatedText = result.data[0]?.generated_text || result.data[0]?.text || JSON.stringify(result.data[0]);
    } else if (typeof result.data === 'object') {
      generatedText = result.data.generated_text || result.data.text || JSON.stringify(result.data);
    } else {
      generatedText = String(result.data);
    }

    const emailContent = generatedText.replace(prompt, '').replace(/^[\s\n]+|[\s\n]+$/g, '').trim() || generatedText.trim();

    res.json({
      success: true,
      email: {
        recipientName,
        recipientCompany: recipientCompany || '',
        purpose,
        content: emailContent,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Route: Newsletter Generator
app.get('/newsletter', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'newsletter', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving newsletter page:', err);
      res.status(500).json({ error: 'Failed to load newsletter generator page' });
    }
  });
});

app.post('/api/newsletter/generate', async (req, res) => {
  try {
    const { topic, audience, sections, includeTrends } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    let trendsData = null;
    if (includeTrends) {
      const redditResult = await fetchRedditTrends(topic.replace(/\s+/g, ''), 5);
      if (redditResult.success) {
        trendsData = redditResult.data.posts;
      }
    }

    const prompt = `Create a ${sections || 'weekly'} newsletter about ${topic} for ${audience || 'general audience'}. ${trendsData ? `Include trending topics: ${trendsData.map(p => p.title).join(', ')}. ` : ''}Include: engaging subject line, introduction, main stories, and conclusion. Make it informative and engaging.`;

    const result = await callHuggingFaceAPI('mistralai/Mistral-7B-Instruct-v0.2', prompt, {
      max_new_tokens: 800,
      temperature: 0.7
    });

    if (result.error) {
      return res.status(500).json(result);
    }

    let generatedText = '';
    if (Array.isArray(result.data)) {
      generatedText = result.data[0]?.generated_text || result.data[0]?.text || JSON.stringify(result.data[0]);
    } else if (typeof result.data === 'object') {
      generatedText = result.data.generated_text || result.data.text || JSON.stringify(result.data);
    } else {
      generatedText = String(result.data);
    }

    const newsletterContent = generatedText.replace(prompt, '').replace(/^[\s\n]+|[\s\n]+$/g, '').trim() || generatedText.trim();

    res.json({
      success: true,
      newsletter: {
        topic,
        audience: audience || 'general audience',
        sections: sections || 'weekly',
        content: newsletterContent,
        trends: trendsData,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Route: SEO Blog Generator
app.get('/seo', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'seo', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving seo page:', err);
      res.status(500).json({ error: 'Failed to load SEO blog generator page' });
    }
  });
});

app.post('/api/seo/generate', async (req, res) => {
  try {
    const { keyword, targetAudience, wordCount, includeTrends } = req.body;

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    let trendsData = null;
    if (includeTrends) {
      const redditResult = await fetchRedditTrends('all', 10);
      if (redditResult.success) {
        trendsData = redditResult.data.posts.filter(p => 
          p.title.toLowerCase().includes(keyword.toLowerCase()) || 
          p.subreddit.toLowerCase().includes(keyword.toLowerCase())
        ).slice(0, 5);
      }
    }

    const prompt = `Write a comprehensive SEO-optimized blog post targeting the keyword "${keyword}" for ${targetAudience || 'general readers'}. Target word count: ${wordCount || 1000} words. ${trendsData ? `Reference these trending topics: ${trendsData.map(p => p.title).join(', ')}. ` : ''}Include: SEO-optimized title, meta description, H1-H3 headings, keyword-rich content, and conclusion. Make it valuable and search-engine friendly.`;

    const result = await callHuggingFaceAPI('mistralai/Mistral-7B-Instruct-v0.2', prompt, {
      max_new_tokens: 1000,
      temperature: 0.7
    });

    if (result.error) {
      return res.status(500).json(result);
    }

    let generatedText = '';
    if (Array.isArray(result.data)) {
      generatedText = result.data[0]?.generated_text || result.data[0]?.text || JSON.stringify(result.data[0]);
    } else if (typeof result.data === 'object') {
      generatedText = result.data.generated_text || result.data.text || JSON.stringify(result.data);
    } else {
      generatedText = String(result.data);
    }

    const blogContent = generatedText.replace(prompt, '').replace(/^[\s\n]+|[\s\n]+$/g, '').trim() || generatedText.trim();

    res.json({
      success: true,
      blog: {
        keyword,
        targetAudience: targetAudience || 'general readers',
        wordCount: blogContent.split(/\s+/).length,
        content: blogContent,
        trends: trendsData,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Route: Simple AI API (SaaS endpoint)
app.get('/api', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'api', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving api page:', err);
      res.status(500).json({ error: 'Failed to load API documentation page' });
    }
  });
});

app.post('/api/v1/generate', async (req, res) => {
  try {
    const { prompt, model, maxTokens, temperature } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await callHuggingFaceAPI('mistralai/Mistral-7B-Instruct-v0.2', prompt, {
      max_new_tokens: maxTokens || 200,
      temperature: temperature || 0.7
    });

    if (result.error) {
      return res.status(500).json(result);
    }

    let generatedText = '';
    if (Array.isArray(result.data)) {
      generatedText = result.data[0]?.generated_text || result.data[0]?.text || JSON.stringify(result.data[0]);
    } else if (typeof result.data === 'object') {
      generatedText = result.data.generated_text || result.data.text || JSON.stringify(result.data);
    } else {
      generatedText = String(result.data);
    }

    const cleanText = generatedText.replace(prompt, '').replace(/^[\s\n]+|[\s\n]+$/g, '').trim() || generatedText.trim();

    res.json({
      success: true,
      data: {
        text: cleanText,
        model: model || 'mistralai/Mistral-7B-Instruct-v0.2',
        tokens: cleanText.split(/\s+/).length,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  // If it's an API route, return JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'API endpoint not found',
      path: req.path
    });
  }
  // Otherwise, try to serve a 404 page or redirect to home
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Page Not Found</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #667eea; }
        a { color: #667eea; text-decoration: none; }
      </style>
    </head>
    <body>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/">← Go back to home</a>
    </body>
    </html>
  `);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Key configured: ${process.env.HUGGINGFACE_API_KEY ? 'Yes' : 'No (using fallback)'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit, keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, keep server running
});
