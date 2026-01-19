
import { GoogleGenAI } from "@google/genai";
import { PortfolioData } from "../types.ts";

/**
 * Chat with the AI assistant about the portfolio.
 */
export async function chatWithAssistant(
  userMessage: string, 
  history: {role: 'user' | 'model', parts: {text: string}[]}[],
  data: PortfolioData
) {
  try {
    const apiKey = String(process.env.API_KEY || "");
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
You are the Studio Assistant for ${data.name}, a ${data.title}.
Your goal is to answer questions from visitors about ${data.name}'s design philosophy, portfolio collections, and creative expertise.

Dynamic Context about ${data.name}:
- Bio: ${data.about}
- Expertise: ${JSON.stringify(data.skills)}
- Journey: ${JSON.stringify(data.experience)}
- Collections: ${JSON.stringify(data.projects)}
- Official Resume Resource: ${data.resumeUrl}

Core Responsibilities:
1. If the user asks for a summary of the website or ${data.name}'s work, provide a cinematic synthesis of their expertise.
2. If asked about the resume, point users to the provided URL (${data.resumeUrl}).
3. Be sophisticated, creatively inspiring, and concise.
4. Focus on design terminology: aesthetics, visual hierarchy, and brand narrative.
5. Always speak in the third person about ${data.name}.
6. Keep responses elegant and short (under 3 sentences).
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "I'm momentarily unavailable to discuss design philosophy. Please try again soon!";
  }
}

/**
 * Summarize a project based on its title, tags, and existing description.
 */
export async function summarizeWork(title: string, tags: string[], context: string) {
  try {
    const apiKey = String(process.env.API_KEY || "");
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
    Based on the following project metadata, generate 2 punchy, professional sentences for a luxury design portfolio.
    Focus on impact, user experience, and visual narrative.
    
    Project Title: ${title}
    Expertise: ${tags.join(', ')}
    Current Context: ${context || 'Focus on high-end product design and seamless interactions.'}
    
    Instruction: Generate only the 2-sentence summary. Do not include any meta-text, quotes, or labels.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a world-class creative copywriter for elite design studios.",
        temperature: 0.8,
      }
    });
    
    const text = response.text?.trim();
    return text || context;
  } catch (error) {
    console.error("Summarization Error:", error);
    return context;
  }
}

/**
 * Get AI-powered suggestions for profile sections.
 */
export async function getProfileSuggestions(type: 'bio' | 'experience' | 'skills', currentData: any) {
  try {
    const apiKey = String(process.env.API_KEY || "");
    const ai = new GoogleGenAI({ apiKey });
    
    let prompt = "";
    if (type === 'bio') {
      prompt = `Improve this designer's portfolio bio to sound more strategic, senior, and vision-driven: "${currentData}"`;
    } else if (type === 'experience') {
      prompt = `Suggest 3 high-impact, data-driven achievement bullet points for a ${currentData.role} at ${currentData.company}. Make them professional and quantified.`;
    } else if (type === 'skills') {
      prompt = `For a ${currentData.category} designer who already knows [${currentData.items.join(', ')}], suggest 5 more highly advanced industry skills or tools they should list to stand out.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a career coach for elite product designers. Provide concise, expert-level suggestions.",
        temperature: 0.8,
      }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Suggestions Error:", error);
    return "";
  }
}
