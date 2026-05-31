export async function callGeminiApi(systemPrompt, userPrompt, apiKey, imageBase64 = null) {
  if (!apiKey) throw new Error("API Key is missing.");
  
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-3.5-flash"];
  let lastError = null;
  
  const parts = [];
  if (imageBase64) {
    if (Array.isArray(imageBase64)) {
      imageBase64.forEach(img => {
        const cleanBase64 = img.includes(",") ? img.split(",")[1] : img;
        parts.push({ inlineData: { mimeType: "image/jpeg", data: cleanBase64 } });
      });
    } else {
      const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
      parts.push({ inlineData: { mimeType: "image/jpeg", data: cleanBase64 } });
    }
  }
  parts.push({ text: userPrompt });

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts }],
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  };

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        lastError = new Error(err.error?.message || `Failed to fetch response from ${model}.`);
        console.warn(`Model ${model} failed with:`, lastError.message);
        continue; // Try next model candidate
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (e) {
      lastError = e;
      console.warn(`Model ${model} exception:`, e.message);
    }
  }

  throw lastError || new Error("All Gemini model candidates exhausted or rate-limited.");
}
