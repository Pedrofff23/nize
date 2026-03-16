import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const workerPool = new Map();

serve(async (req) => {
  const url = new URL(req.url);
  const functionName = url.pathname.replace(/^\//, "");

  if (!functionName) {
    return new Response("missing function name in request", { status: 400 });
  }

  const workerUrl = `http://localhost:9000/${functionName}`;

  try {
    const response = await fetch(workerUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
    return response;
  } catch (err) {
    return new Response(`Function not found: ${functionName}`, { status: 404 });
  }
});
