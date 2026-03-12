const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_CONTEXT = 'You are GuideBot, a friendly and knowledgeable AI mentorship assistant on GuideMe — a platform that connects students with mentors. Help users find mentors, give career advice, explain how the platform works, and answer any questions about mentorship, learning, and career development. Be warm, concise, and encouraging.';

// Try models in order of preference (lite has ~2x higher free quota)
const MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash'];

// Extract retry-after seconds from a 429 error message
const getRetryDelay = (msg) => {
    const match = msg.match(/retryDelay["\s:]+(\d+)s/);
    return match ? parseInt(match[1], 10) * 1000 : 5000; // default 5s
};

// Sleep helper
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

exports.getAIResponse = async (prompt, systemContext = SYSTEM_CONTEXT, maxRetries = 2) => {
    for (const modelName of MODELS) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemContext,
                });

                const result = await model.generateContent(prompt);
                return result.response.text();

            } catch (error) {
                const msg = error.message || '';
                console.error(`Gemini [${modelName}] attempt ${attempt + 1}:`, msg.substring(0, 120));

                const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests');
                const isNotFound = msg.includes('404') || msg.includes('not found');

                if (isNotFound) break; // Skip this model, try next

                if (isRateLimit) {
                    if (attempt < maxRetries) {
                        const delay = Math.min(getRetryDelay(msg), 15000); // max 15s wait
                        console.log(`Rate limited. Retrying in ${delay / 1000}s...`);
                        await sleep(delay);
                        continue; // retry same model
                    }
                    // Out of retries on this model — try next model
                    break;
                }

                if (msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
                    return "🔑 My API key seems invalid. Please get a fresh key from https://aistudio.google.com and update GEMINI_API_KEY in the backend .env file.";
                }

                // Unknown error — try next model
                break;
            }
        }
    }

    // All models exhausted
    return "⚡ I'm temporarily overloaded due to API rate limits. Please wait 1–2 minutes and try again. (The free tier allows a limited number of requests per minute.)";
};
