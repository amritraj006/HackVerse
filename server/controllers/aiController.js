import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import aiService from '../services/aiService.js';
import { env } from '../config/env.js';

/**
 * @desc    Check AI service status (is API key configured)
 * @route   GET /api/v1/ai/status
 * @access  Private
 */
export const getAiStatus = asyncHandler(async (req, res) => {
  const isConfigured = aiService.isConfigured();
  return successResponse(res, 200, 'AI Service status retrieved', {
    isConfigured,
    model: env.geminiModel || 'gemini-2.5-flash',
  });
});

/**
 * @desc    List all Gemini models available for this API key that support generateContent
 * @route   GET /api/v1/ai/models
 * @access  Private
 */
export const listModels = asyncHandler(async (req, res) => {
  const models = await aiService.listAvailableModels(req.query.apiKey || '');
  return successResponse(res, 200, `Found ${models.length} models supporting generateContent`, {
    count: models.length,
    models,
  });
});

/**
 * @desc    Generate a comprehensive Hackathon Description using Gemini + LangChain (with fallback)
 * @route   POST /api/v1/ai/hackathon-description
 * @access  Private (Organizer/Admin)
 */
export const generateHackathonDescription = asyncHandler(async (req, res) => {
  const { title, tagline, userPrompt, tags, prizePool, tone, apiKey } = req.body;

  if (!title || !title.trim()) {
    return errorResponse(res, 400, 'Hackathon title is required to generate a description.');
  }

  const { description, modelUsed } = await aiService.generateHackathonDescription({
    title,
    tagline,
    userPrompt,
    tags,
    prizePool,
    tone,
    apiKey,
  });

  return successResponse(res, 200, 'Hackathon description generated successfully', {
    description,
    modelUsed,
  });
});

/**
 * @desc    Reusable general-purpose AI generation endpoint for future modules
 * @route   POST /api/v1/ai/generate
 * @access  Private
 */
export const generateGeneralText = asyncHandler(async (req, res) => {
  const { prompt, systemPrompt, temperature, apiKey, model } = req.body;

  if (!prompt || !prompt.trim()) {
    return errorResponse(res, 400, 'Prompt text is required for generation.');
  }

  const { content, modelUsed } = await aiService.generateText({
    prompt,
    systemPrompt,
    temperature,
    apiKey,
    model,
  });

  return successResponse(res, 200, 'AI response generated successfully', {
    content,
    modelUsed,
  });
});

export default {
  getAiStatus,
  listModels,
  generateHackathonDescription,
  generateGeneralText,
};
