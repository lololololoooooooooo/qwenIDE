// netlify/functions/qwen-proxy.js
const { request } = require("undici");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed",
    };
  }

  const { message, history = [] } = JSON.parse(event.body);

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterApiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OpenRouter API key not set" }),
    };
  }

  try {
    const response = await request("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${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}`,
        "Content-Type": "application/json",
       // "HTTP-Referer": "https://your-site.netlify.app", // Change to your site
        // "X-Title": "QwenStudio" // Your app name 
      },
      body: JSON.stringify({
        model: "qwen/qwen3-coder:free",
        messages: [
          ...history,
          { role: "user", content: message }
        ],
        temperature: 0.5,
        max_tokens: 2048
      })
    });

    const data = await response.body.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: data.choices[0]?.message?.content || ""
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI request failed", details: err.message })
    };
  }
};
