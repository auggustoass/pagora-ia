
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the admin role
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to format a date as DD/MM/YYYY
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, conversationState } = await req.json();
    console.log('Received message:', message);
    console.log('Conversation state:', conversationState);
    
    // Initialize state for response
    let updatedConversationState = conversationState || { 
      mode: 'chat',
      step: 'initial',
      data: {}
    };
    let assistantResponse = '';
    
    // Handle client registration flow
    if (updatedConversationState.mode === 'client_registration') {
      switch (updatedConversationState.step) {
        case 'name':
          // Store name and ask for email
          updatedConversationState.data.nome = message;
          updatedConversationState.step = 'email';
          assistantResponse = `Obrigado! Agora preciso do e-mail do cliente:`;
          break;
          
        case 'email':
          // Validate and store email, then ask for WhatsApp number
          if (!message.includes('@') || !message.includes('.')) {
            assistantResponse = 'Por favor, informe um e-mail válido:';
          } else {
            updatedConversationState.data.email = message;
            updatedConversationState.step = 'whatsapp';
            assistantResponse = 'Ótimo! Qual o número de WhatsApp do cliente? (com DDD e DDI, ex: +5511987654321)';
          }
          break;
          
        case 'whatsapp':
          // Store WhatsApp and ask for CPF/CNPJ
          updatedConversationState.data.whatsapp = message;
          updatedConversationState.step = 'cpf_cnpj';
          assistantResponse = 'Quase lá! Qual o CPF ou CNPJ do cliente?';
          break;
          
        case 'cpf_cnpj':
          // Store CPF/CNPJ and create the client
          updatedConversationState.data.cpf_cnpj = message;
          updatedConversationState.step = 'confirm';
          
          // Show confirmation with all data
          assistantResponse = `Confirme os dados do cliente:\n\nNome: ${updatedConversationState.data.nome}\nEmail: ${updatedConversationState.data.email}\nWhatsApp: ${updatedConversationState.data.whatsapp}\nCPF/CNPJ: ${updatedConversationState.data.cpf_cnpj}\n\nDigite "confirmar" para cadastrar o cliente ou "cancelar" para desistir.`;
          break;
          
        case 'confirm':
          if (message.toLowerCase() === 'confirmar') {
            try {
              // Insert client into database
              const { data, error } = await adminClient
                .from('clients')
                .insert({
                  nome: updatedConversationState.data.nome,
                  email: updatedConversationState.data.email,
                  whatsapp: updatedConversationState.data.whatsapp,
                  cpf_cnpj: updatedConversationState.data.cpf_cnpj
                })
                .select();
              
              if (error) throw error;
              
              assistantResponse = `✅ Cliente ${updatedConversationState.data.nome} cadastrado com sucesso!`;
              updatedConversationState = { mode: 'chat', step: 'initial', data: {} };
            } catch (error) {
              console.error('Error inserting client:', error);
              assistantResponse = `❌ Erro ao cadastrar cliente: ${error.message}. Tente novamente mais tarde.`;
              updatedConversationState = { mode: 'chat', step: 'initial', data: {} };
            }
          } else if (message.toLowerCase() === 'cancelar') {
            assistantResponse = 'Cadastro cancelado.';
            updatedConversationState = { mode: 'chat', step: 'initial', data: {} };
          } else {
            assistantResponse = 'Por favor, digite "confirmar" para cadastrar o cliente ou "cancelar" para desistir.';
          }
          break;
          
        case 'initial':
        default:
          // Start collecting client data - ask for name
          updatedConversationState.step = 'name';
          assistantResponse = 'Vamos cadastrar um novo cliente! Qual o nome do cliente?';
      }
    } 
    // Handle invoice creation flow
    else if (updatedConversationState.mode === 'invoice_creation') {
      switch (updatedConversationState.step) {
        case 'client_selection':
          try {
            // Try to find the client by name
            const { data: clients, error } = await adminClient
              .from('clients')
              .select('id, nome, email')
              .ilike('nome', `%${message}%`);
            
            if (error) throw error;
            
            if (clients.length === 0) {
              assistantResponse = 'Cliente não encontrado. Por favor, tente novamente com outro nome ou digite "cancelar":';
            } else if (clients.length === 1) {
              // Found exactly one client
              updatedConversationState.data.client = clients[0];
              updatedConversationState.step = 'amount';
              assistantResponse = `Cliente ${clients[0].nome} selecionado. Qual o valor da fatura? (apenas números, ex: 150.00)`;
            } else {
              // Multiple clients found, ask user to be more specific
              let clientsText = 'Encontrei múltiplos clientes. Por favor, escolha um digitando o nome completo:';
              clients.forEach(client => {
                clientsText += `\n- ${client.nome} (${client.email})`;
              });
              assistantResponse = clientsText;
            }
          } catch (error) {
            console.error('Error searching for clients:', error);
            assistantResponse = `Erro ao buscar clientes: ${error.message}. Tente novamente mais tarde.`;
            updatedConversationState = { mode: 'chat', step: 'initial', data: {} };
          }
          break;
          
        case 'amount':
          // Validate and store the amount, then ask for due date
          const amount = parseFloat(message.replace(',', '.'));
          if (isNaN(amount) || amount <= 0) {
            assistantResponse = 'Por favor, informe um valor válido (apenas números):';
          } else {
            updatedConversationState.data.valor = amount;
            updatedConversationState.step = 'due_date';
            assistantResponse = 'Qual é a data de vencimento? (formato DD/MM/AAAA)';
          }
          break;
          
        case 'due_date':
          // Validate and store the due date, then ask for description
          try {
            let dueDate;
            if (message.includes('/')) {
              // Parse date in format DD/MM/YYYY
              const [day, month, year] = message.split('/');
              dueDate = new Date(`${year}-${month}-${day}`);
            } else {
              // Try to parse as natural language
              dueDate = new Date(message);
            }
            
            if (isNaN(dueDate.getTime())) {
              assistantResponse = 'Por favor, informe uma data válida no formato DD/MM/AAAA:';
              break;
            }
            
            updatedConversationState.data.vencimento = dueDate.toISOString().split('T')[0];
            updatedConversationState.step = 'description';
            assistantResponse = 'Qual a descrição da fatura?';
          } catch (error) {
            assistantResponse = 'Por favor, informe uma data válida no formato DD/MM/AAAA:';
          }
          break;
          
        case 'description':
          // Store the description and confirm the invoice
          updatedConversationState.data.descricao = message;
          updatedConversationState.step = 'confirm';
          
          const dueDate = new Date(updatedConversationState.data.vencimento);
          
          // Show confirmation with all data
          assistantResponse = `Confirme os dados da fatura:\n\nCliente: ${updatedConversationState.data.client.nome}\nValor: R$ ${updatedConversationState.data.valor.toFixed(2).replace('.', ',')}\nVencimento: ${formatDate(dueDate)}\nDescrição: ${updatedConversationState.data.descricao}\n\nDigite "confirmar" para gerar a fatura ou "cancelar" para desistir.`;
          break;
          
        case 'confirm':
          if (message.toLowerCase() === 'confirmar') {
            try {
              // Insert invoice into database
              const { data, error } = await adminClient
                .from('faturas')
                .insert({
                  nome: updatedConversationState.data.client.nome,
                  email: updatedConversationState.data.client.email,
                  whatsapp: '', // This would need to be fetched from clients table
                  cpf_cnpj: '', // This would need to be fetched from clients table
                  valor: updatedConversationState.data.valor,
                  vencimento: updatedConversationState.data.vencimento,
                  descricao: updatedConversationState.data.descricao,
                  status: 'pendente',
                  client_id: updatedConversationState.data.client.id
                })
                .select();
              
              if (error) throw error;
              
              const dueDate = new Date(updatedConversationState.data.vencimento);
              assistantResponse = `✅ Fatura de R$ ${updatedConversationState.data.valor.toFixed(2).replace('.', ',')} para ${updatedConversationState.data.client.nome} com vencimento em ${formatDate(dueDate)} gerada com sucesso!`;
              updatedConversationState = { mode: 'chat', step: 'initial', data: {} };
            } catch (error) {
              console.error('Error inserting invoice:', error);
              assistantResponse = `❌ Erro ao gerar fatura: ${error.message}. Tente novamente mais tarde.`;
              updatedConversationState = { mode: 'chat', step: 'initial', data: {} };
            }
          } else if (message.toLowerCase() === 'cancelar') {
            assistantResponse = 'Geração de fatura cancelada.';
            updatedConversationState = { mode: 'chat', step: 'initial', data: {} };
          } else {
            assistantResponse = 'Por favor, digite "confirmar" para gerar a fatura ou "cancelar" para desistir.';
          }
          break;
          
        case 'initial':
        default:
          // Start collecting invoice data - ask for client
          updatedConversationState.step = 'client_selection';
          assistantResponse = 'Vamos gerar uma nova fatura! Digite o nome do cliente:';
      }
    } 
    // Handle normal chat mode
    else {
      // Check if the user wants to start client registration flow
      if (message.toLowerCase().includes('cadastrar cliente') || message.toLowerCase().includes('novo cliente')) {
        updatedConversationState = { mode: 'client_registration', step: 'initial', data: {} };
        assistantResponse = 'Vamos cadastrar um novo cliente! Qual o nome do cliente?';
      }
      // Check if the user wants to start invoice creation flow
      else if (message.toLowerCase().includes('gerar fatura') || message.toLowerCase().includes('nova fatura')) {
        updatedConversationState = { mode: 'invoice_creation', step: 'initial', data: {} };
        assistantResponse = 'Vamos gerar uma nova fatura! Digite o nome do cliente:';
      }
      else {
        // Normal chat mode - use OpenAI for responses
        const systemPrompt = `Você é o assistente virtual do PAGORA, um sistema de gestão de cobranças.
        
        Ajude os usuários com:
        - Cadastro de novos clientes (recolhendo nome, e-mail, WhatsApp com DDD e DDI, e CPF ou CNPJ)
        - Geração de novas faturas (recolhendo cliente, valor, data de vencimento e descrição)
        - Consulta de status das cobranças (pendentes, aprovadas, rejeitadas)
        
        Comandos especiais que você pode sugerir:
        - "Cadastrar novo cliente" ou "Novo cliente" - Inicia o fluxo de cadastro de cliente
        - "Gerar fatura" ou "Nova fatura" - Inicia o fluxo de geração de fatura
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
        
        assistantResponse = data.choices[0].message.content;
      }
    }

    return new Response(JSON.stringify({ 
      response: assistantResponse,
      conversationState: updatedConversationState 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
      conversationState: { mode: 'chat', step: 'initial', data: {} }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
