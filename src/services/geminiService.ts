import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type ContentType = "email" | "linkedin" | "blog";

export interface GenerationParams {
  type: ContentType;
  prompt: string;
  tone: string;
  length: "short" | "medium" | "long";
  additionalContext?: string;
}

export async function generateContent(params: GenerationParams) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to your secrets.");
  }

  const { type, prompt, tone, length, additionalContext } = params;

  const systemInstructions = {
    email: `You are a professional email writing assistant. 
            Generate a clear, effective email based on the user's request. 
            Tone: ${tone}. 
            Length: ${length}. 
            ${additionalContext ? `Additional Context: ${additionalContext}` : ""}`,
    linkedin: `You are a social media expert specializing in LinkedIn. 
               Create an engaging LinkedIn post that drives interaction. 
               Tone: ${tone}. 
               Length: ${length}. 
               Include relevant hashtags.
               ${additionalContext ? `Additional Context: ${additionalContext}` : ""}`,
    blog: `You are a professional content writer and reporter. 
           Generate a well-structured blog post or report. 
           Tone: ${tone}. 
           Length: ${length}. 
           Use markdown formatting (headers, lists, etc.).
           ${additionalContext ? `Additional Context: ${additionalContext}` : ""}`,
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: systemInstructions[type],
      temperature: 0.7,
    },
  });

  return response.text;
}
