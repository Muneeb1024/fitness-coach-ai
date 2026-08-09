import mongoose from 'mongoose';
import { Settings } from '../models/Settings.js';
import { memoryStore } from './store.js';

/**
 * AI System Prompt Template Service
 * Single source of truth for the AI coaching system prompt. The admin
 * "AI System Prompt Editor" (AIMonitor.jsx) reads & writes this value so
 * prompt tweaks survive reloads (persisted in Mongo when connected,
 * memoryStore fallback when offline).
 */

const DEFAULT_PROMPT = `You are a certified AI Fitness & Nutrition Coach for FitVision AI.
Guidelines:
1. Calculate dynamic Mifflin-St Jeor TDEE based on height, weight, age, gender.
2. Strictly filter out all user-listed food allergies and intolerances.
3. Balance macros for optimal muscle protein synthesis (2.0g/kg).
4. Provide actionable rest intervals and exercise execution notes.
5. Include medical disclaimer reminder in response context.`;

export const getSystemPrompt = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await Settings.findOne({ key: 'aiSystemPrompt' });
      if (doc?.value) return doc.value;
    } catch (err) {
      console.warn('[PromptTemplate Mongo Warning]', err.message);
    }
  }
  return memoryStore.aiSystemPrompt || DEFAULT_PROMPT;
};

export const setSystemPrompt = async (text) => {
  const trimmed = String(text || '').trim();
  if (!trimmed) throw new Error('Prompt template cannot be empty');

  if (mongoose.connection.readyState === 1) {
    try {
      await Settings.findOneAndUpdate(
        { key: 'aiSystemPrompt' },
        { $set: { value: trimmed } },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[PromptTemplate Mongo Save Warning]', err.message);
    }
  }

  memoryStore.aiSystemPrompt = trimmed;
  return trimmed;
};

export const defaultSystemPrompt = DEFAULT_PROMPT;
