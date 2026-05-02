import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
          systemInstruction: "You are 'Healthu', a professional medical AI assistant within the MedVault app. Your persona is empathetic, precise, and tech-forward. \n\nCORE RULES:\n1. ALWAYS provide a clear medical disclaimer: 'I am an AI, not a doctor. This is for informational purposes only.'\n2. Explain complex medical terms simply (e.g., 'Hypertension' = 'High blood pressure').\n3. Suggest healthy habits but NEVER prescribe medication dosages.\n4. Encourage users to keep their MedVault records updated.\n5. Keep responses concise and formatted with markdown (bolding, lists).\n6. If the user mentions emergency symptoms (chest pain, trouble breathing), urge them to CALL EMERGENCY SERVICES immediately.",
          temperature: 0.7,
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I'm having a slight technical pulse-check error. Please try again in a moment, or check your internet connection.";
    }
  }
};
