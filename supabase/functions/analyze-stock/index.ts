// Supabase Edge Function: analyze-stock
// Uses OpenRouter model openai/gpt-oss-20b:free
// Set OPENROUTER_API_KEY secret in your project to enable this function.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

type Point = { date: string; price: number };

type Payload = { points: Point[] };

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  } as const;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;
    if (!body?.points || !Array.isArray(body.points) || body.points.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const key = Deno.env.get("OPENROUTER_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const system =
      "You are a financial analyst. Given this stock’s daily price data for the year, provide a concise analysis: - General trend - Key highs/lows - Notable price movements - Possible causes (generic). Output 4–5 sentences max in simple English.";

    const user = `Here is the stock data as an array of {date, price}:\n${JSON.stringify(body.points.slice(-366))}`;

    const referer = req.headers.get("origin") ?? req.headers.get("referer") ?? "https://lovable.app";
    const xTitle = req.headers.get("x-title") ?? "AI Stock Visualizer";

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": xTitle,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:free",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 220,
        temperature: 0.4,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ error: `OpenRouter error: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const data = await resp.json();
    const insights: string = data?.choices?.[0]?.message?.content?.trim() ?? "No insights generated.";

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
