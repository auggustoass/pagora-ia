
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    const systemPrompt = `Você é o assistente virtual do PAGORA, um sistema de gestão de cobranças.
    
    Ajude os usuários com:
    - Cadastro de novos clientes (recolhendo nome, e-mail, WhatsApp com DDD e DDI, e CPF ou CNPJ)
    - Geração de novas faturas (recolhendo cliente, valor, data de vencimento e descrição)
    - Consulta de status das cobranças (pendentes, aprovadas, rejeitadas)
    
    Comandos especiais que você pode sugerir:
    - "Cadastrar novo cliente" ou "Novo cliente" - Abre o formulário de cadastro de cliente
    - "Gerar fatura" ou "Nova fatura" - Abre o formulário para gerar uma nova fatura
    - "Ver faturas" ou "Listar faturas" - Redireciona para a página de faturas
    - "Ver clientes" ou "Listar clientes" - Redireciona para a página de clientes
    
    Se o usuário disser algo como "preciso cadastrar um cliente", sugira usar o comando "Cadastrar novo cliente".
    Se o usuário disser algo como "preciso emitir uma fatura", sugira usar o comando "Gerar fatura".
    
    Seu tom deve ser profissional, mas amigável. Use português do Brasil.
    
    Contexto adicional: ${context || 'Nenhum contexto adicional fornecido'}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    const assistantResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: assistantResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
