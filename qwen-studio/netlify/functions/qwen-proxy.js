// netlify/functions/qwen-proxy.js
const openRouterApiKey = process.env.OPENROUTER_API_KEY;

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { message, model = "qwen/qwen3-coder:free" } = JSON.parse(event.body);

  if (!openRouterApiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OpenRouter API key not set in environment" }),
    };
  }

  // ✅ Clean model list with fallback
  const MODEL_FALLBACK = [
    "qwen/qwen3-coder:free",
    "google/gemma-7b-it:free",
    "microsoft/phi-3-mini-128k-instruct:free",
    "mistralai/mistral-7b-instruct:free"
  ];

  const modelToUse = MODEL_FALLBACK.includes(model) ? model : MODEL_FALLBACK[0];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      // ✅ Removed extra space
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://qwen-ide.netlify.app", // ✅ Removed extra space
        "X-Title": "QwenStudio"
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [{ role: "user", content: message }],
        max_tokens: 2048,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "AI request failed", 
          details: error.error?.message || response.statusText 
        })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        content: data.choices?.[0]?.message?.content || "No response generated.",
        model: data.model || modelToUse
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Request failed",
        details: err.message 
      })
    };
  }
};
