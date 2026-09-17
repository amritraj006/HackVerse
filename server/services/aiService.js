import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { env } from '../config/env.js';

/**
 * Ordered list of preferred models for generateContent tasks.
 * The service will try each in order until one succeeds.
 */
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-2.5-flash-lite',
];

/**
 * Strip markdown symbols from AI output so it renders cleanly in a plain textarea.
 * Removes: ## headings, **bold**, *italic*, __underline__, `code`, --- rules, > blockquotes.
 */
function stripMarkdown(text) {
  return text
    // Remove ATX headings (# ## ### etc)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers ** __ * _
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove blockquotes
    .replace(/^>\s?/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove bare dashes used as list bullets (-- or ---)
    .replace(/^--+\s?/gm, '')
    // Collapse multiple blank lines into one
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

class AIService {
  /**
   * Check if Gemini API key is configured
   */
  isConfigured(explicitKey = '') {
    return Boolean(
      explicitKey ||
      env.geminiApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY
    );
  }

  /**
   * Resolve active API key
   */
  resolveApiKey(explicitKey = '') {
    const key =
      explicitKey ||
      env.geminiApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!key) {
      const error = new Error(
        'Gemini API key is not configured. Please set GEMINI_API_KEY in your server/.env file.'
      );
      error.statusCode = 400;
      throw error;
    }
    return key;
  }

  /**
   * Fetch and return all models available for this API key that support generateContent.
   * Calls the Google REST API directly (no LangChain needed).
   */
  async listAvailableModels(explicitKey = '') {
    const apiKey = this.resolveApiKey(explicitKey);

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      const err = new Error(`Failed to list models: ${resp.status} ${resp.statusText}. ${body}`);
      err.statusCode = resp.status;
      throw err;
    }

    const json = await resp.json();
    const all = json.models || [];

    // Filter to only models that support generateContent
    const generateContentModels = all
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => ({
        id: m.name,                          // e.g. "models/gemini-2.5-flash"
        shortId: m.name.replace('models/', ''), // e.g. "gemini-2.5-flash"
        displayName: m.displayName,
        description: m.description || '',
        inputTokenLimit: m.inputTokenLimit,
        outputTokenLimit: m.outputTokenLimit,
      }));

    return generateContentModels;
  }

  /**
   * Build a ChatGoogleGenerativeAI model instance for a specific model name
   */
  _buildModel(apiKey, modelName, temperature = 0.7, maxTokens = 2048) {
    return new ChatGoogleGenerativeAI({
      model: modelName,
      apiKey,
      temperature,
      maxOutputTokens: maxTokens,
    });
  }

  /**
   * Try to invoke a chain with fallback model support.
   * Tries the configured model first, then each model in FALLBACK_MODELS.
   * Returns { result, modelUsed }.
   */
  async _invokeWithFallback({ apiKey, preferredModel, temperature, maxTokens, chainFactory }) {
    const modelsToTry = [
      // Preferred: from .env / request param
      preferredModel,
      // Fallback chain (deduplicated)
      ...FALLBACK_MODELS.filter((m) => m !== preferredModel),
    ].filter(Boolean);

    let lastError;

    for (const modelName of modelsToTry) {
      try {
        const chatModel = this._buildModel(apiKey, modelName, temperature, maxTokens);
        const result = await chainFactory(chatModel);
        return { result, modelUsed: modelName };
      } catch (err) {
        const msg = err?.message || '';
        // Only fall through on model-not-found / quota errors, rethrow others
        const isModelError =
          msg.includes('404') ||
          msg.includes('not found') ||
          msg.includes('not supported') ||
          msg.includes('429') ||
          msg.includes('quota') ||
          msg.includes('overloaded') ||
          msg.includes('503');

        console.warn(`[AIService] Model "${modelName}" failed: ${msg.slice(0, 120)}`);
        lastError = err;

        if (!isModelError) {
          // Non-model error (auth, network, bad prompt) — fail immediately
          throw err;
        }
        // Otherwise try the next model
      }
    }

    const finalErr = new Error(
      `All AI models failed. Last error: ${lastError?.message || 'Unknown error'}`
    );
    finalErr.statusCode = 503;
    throw finalErr;
  }

  /**
   * Reusable general-purpose text generator using LangChain with fallback.
   */
  async generateText({ prompt, systemPrompt, temperature = 0.7, apiKey = '', model = '' } = {}) {
    if (!prompt || typeof prompt !== 'string') {
      const error = new Error('Prompt string is required for AI generation');
      error.statusCode = 400;
      throw error;
    }

    const resolvedKey = this.resolveApiKey(apiKey);
    const preferredModel = model || env.geminiModel || FALLBACK_MODELS[0];

    const messages = [];
    if (systemPrompt) messages.push(['system', systemPrompt]);
    messages.push(['human', '{prompt}']);
    const promptTemplate = ChatPromptTemplate.fromMessages(messages);

    const { result, modelUsed } = await this._invokeWithFallback({
      apiKey: resolvedKey,
      preferredModel,
      temperature,
      chainFactory: (chatModel) => {
        const chain = promptTemplate.pipe(chatModel);
        return chain.invoke({ prompt });
      },
    });

    const content = typeof result.content === 'string'
      ? result.content
      : JSON.stringify(result.content);

    return { content: content.trim(), modelUsed };
  }

  /**
   * Domain-specific: Generate comprehensive Hackathon Description & Rules with fallback.
   */
  async generateHackathonDescription({
    title,
    tagline = '',
    userPrompt = '',
    tags = '',
    prizePool = '',
    tone = 'professional',
    apiKey = '',
  } = {}) {
    if (!title || !title.trim()) {
      const error = new Error('Hackathon title is required to generate a description');
      error.statusCode = 400;
      throw error;
    }

    const resolvedKey = this.resolveApiKey(apiKey);
    const preferredModel = env.geminiModel || FALLBACK_MODELS[0];

    const systemPrompt = `You are a world-class hackathon organizer and technical copywriter for HackVerse, the premier hackathon platform.
Your task is to write a comprehensive, inspiring, and professional hackathon description with rules, tracks, and submission guidelines.

CRITICAL FORMATTING RULES — follow strictly:
- Output PLAIN TEXT only. No markdown whatsoever.
- Do NOT use #, ##, ###, **, *, __, --, ---, backticks, or any other markdown symbols.
- Use ALL CAPS for section headings (e.g. OVERVIEW, CHALLENGE TRACKS, SUBMISSION REQUIREMENTS).
- Use plain numbered lists (1. 2. 3.) or simple dashes with a space (- ) for bullet points.
- Separate sections with a blank line.
- Return only the ready-to-publish plain text content. No preamble, no commentary.`;

    const instructions = [`Hackathon Title: "${title.trim()}"`];
    if (tagline?.trim()) instructions.push(`Tagline / Short Summary: "${tagline.trim()}"`);
    if (prizePool?.trim()) instructions.push(`Prize Pool: "${prizePool.trim()}"`);
    if (tags) {
      const tagsStr = Array.isArray(tags) ? tags.join(', ') : tags;
      if (tagsStr.trim()) instructions.push(`Key Technologies / Domain Tags: "${tagsStr.trim()}"`);
    }
    if (userPrompt?.trim()) {
      instructions.push(`Organizer's Specific Themes, Requirements & Custom Instructions: "${userPrompt.trim()}"`);
    }

    const toneMap = {
      professional: 'balanced, professional, and polished',
      exciting: 'highly energetic, motivational, and inspiring',
      technical: 'detailed, technical, and precise — aimed at developers',
      friendly: 'warm, approachable, beginner-friendly, and welcoming',
    };
    const toneGuidance = toneMap[tone] || toneMap.professional;

    const humanMessage = `Please write a complete, high-quality Hackathon Description & Rules based on the following details:

${instructions.join('\n')}

Tone: ${toneGuidance}

Please structure the content with:
1. **Overview & Problem Statement**: What is this hackathon about and why is it exciting?
2. **Challenge Tracks / Themes**: 3–4 engaging tracks matching the technologies/domain.
3. **Submission Requirements**: Deliverables teams must submit (GitHub repo, demo video, prototype, slides).
4. **Judging Criteria**: Evaluation rubrics (Innovation, Technical Execution, Real-world Impact, Design).
5. **Rules & Eligibility**: Team size, code originality, ethical guidelines, conduct expectations.

Make it compelling, well-structured, and ready to publish.`;

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['human', '{input}'],
    ]);

    const { result, modelUsed } = await this._invokeWithFallback({
      apiKey: resolvedKey,
      preferredModel,
      temperature: 0.7,
      chainFactory: (chatModel) => {
        const chain = promptTemplate.pipe(chatModel);
        return chain.invoke({ input: humanMessage });
      },
    });

    const description = typeof result.content === 'string'
      ? result.content
      : JSON.stringify(result.content);

    return { description: stripMarkdown(description), modelUsed };
  }
}

export const aiService = new AIService();
export default aiService;
