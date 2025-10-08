// src/features/constants/openRouterModels.ts

export type OpenRouterModel = {
    id: string;
    name: string;
    model: string; // Nombre de la API en OpenRouter
};

export const OPENROUTER_MODELS: OpenRouterModel[] = [
    { id: 'gemini_flash_free', name: 'Gemini 2.0 Flash Free (Preestablecido)', model: 'google/gemini-2.0-flash-exp:free' },
    { id: 'llama_3_3_70b_free', name: 'Llama 3.3 70B Free', model: 'meta-llama/llama-3.3-70b-instruct:free' },
    { id: 'gemma_3_27b_free', name: 'Gemma 3 27B Free', model: 'google/gemma-3-27b-it:free' },
    { id: 'deepseek_chimera_r1t', name: 'DeepSeek Chimera R1T Free', model: 'tngtech/deepseek-r1t-chimera:free' },
    { id: 'deepseek_chimera_r1t2', name: 'Deepseek Chimera R1T2 Free', model: 'tngtech/deepseek-r1t2-chimera:free' },
    { id: 'claude_3_5_sonnet', name: 'Claude 3.5 Sonnet', model: 'anthropic/claude-3.5-sonnet' },
    { id: 'claude_3_7_sonnet', name: 'Claude 3.7 Sonnet', model: 'anthropic/claude-3.7-sonnet:beta' },
    { id: 'grok_4_fast', name: 'Grok 4 Fast', model: 'x-ai/grok-4-fast' },
    { id: 'gpt_4', name: 'OpenAi ChatGPT GPT-4', model: 'openai/gpt-4o' },
    { id: 'gpt_5', name: 'OpenAi ChatGPT GPT-5', model: 'openai/gpt-5-turbo:beta' },
    // Puedes añadir más modelos de OpenRouter si lo deseas
];

export const DEFAULT_MODEL_ID = 'gemini_flash_free';
