import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import { systemPrompt } from "./config.ts";
import { getAIResponse } from "./openRouter.ts";
import type { ChatRequest } from "./types.ts";

serve(async (req) => {
  console.log('Received chat request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request = await req.json() as ChatRequest;
    const { prompt, userData, persona } = request;
    
    console.log('Processing prompt:', prompt);
    console.log('UserData:', userData);
    console.log('Persona:', persona);

    const system = systemPrompt(userData, persona, []);
    const aiResponse = await getAIResponse(prompt, system);

    return new Response(
      JSON.stringify({ content: aiResponse }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});