export type LLMModel = {
  id: string;
  name: string;
  free: boolean;
  description?: string;
};

export const LLM_MODELS: LLMModel[] = [
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Google Gemini Flash 2.0 Experimental',
    free: true,
    description: 'Modelo experimental rápido de Google (Preestablecido)'
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 3 4B',
    free: true,
    description: 'Modelo compacto y eficiente de Google'
  },
  {
    id: 'deepseek/deepseek-chat:free',
    name: 'Deepseek 3.1',
    free: true,
    description: 'Modelo conversacional de Deepseek'
  },
  {
    id: 'deepseek/deepseek-r1-distill-llama-70b:free',
    name: 'Deepseek V3 0324',
    free: true,
    description: 'Versión mejorada de Deepseek'
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'Deepseek R1T2',
    free: true,
    description: 'Modelo de razonamiento R1T2'
  },
  {
    id: 'deepseek/deepseek-r1-distill-qwen-32b:free',
    name: 'Deepseek R1T',
    free: true,
    description: 'Modelo de razonamiento R1T'
  },
  {
    id: 'qwen/qwen-2.5-7b-instruct:free',
    name: 'Qwen3 8B',
    free: true,
    description: 'Modelo de instrucciones Qwen 8B'
  },
  {
    id: 'qwen/qwen-2.5-14b-instruct:free',
    name: 'Qwen3 14B',
    free: true,
    description: 'Modelo de instrucciones Qwen 14B'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 4 Maverick',
    free: true,
    description: 'Modelo Llama 4 experimental'
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B Instruct',
    free: true,
    description: 'Modelo compacto Llama 3.2'
  },
  {
    id: 'mistralai/mistral-small:free',
    name: 'Mistral Small 3.2 24B',
    free: true,
    description: 'Modelo compacto de Mistral AI'
  },
  {
    id: 'mistralai/mistral-nemo:free',
    name: 'Mistral Nemo',
    free: true,
    description: 'Modelo Nemo de Mistral AI'
  },
  {
    id: 'moonshot/moonshot-v1-8k:free',
    name: 'Kimi K2 0711',
    free: true,
    description: 'Modelo Moonshot/Kimi'
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    free: false,
    description: 'Modelo avanzado de Anthropic'
  },
  {
    id: 'anthropic/claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    free: false,
    description: 'Versión más reciente de Claude'
  },
  {
    id: 'openai/gpt-4o',
    name: 'OpenAI ChatGPT 5',
    free: false,
    description: 'Último modelo de OpenAI'
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'OpenAI ChatGPT 4',
    free: false,
    description: 'GPT-4 Turbo de OpenAI'
  }
];
