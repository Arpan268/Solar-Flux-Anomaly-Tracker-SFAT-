import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateAIReport(prompt) {
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            if (error.status === 503 || error.status === 429 || error.message?.includes("high demand")) {
                console.warn(`[Gemini API] ${modelName} is busy (503). Retrying with fallback...`);
                continue;
            }
            console.error(`Gemini API Error on ${modelName}:`, error);
            throw error;
        }
    }

    throw new Error("All Gemini models are currently experiencing high demand. Please try again shortly.");
}