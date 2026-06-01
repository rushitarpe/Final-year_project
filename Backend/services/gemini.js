const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  [Gemini] GEMINI_API_KEY is not set — AI features will not work.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'missing');

// Primary model — higher free quota; fallback to flash
const PRIMARY_MODEL   = 'gemini-2.0-flash-lite';
const FALLBACK_MODEL  = 'gemini-2.0-flash';

// ─── helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const isRateLimit  = (msg) => msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests');
const isNotFound   = (msg) => msg.includes('404') || msg.includes('not found');
const isAuthError  = (msg) => msg.includes('API key') || msg.includes('401') || msg.includes('403');

const logGeminiCall = (userId, endpoint, charCount) => {
    console.log(`[Gemini] ${new Date().toISOString()} | user=${userId || 'anon'} | endpoint=${endpoint} | prompt_chars≈${charCount}`);
};

// ─── 1. Single-turn text generation (backward compat) ─────────────────────────
/**
 * Simple single-turn text generation.
 * Used for resume parsing, session summaries, career advice, etc.
 */
exports.getAIResponse = async (prompt, systemContext, maxRetries = 2, userId = null) => {
    const MODELS = [PRIMARY_MODEL, FALLBACK_MODEL];
    logGeminiCall(userId, 'getAIResponse', (prompt || '').length + (systemContext || '').length);

    for (const modelName of MODELS) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    ...(systemContext ? { systemInstruction: systemContext } : {}),
                });
                const result = await model.generateContent(prompt);
                return result.response.text();
            } catch (error) {
                const msg = error.message || '';
                console.error(`[Gemini] [${modelName}] attempt ${attempt + 1}:`, msg.substring(0, 120));

                if (isAuthError(msg)) {
                    throw new Error('GEMINI_AUTH_ERROR');
                }
                if (isNotFound(msg)) break; // try next model
                if (isRateLimit(msg)) {
                    if (attempt < maxRetries) {
                        await sleep(5000);
                        continue;
                    }
                    break;
                }
                break; // unknown error — try next model
            }
        }
    }
    throw new Error('GEMINI_RATE_LIMIT');
};

// ─── 2. Multi-turn chat (for AI chatbot) ──────────────────────────────────────
/**
 * Multi-turn conversation using startChat().
 *
 * @param {Array}  messages     - Array of { role: 'user'|'assistant'|'model', content: string }
 * @param {string} systemPrompt - Persona/context to inject as first user/model pair
 * @param {string} userId       - For logging
 */
exports.chatWithHistory = async (messages, systemPrompt, userId = null) => {
    const MODELS = [PRIMARY_MODEL, FALLBACK_MODEL];

    if (!messages || messages.length === 0) {
        throw new Error('No messages provided');
    }

    // Separate the latest user message from the history
    const allMessages = [...messages];
    const latestMessage = allMessages[allMessages.length - 1];
    const historyMessages = allMessages.slice(0, -1); // everything except the last

    // Convert history to Gemini format — map 'assistant' → 'model'
    const geminiHistory = [
        // Inject system prompt as first user/model turn pair
        {
            role: 'user',
            parts: [{ text: systemPrompt }]
        },
        {
            role: 'model',
            parts: [{ text: 'Understood. I am MentorBot, ready to assist.' }]
        },
        // Previous conversation turns
        ...historyMessages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content || msg.text || '' }]
        }))
    ];

    const latestText = latestMessage.content || latestMessage.text || '';
    logGeminiCall(userId, 'chatWithHistory', JSON.stringify(geminiHistory).length + latestText.length);

    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const chat  = model.startChat({ history: geminiHistory });
            const result = await chat.sendMessage(latestText);
            return result.response.text();
        } catch (error) {
            const msg = error.message || '';
            console.error(`[Gemini] chatWithHistory [${modelName}]:`, msg.substring(0, 150));

            if (isAuthError(msg)) throw new Error('GEMINI_AUTH_ERROR');
            if (isRateLimit(msg))  throw new Error('GEMINI_RATE_LIMIT');
            // try next model on not-found or unknown
        }
    }
    throw new Error('GEMINI_RATE_LIMIT');
};

// ─── 3. Structured content for AI matching ────────────────────────────────────
/**
 * Single-turn structured generation — used for mentor matching JSON output.
 * Low temperature for consistent, parseable JSON.
 *
 * @param {string} prompt
 * @param {string} userId
 * @returns {string} raw text (caller must parse JSON)
 */
exports.generateStructuredContent = async (prompt, userId = null) => {
    const MODELS = [PRIMARY_MODEL, FALLBACK_MODEL];
    logGeminiCall(userId, 'generateStructuredContent', prompt.length);

    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2000,
                },
            });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            const msg = error.message || '';
            console.error(`[Gemini] generateStructuredContent [${modelName}]:`, msg.substring(0, 150));

            if (isAuthError(msg)) throw new Error('GEMINI_AUTH_ERROR');
            if (isRateLimit(msg))  throw new Error('GEMINI_RATE_LIMIT');
            // try next model
        }
    }
    throw new Error('GEMINI_RATE_LIMIT');
};
