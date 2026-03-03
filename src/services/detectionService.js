import { GoogleGenAI } from "@google/genai";

// Lazy initialization of the Gemini client
let genAI = null;

export const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      throw new Error("GEMINI_API_KEY is required");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export async function detectObjects(base64Image) {
  try {
    const ai = getGenAI();
    // Use the stable Gemini 2.0 Flash model
    const model = "gemini-2.0-flash";
    
    const prompt = `
      Detect objects in this image.
      Return strictly a JSON array. Do not use markdown blocks.
      Each object must have:
      - "label": string (name of object)
      - "confidence": number (0.0 to 1.0)
      - "description": string (short visual description)
      - "box_2d": [ymin, xmin, ymax, xmax] integers (scale 0-1000)

      Example: [{"label":"cat","confidence":0.9,"description":"black cat","box_2d":[100,200,500,600]}]
      Limit to 5 prominent objects.
    `;

    console.log("Sending detection request...");
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1, // Lower temperature for more deterministic JSON
      }
    });

    const text = response.text;
    console.log("Raw AI Response:", text);

    if (!text) return [];
    
    // Aggressive cleanup for JSON
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      console.error("Failed Text:", cleanText);
      // Fallback: try to find array in text
      const arrayMatch = cleanText.match(/\[.*\]/s);
      if (arrayMatch) {
        try {
          data = JSON.parse(arrayMatch[0]);
        } catch (e2) {
          return [];
        }
      } else {
        return [];
      }
    }
    
    const results = Array.isArray(data) ? data : [];
    console.log("Parsed Objects:", results);
    return results;
  } catch (error) {
    console.error("Detection Service Error:", error);
    return [];
  }
}
