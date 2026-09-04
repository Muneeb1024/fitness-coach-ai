/**
 * Canonical Gemini configuration for FitVision AI.
 *
 * Every Gemini call in the backend (plan generation, RAG chat, insights,
 * food vision) and every admin-UI model label must reference this single
 * model id. Change it in ONE place.
 */
export const GEMINI_MODEL = 'gemini-2.5-flash';
export const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
