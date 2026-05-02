import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const healthBot = {
  async chat(message: string, history: any[] = []) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: "user", parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: "You are 'Healthu', a professional and compassionate AI health assistant built into the MedVault app. Your goal is to help users understand their health, explain medical terms in simple language, and provide general wellness advice. ALWAYS include a disclaimer that you are an AI and not a doctor, and for serious concerns, they should see a professional. Be concise and use a supportive tone. Format with clear bullet points if needed.",
          temperature: 0.7,
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I'm having trouble connecting to my knowledge base. Please try again later.";
    }
  }
};
