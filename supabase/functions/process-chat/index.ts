
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

// Report credit costs by type
const reportCreditCost = {
  payment_status: 1,
  monthly: 2,
  quarterly: 3,
  yearly: 3,
  client_history: 2,
  delay_analysis: 2,
  dre: 3,
  forecast: 4
};

// Helper function to format a date as DD/MM/YYYY
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper function to get user details and plan
async function getUserDetails(userId: string) {
  try {
    // Get user credits and plan
    const { data: creditsData, error: creditsError } = await adminClient
      .from('user_invoice_credits')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .single();
      
    if (creditsError && creditsError.code !== 'PGRST116') {
      throw creditsError;
    }
    
    return creditsData;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

// Helper function to consume credits when generating financial reports
async function consumeCredits(userId: string, amount: number) {
  try {
    // Get current credits
    const { data: credits, error: creditsError } = await adminClient
      .from('user_invoice_credits')
      .select('id, credits_remaining')
      .eq('user_id', userId)
      .single();
      
    if (creditsError) throw creditsError;
    
    if (!credits || credits.credits_remaining < amount) {
      return { success: false, message: 'Insufficient credits' };
    }
    
    // Update credits
    const newTotal = credits.credits_remaining - amount;
    const { error: updateError } = await adminClient
      .from('user_invoice_credits')
      .update({ 
        credits_remaining: newTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', credits.id);
      
    if (updateError) throw updateError;
    
    return { success: true, remainingCredits: newTotal };
  } catch (error) {
    console.error('Error consuming credits:', error);
    return { success: false, message: 'Error processing credits' };
  }
}

// Helper function to generate financial reports based on type
async function generateFinancialReport(userId: string, reportType: string, params: any = {}) {
  try {
    const today = new Date();
    let startDate = params.startDate ? new Date(params.startDate) : new Date(today.getFullYear(), today.getMonth() - 3, 1);
    let endDate = params.endDate ? new Date(params.endDate) : today;
    
    let query = adminClient.from('faturas').select('*');
    
    // Limit to user's invoices unless admin and specifying all users
    if (!params.allUsers) {
      query = query.eq('user_id', userId);
    }
    
    // Apply date range
    query = query.gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());
    
    const { data: invoices, error } = await query;
    
    if (error) throw error;
    
    // Generate different reports based on type
    let report;
    switch (reportType) {
      case 'payment_status':
        report = generatePaymentStatusReport(invoices);
        break;
      case 'monthly':
        report = generateMonthlyReport(invoices);
        break;
      case 'quarterly':
        report = generateQuarterlyReport(invoices);
        break;
      case 'yearly':
        report = generateYearlyReport(invoices);
        break;
      case 'dre':
        report = generateDREReport(invoices, params);
        break;
      case 'forecast':
        report = generateForecastReport(invoices);
        break;
      case 'delay_analysis':
        report = generateDelayAnalysisReport(invoices);
        break;
      case 'client_history':
        report = await generateClientHistoryReport(userId, params.clientId);
        break;
      default:
        return { error: 'Unknown report type' };
    }
    
    // Add credit cost to report metadata
    if (report && !report.error) {
      report.creditCost = reportCreditCost[reportType as keyof typeof reportCreditCost] || 1;
      report.generatedAt = new Date();
    }
    
    return report;
  } catch (error) {
    console.error(`Error generating ${reportType} report:`, error);
    return { error: `Failed to generate ${reportType} report: ${error.message}` };
  }
}

// Payment status report generator
function generatePaymentStatusReport(invoices: any[]) {
  const statusCount: Record<string, number> = {};
  const statusAmount: Record<string, number> = {};
  let totalAmount = 0;
  
  invoices.forEach(invoice => {
    const status = invoice.status || 'unknown';
    statusCount[status] = (statusCount[status] || 0) + 1;
    statusAmount[status] = (statusAmount[status] || 0) + Number(invoice.valor);
    totalAmount += Number(invoice.valor);
  });
  
  return {
    title: 'Relatório de Status de Pagamentos',
    summary: `Total de ${invoices.length} faturas analisadas`,
    statusDistribution: Object.keys(statusCount).map(status => ({
      status,
      count: statusCount[status],
      amount: statusAmount[status].toFixed(2),
      percentage: ((statusAmount[status] / totalAmount) * 100).toFixed(1) + '%'
    })),
    totalAmount: totalAmount.toFixed(2),
  };
}

// Monthly report generator
function generateMonthlyReport(invoices: any[]) {
  const monthlyData: Record<string, { count: number, amount: number, paid: number, name: string }> = {};
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { 
        name: monthName,
        count: 0, 
        amount: 0,
        paid: 0 
      };
    }
    
    monthlyData[monthKey].count += 1;
    monthlyData[monthKey].amount += Number(invoice.valor);
    
    if (invoice.status === 'aprovado' || invoice.payment_status === 'approved') {
      monthlyData[monthKey].paid += Number(invoice.valor);
    }
  });
  
  return {
    title: 'Relatório Mensal de Faturamento',
    months: Object.keys(monthlyData).sort().map(key => ({
      period: monthlyData[key].name,
      invoices: monthlyData[key].count,
      total: monthlyData[key].amount.toFixed(2),
      paid: monthlyData[key].paid.toFixed(2),
      paymentRate: ((monthlyData[key].paid / monthlyData[key].amount) * 100).toFixed(1) + '%'
    }))
  };
}

// Quarterly report generator
function generateQuarterlyReport(invoices: any[]) {
  const quarterlyData: Record<string, { count: number, amount: number, paid: number, name: string }> = {};
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.created_at);
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const quarterKey = `${date.getFullYear()}-Q${quarter}`;
    const quarterName = `${quarter}º Trimestre de ${date.getFullYear()}`;
    
    if (!quarterlyData[quarterKey]) {
      quarterlyData[quarterKey] = { 
        name: quarterName,
        count: 0, 
        amount: 0,
        paid: 0 
      };
    }
    
    quarterlyData[quarterKey].count += 1;
    quarterlyData[quarterKey].amount += Number(invoice.valor);
    
    if (invoice.status === 'aprovado' || invoice.payment_status === 'approved') {
      quarterlyData[quarterKey].paid += Number(invoice.valor);
    }
  });
  
  return {
    title: 'Relatório Trimestral de Faturamento',
    quarters: Object.keys(quarterlyData).sort().map(key => ({
      period: quarterlyData[key].name,
      invoices: quarterlyData[key].count,
      total: quarterlyData[key].amount.toFixed(2),
      paid: quarterlyData[key].paid.toFixed(2),
      paymentRate: quarterlyData[key].amount > 0 ? 
        ((quarterlyData[key].paid / quarterlyData[key].amount) * 100).toFixed(1) + '%' : 
        '0%'
    }))
  };
}

// Yearly report generator
function generateYearlyReport(invoices: any[]) {
  const yearlyData: Record<string, { count: number, amount: number, paid: number }> = {};
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.created_at);
    const year = date.getFullYear().toString();
    
    if (!yearlyData[year]) {
      yearlyData[year] = { 
        count: 0, 
        amount: 0,
        paid: 0 
      };
    }
    
    yearlyData[year].count += 1;
    yearlyData[year].amount += Number(invoice.valor);
    
    if (invoice.status === 'aprovado' || invoice.payment_status === 'approved') {
      yearlyData[year].paid += Number(invoice.valor);
    }
  });
  
  return {
    title: 'Relatório Anual de Faturamento',
    years: Object.keys(yearlyData).sort().map(year => ({
      period: `Ano de ${year}`,
      invoices: yearlyData[year].count,
      total: yearlyData[year].amount.toFixed(2),
      paid: yearlyData[year].paid.toFixed(2),
      paymentRate: ((yearlyData[year].paid / yearlyData[year].amount) * 100).toFixed(1) + '%'
    }))
  };
}

// Client history report generator
async function generateClientHistoryReport(userId: string, clientId: string) {
  try {
    // If clientId is not provided, return error
    if (!clientId) {
      return { error: 'Client ID is required for client history report' };
    }
    
    // Get client details
    const { data: client, error: clientError } = await adminClient
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single();
      
    if (clientError) throw clientError;
    
    if (!client) {
      return { error: 'Client not found' };
    }
    
    // Get client's invoices
    const { data: invoices, error: invoicesError } = await adminClient
      .from('faturas')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (invoicesError) throw invoicesError;
    
    // Calculate statistics
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.valor), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'aprovado' || inv.payment_status === 'approved');
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + Number(inv.valor), 0);
    const paymentRate = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
    
    // Calculate average days to pay
    const daysToPayments = paidInvoices
      .filter(inv => inv.payment_date)
      .map(inv => {
        const created = new Date(inv.created_at);
        const paid = new Date(inv.payment_date);
        return Math.floor((paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      });
    
    const avgDaysToPay = daysToPayments.length > 0 
      ? daysToPayments.reduce((sum, days) => sum + days, 0) / daysToPayments.length 
      : 0;
      
    // Calculate payment delay statistics
    const delayedPayments = paidInvoices
      .filter(inv => inv.payment_date && inv.vencimento)
      .map(inv => {
        const dueDate = new Date(inv.vencimento);
        const paidDate = new Date(inv.payment_date);
        return Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      })
      .filter(delay => delay > 0);
      
    const avgDelay = delayedPayments.length > 0 
      ? delayedPayments.reduce((sum, days) => sum + days, 0) / delayedPayments.length 
      : 0;
      
    return {
      title: `Histórico do Cliente: ${client.nome}`,
      clientInfo: {
        id: client.id,
        nome: client.nome,
        email: client.email,
        whatsapp: client.whatsapp,
        cpf_cnpj: client.cpf_cnpj
      },
      summary: {
        totalInvoices,
        totalAmount: totalAmount.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        paymentRate: paymentRate.toFixed(1) + '%',
        avgDaysToPay: Math.round(avgDaysToPay),
        avgDelay: Math.round(avgDelay),
        delayedPaymentRate: paidInvoices.length > 0 
          ? ((delayedPayments.length / paidInvoices.length) * 100).toFixed(1) + '%'
          : '0%'
      },
      invoices: invoices.map(inv => ({
        id: inv.id,
        createdAt: formatDate(new Date(inv.created_at)),
        dueDate: formatDate(new Date(inv.vencimento)),
        amount: Number(inv.valor).toFixed(2),
        status: inv.status,
        description: inv.descricao,
        paidDate: inv.payment_date ? formatDate(new Date(inv.payment_date)) : null,
        paidAmount: inv.paid_amount ? Number(inv.paid_amount).toFixed(2) : null
      }))
    };
  } catch (error) {
    console.error('Error generating client history report:', error);
    return { error: `Failed to generate client history report: ${error.message}` };
  }
}

// DRE report generator
function generateDREReport(invoices: any[], params: any) {
  // Simple DRE implementation - in a real app, you would include expenses data
  const revenue = invoices.reduce((sum, inv) => sum + Number(inv.valor), 0);
  
  // Mock expense data - in real app would come from expense tables
  const expenses = revenue * 0.6; // Assuming 60% expense ratio for the mock
  const grossProfit = revenue - expenses;
  const taxes = grossProfit * 0.15; // Assuming 15% tax rate for the mock
  const netProfit = grossProfit - taxes;
  
  return {
    title: 'Demonstrativo de Resultado (DRE)',
    revenue: revenue.toFixed(2),
    expenses: expenses.toFixed(2),
    grossProfit: grossProfit.toFixed(2),
    grossMargin: ((grossProfit / revenue) * 100).toFixed(1) + '%',
    taxes: taxes.toFixed(2),
    netProfit: netProfit.toFixed(2),
    netMargin: ((netProfit / revenue) * 100).toFixed(1) + '%'
  };
}

// Forecast report generator
function generateForecastReport(invoices: any[]) {
  // Simple linear forecasting based on historical data
  const monthlyData: Record<string, number> = {};
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    
    monthlyData[monthKey] += Number(invoice.valor);
  });
  
  const months = Object.keys(monthlyData).sort();
  
  // Need at least 3 months of data for forecasting
  if (months.length < 3) {
    return {
      title: 'Previsão de Faturamento',
      forecast: null,
      error: 'Dados históricos insuficientes para previsão. Necessário pelo menos 3 meses de dados.'
    };
  }
  
  const values = months.map(month => monthlyData[month]);
  
  // Simple average growth calculation
  let growthRates = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i-1] > 0) {
      growthRates.push((values[i] - values[i-1]) / values[i-1]);
    }
  }
  
  const avgGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  
  // Generate 3-month forecast
  const forecast = [];
  const lastMonthValue = values[values.length - 1];
  const lastMonthDate = new Date(months[months.length - 1] + '-01');
  
  for (let i = 1; i <= 3; i++) {
    const forecastDate = new Date(lastMonthDate);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    
    const forecastValue = lastMonthValue * Math.pow(1 + avgGrowth, i);
    
    forecast.push({
      month: forecastDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
      forecast: forecastValue.toFixed(2),
      growthRate: (avgGrowth * 100).toFixed(1) + '%'
    });
  }
  
  return {
    title: 'Previsão de Faturamento - Próximos 3 Meses',
    historicalGrowth: (avgGrowth * 100).toFixed(1) + '%',
    forecast
  };
}

// Delay analysis report generator
function generateDelayAnalysisReport(invoices: any[]) {
  const today = new Date();
  const delayedInvoices = invoices.filter(invoice => {
    // Check if invoice is not paid and past due date
    const isPaid = invoice.status === 'aprovado' || invoice.payment_status === 'approved';
    
    if (isPaid) return false;
    
    const dueDate = new Date(invoice.vencimento);
    return dueDate < today;
  });
  
  // Calculate delay statistics
  const delayStats = delayedInvoices.map(invoice => {
    const dueDate = new Date(invoice.vencimento);
    const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: invoice.id,
      client: invoice.nome,
      amount: Number(invoice.valor).toFixed(2),
      dueDate: formatDate(dueDate),
      daysLate,
      status: invoice.status
    };
  });
  
  // Group by delay periods
  const delayGroups = {
    '1-15': { count: 0, amount: 0 },
    '16-30': { count: 0, amount: 0 },
    '31-60': { count: 0, amount: 0 },
    '60+': { count: 0, amount: 0 }
  };
  
  let totalDelayedAmount = 0;
  
  delayStats.forEach(item => {
    const days = item.daysLate;
    let group = '60+';
    
    if (days <= 15) group = '1-15';
    else if (days <= 30) group = '16-30';
    else if (days <= 60) group = '31-60';
    
    delayGroups[group].count += 1;
    delayGroups[group].amount += parseFloat(item.amount);
    totalDelayedAmount += parseFloat(item.amount);
  });
  
  return {
    title: 'Análise de Atrasos de Pagamento',
    summary: `Total de ${delayedInvoices.length} faturas em atraso`,
    totalDelayedAmount: totalDelayedAmount.toFixed(2),
    delayGroups: Object.keys(delayGroups).map(key => ({
      period: key + ' dias',
      count: delayGroups[key].count,
      amount: delayGroups[key].amount.toFixed(2),
      percentage: totalDelayedAmount > 0 
        ? ((delayGroups[key].amount / totalDelayedAmount) * 100).toFixed(1) + '%'
        : '0%'
    })),
    invoices: delayStats.sort((a, b) => b.daysLate - a.daysLate)
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract authentication header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    let userCredits = null;
    let userPlan = null;
    
    // Extract user ID and details if authenticated
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const { data: { user }, error } = await adminClient.auth.getUser(token);
        
        if (error) throw error;
        
        if (user) {
          userId = user.id;
          
          // Get user credits and plan
          const userDetails = await getUserDetails(userId);
          if (userDetails) {
            userCredits = userDetails.credits_remaining;
            userPlan = userDetails.plans;
          }
        }
      } catch (authError) {
        console.error('Auth error:', authError);
      }
    }
    
    const { message, context, conversationState } = await req.json();
    console.log('Received message:', message);
    console.log('Conversation state:', conversationState);
    console.log('User ID:', userId);
    
    // Initialize state for response
    let updatedConversationState = conversationState || { 
      mode: 'chat',
      step: 'initial',
      data: {}
    };
    let assistantResponse = '';
    
    // Handle client registration flow
    if (updatedConversationState.mode === 'client_registration') {
      // ... keep existing code for client registration
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
                  cpf_cnpj: updatedConversationState.data.cpf_cnpj,
                  user_id: userId // Now linking client to the authenticated user
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
      // ... keep existing code for invoice creation
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
              // Check if user has enough credits to create an invoice
              if (userId) {
                // Determine credit consumption based on user's plan
                let creditCost = 9; // Default for Basic plan
                
                if (userPlan) {
                  if (userPlan.name === 'Pro') {
                    creditCost = 6;
                  } else if (userPlan.name === 'Enterprise') {
                    creditCost = 5;
                  }
                }
                
                // Check if user has enough credits
                if (userCredits === null || userCredits < creditCost) {
                  assistantResponse = `❌ Você não possui créditos suficientes para gerar uma fatura. Necessário: ${creditCost} créditos.`;
                  updatedConversationState = { mode: 'chat', step: 'initial', data: {} };
                  break;
                }
                
                // Consume user credits
                await consumeCredits(userId, creditCost);
              }
              
              // Get client's full details
              const { data: clientData, error: clientError } = await adminClient
                .from('clients')
                .select('*')
                .eq('id', updatedConversationState.data.client.id)
                .single();
                
              if (clientError) throw clientError;
              
              // Insert invoice into database
              const { data, error } = await adminClient
                .from('faturas')
                .insert({
                  nome: clientData.nome,
                  email: clientData.email,
                  whatsapp: clientData.whatsapp,
                  cpf_cnpj: clientData.cpf_cnpj,
                  valor: updatedConversationState.data.valor,
                  vencimento: updatedConversationState.data.vencimento,
                  descricao: updatedConversationState.data.descricao,
                  status: 'pendente',
                  client_id: clientData.id,
                  user_id: userId || clientData.user_id // Use authenticated user or client's user
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
    // Handle financial report generation flow
    else if (updatedConversationState.mode === 'report_generation') {
      switch (updatedConversationState.step) {
        case 'report_type':
          // Parse report type from message
          const reportTypes = {
            'status': 'payment_status',
            'pagamento': 'payment_status',
            'mensal': 'monthly',
            'mês': 'monthly',
            'mes': 'monthly',
            'trimestral': 'quarterly',
            'trimestre': 'quarterly',
            'anual': 'yearly',
            'ano': 'yearly',
            'dre': 'dre',
            'demonstrativo': 'dre',
            'resultado': 'dre',
            'previsão': 'forecast',
            'previsao': 'forecast',
            'forecast': 'forecast',
            'atraso': 'delay_analysis',
            'inadimplência': 'delay_analysis',
            'inadimplencia': 'delay_analysis',
            'cliente': 'client_history',
            'histórico': 'client_history',
            'historico': 'client_history'
          };
          
          let reportType = null;
          for (const [key, value] of Object.entries(reportTypes)) {
            if (message.toLowerCase().includes(key)) {
              reportType = value;
              break;
            }
          }
          
          if (!reportType) {
            assistantResponse = 'Por favor, especifique qual tipo de relatório você deseja gerar:\n\n- Status de pagamentos\n- Relatório mensal\n- Relatório trimestral\n- Relatório anual\n- DRE (Demonstrativo de Resultado)\n- Previsão de faturamento\n- Análise de atrasos\n- Histórico de cliente';
            break;
          }
          
          updatedConversationState.data.reportType = reportType;
          
          // If client history, ask for client
          if (reportType === 'client_history') {
            updatedConversationState.step = 'client_selection';
            assistantResponse = 'Para qual cliente você deseja gerar o histórico? Digite o nome do cliente:';
            break;
          }
          
          updatedConversationState.step = 'date_range';
          
          assistantResponse = 'Para qual período você deseja gerar o relatório? Você pode especificar:\n\n- "Último mês"\n- "Últimos 3 meses"\n- "Este ano"\n- Ou um período específico como "01/01/2023 a 31/03/2023"';
          break;
          
        case 'client_selection':
          try {
            // Try to find the client by name
            const { data: clients, error } = await adminClient
              .from('clients')
              .select('id, nome, email')
              .eq('user_id', userId)
              .ilike('nome', `%${message}%`);
            
            if (error) throw error;
            
            if (clients.length === 0) {
              assistantResponse = 'Cliente não encontrado. Por favor, tente novamente com outro nome ou digite "cancelar":';
            } else if (clients.length === 1) {
              // Found exactly one client
              updatedConversationState.data.clientId = clients[0].id;
              updatedConversationState.step = 'confirm_report';
              assistantResponse = `Cliente ${clients[0].nome} selecionado. Digite "confirmar" para gerar o relatório ou "cancelar" para desistir.`;
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
          
        case 'date_range':
          // Parse date range from message
          let startDate = null;
          let endDate = new Date();
          
          const msg = message.toLowerCase();
          
          if (msg.includes('último mês') || msg.includes('ultimo mes')) {
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            startDate.setDate(1);
          } else if (msg.includes('últimos 3 meses') || msg.includes('ultimos 3 meses')) {
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 3);
            startDate.setDate(1);
          } else if (msg.includes('este ano') || msg.includes('ano atual')) {
            startDate = new Date(new Date().getFullYear(), 0, 1);
          } else if (msg.includes('a') || msg.includes('até') || msg.includes('ate')) {
            // Try to parse specific date range format DD/MM/YYYY a DD/MM/YYYY
            try {
              const dates = msg.split(/a|até|ate/).map(part => part.trim());
              
              if (dates.length === 2) {
                // Parse start date
                if (dates[0].includes('/')) {
                  const [day, month, year] = dates[0].split('/');
                  startDate = new Date(`${year}-${month}-${day}`);
                }
                
                // Parse end date
                if (dates[1].includes('/')) {
                  const [day, month, year] = dates[1].split('/');
                  endDate = new Date(`${year}-${month}-${day}`);
                }
              }
            } catch (error) {
              console.error('Error parsing date range:', error);
            }
          }
          
          // Default to last 3 months if parsing failed
          if (!startDate) {
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 3);
            startDate.setDate(1);
            
            assistantResponse = 'Não entendi o período especificado. Usando os últimos 3 meses como padrão.\n\n';
          }
          
          // Store dates in state
          updatedConversationState.data.startDate = startDate.toISOString();
          updatedConversationState.data.endDate = endDate.toISOString();
          updatedConversationState.step = 'confirm_report';
          
          assistantResponse += `Período selecionado: ${formatDate(startDate)} a ${formatDate(endDate)}.\n\nDigite "confirmar" para gerar o relatório ou "cancelar" para desistir.`;
          break;
          
        case 'confirm_report':
          if (message.toLowerCase() === 'confirmar') {
            // Check if user needs to consume credits for this report
            let canGenerateReport = true;
            
            if (userId) {
              // Check if user's plan allows this report type
              let canGenerate = true;
              let creditCost = reportCreditCost[updatedConversationState.data.reportType as keyof typeof reportCreditCost] || 1;
              
              // Enterprise plan has all reports
              // Pro plan has payment status, monthly, quarterly, client_history and delay_analysis
              // Basic plan has only payment status
              
              if (userPlan) {
                if (userPlan.name === 'Basic' && 
                    updatedConversationState.data.reportType !== 'payment_status') {
                  canGenerate = false;
                  assistantResponse = '❌ Seu plano Basic não permite gerar este tipo de relatório. Faça upgrade para Pro ou Enterprise para acessar relatórios avançados.';
                } else if (userPlan.name === 'Pro' && 
                          (updatedConversationState.data.reportType === 'dre' || 
                           updatedConversationState.data.reportType === 'forecast')) {
                  canGenerate = false;
                  assistantResponse = '❌ Seu plano Pro não permite gerar relatórios de DRE ou previsão. Faça upgrade para Enterprise para acessar esses relatórios.';
                }
                
                // If allowed, check if user has enough credits
                if (canGenerate) {
                  if (userCredits === null || userCredits < creditCost) {
                    canGenerate = false;
                    assistantResponse = `❌ Você não possui créditos suficientes para gerar este relatório. Necessário: ${creditCost} créditos.`;
                  }
                }
              }
              
              canGenerateReport = canGenerate;
              
              if (canGenerate) {
                // Consume credits
                await consumeCredits(userId, creditCost);
              }
            }
            
            if (canGenerateReport) {
              // Generate the report
              const report = await generateFinancialReport(
                userId,
                updatedConversationState.data.reportType,
                {
                  startDate: updatedConversationState.data.startDate,
                  endDate: updatedConversationState.data.endDate,
                  clientId: updatedConversationState.data.clientId
                }
              );
              
              if (report.error) {
                assistantResponse = `Erro ao gerar relatório: ${report.error}`;
              } else {
                // Format the report response based on type
                switch (updatedConversationState.data.reportType) {
                  case 'payment_status':
                    assistantResponse = `📊 ${report.title}\n\n`;
                    assistantResponse += `${report.summary}\n\n`;
                    
                    report.statusDistribution.forEach((item: any) => {
                      assistantResponse += `- ${item.status}: ${item.count} faturas (R$ ${item.amount}) - ${item.percentage}\n`;
                    });
                    
                    assistantResponse += `\nValor total: R$ ${report.totalAmount}\n`;
                    assistantResponse += `\n💡 Custo: ${report.creditCost} créditos`;
                    break;
                    
                  case 'monthly':
                    assistantResponse = `📊 ${report.title}\n\n`;
                    
                    report.months.forEach((month: any) => {
                      assistantResponse += `📅 ${month.period}\n`;
                      assistantResponse += `- Faturas emitidas: ${month.invoices}\n`;
                      assistantResponse += `- Valor total: R$ ${month.total}\n`;
                      assistantResponse += `- Valor recebido: R$ ${month.paid} (${month.paymentRate})\n\n`;
                    });
                    
                    assistantResponse += `\n💡 Custo: ${report.creditCost} créditos`;
                    break;
                    
                  case 'quarterly':
                    assistantResponse = `📊 ${report.title}\n\n`;
                    
                    report.quarters.forEach((quarter: any) => {
                      assistantResponse += `📅 ${quarter.period}\n`;
                      assistantResponse += `- Faturas emitidas: ${quarter.invoices}\n`;
                      assistantResponse += `- Valor total: R$ ${quarter.total}\n`;
                      assistantResponse += `- Valor recebido: R$ ${quarter.paid} (${quarter.paymentRate})\n\n`;
                    });
                    
                    assistantResponse += `\n💡 Custo: ${report.creditCost} créditos`;
                    break;
                    
                  case 'yearly':
                    assistantResponse = `📊 ${report.title}\n\n`;
                    
                    report.years.forEach((year: any) => {
                      assistantResponse += `📅 ${year.period}\n`;
                      assistantResponse += `- Faturas emitidas: ${year.invoices}\n`;
                      assistantResponse += `- Valor total: R$ ${year.total}\n`;
                      assistantResponse += `- Valor recebido: R$ ${year.paid} (${year.paymentRate})\n\n`;
                    });
                    
                    assistantResponse += `\n💡 Custo: ${report.creditCost} créditos`;
                    break;
                    
                  case 'dre':
                    assistantResponse = `📊 ${report.title}\n\n`;
                    assistantResponse += `📈 Receita: R$ ${report.revenue}\n`;
                    assistantResponse += `📉 Despesas: R$ ${report.expenses}\n`;
                    assistantResponse += `🔷 Lucro bruto: R$ ${report.grossProfit} (${report.grossMargin})\n`;
                    assistantResponse += `💰 Impostos: R$ ${report.taxes}\n`;
                    assistantResponse += `💵 Lucro líquido: R$ ${report.netProfit} (${report.netMargin})\n`;
                    assistantResponse += `\n💡 Custo: ${report.creditCost} créditos`;
                    break;
                    
                  case 'forecast':
                    assistantResponse = `📊 ${report.title}\n\n`;
                    
                    if (report.forecast) {
                      assistantResponse += `Taxa média de crescimento: ${report.historicalGrowth}\n\n`;
                      
                      report.forecast.forEach((item: any) => {
                        assistantResponse += `📅 ${item.month}\n`;
                        assistantResponse += `- Previsão: R$ ${item.forecast}\n`;
                      });
                      
                      assistantResponse += `\n💡 Custo: ${report.creditCost} créditos`;
                    } else {
                      assistantResponse += report.error;
                    }
                    break;
                    
                  case 'delay_analysis':
                    assistantResponse = `📊 ${report.title}\n\n`;
                    assistantResponse += `${report.summary}\n`;
                    assistantResponse += `Valor total em atraso: R$ ${report.totalDelayedAmount}\n\n`;
                    
                    report.delayGroups.forEach((group: any) => {
                      assistantResponse += `- ${group.period}: ${group.count} faturas (R$ ${group.amount}) - ${group.percentage}\n`;
                    });
                    
                    if (report.invoices.length > 0) {
                      assistantResponse += `\n🔍 Faturas mais atrasadas:\n`;
                      // Show top 5 most delayed invoices
                      const top5 = report.invoices.slice(0, 5);
                      top5.forEach((inv: any) => {
                        assistantResponse += `- ${inv.client}: R$ ${inv.amount} (${inv.daysLate} dias de atraso)\n`;
                      });
                    }
                    
                    assistantResponse += `\n💡 Custo: ${report.creditCost} créditos`;
                    break;
                    
                  case 'client_history':
                    assistantResponse = `📊 ${report.title}\n\n`;
                    assistantResponse += `👤 Cliente: ${report.clientInfo.nome}\n`;
                    assistantResponse += `📧 Email: ${report.clientInfo.email}\n`;
                    assistantResponse += `📱 WhatsApp: ${report.clientInfo.whatsapp}\n`;
                    assistantResponse += `🆔 CPF/CNPJ: ${report.clientInfo.cpf_cnpj}\n\n`;
                    
                    assistantResponse += `📈 Resumo:\n`;
                    assistantResponse += `- Total de faturas: ${report.summary.totalInvoices}\n`;
                    assistantResponse += `- Valor total: R$ ${report.summary.totalAmount}\n`;
                    assistantResponse += `- Valor pago: R$ ${report.summary.totalPaid} (${report.summary.paymentRate})\n`;
                    assistantResponse += `- Tempo médio de pagamento: ${report.summary.avgDaysToPay} dias\n`;
                    assistantResponse += `- Atraso médio: ${report.summary.avgDelay} dias\n`;
                    assistantResponse += `- Taxa de pagamentos atrasados: ${report.summary.delayedPaymentRate}\n\n`;
                    
                    assistantResponse += `🧾 Últimas faturas:\n`;
                    const recentInvoices = report.invoices.slice(0, 5);
                    recentInvoices.forEach((inv: any) => {
                      assistantResponse += `- ${inv.createdAt}: R$ ${inv.amount} (${inv.status})\n`;
                      assistantResponse += `  Vencimento: ${inv.dueDate}${inv.paidDate ? `, Pago em: ${inv.paidDate}` : ''}\n`;
                    });
                    
                    assistantResponse += `\n💡 Custo: ${report.creditCost} créditos`;
                    break;
                }
              }
            }
          } else if (message.toLowerCase() === 'cancelar') {
            assistantResponse = 'Geração de relatório cancelada.';
          } else {
            assistantResponse = 'Por favor, digite "confirmar" para gerar o relatório ou "cancelar" para desistir.';
            break;
          }
          
          // Reset conversation state
          updatedConversationState = { mode: 'chat', step: 'initial', data: {} };
          break;
          
        case 'initial':
        default:
          updatedConversationState.step = 'report_type';
          assistantResponse = 'Que tipo de relatório você deseja gerar?\n\n- Status de pagamentos\n- Relatório mensal\n- Relatório trimestral\n- Relatório anual\n- DRE (Demonstrativo de Resultado)\n- Previsão de faturamento\n- Análise de atrasos\n- Histórico de cliente';
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
      // Check if user wants to generate financial reports
      else if (message.toLowerCase().includes('relatório') || 
              message.toLowerCase().includes('relatorio') || 
              message.toLowerCase().includes('gerar dre') ||
              message.toLowerCase().includes('previsão') ||
              message.toLowerCase().includes('analise financeira')) {
        updatedConversationState = { mode: 'report_generation', step: 'initial', data: {} };
        assistantResponse = 'Vamos gerar um relatório financeiro! Que tipo de relatório você precisa?\n\n- Status de pagamentos\n- Relatório mensal\n- Relatório trimestral\n- Relatório anual\n- DRE (Demonstrativo de Resultado)\n- Previsão de faturamento\n- Análise de atrasos\n- Histórico de cliente';
      }
      else {
        // Normal chat mode - use OpenAI for responses
        const systemPrompt = `Você é o assistente virtual do PAGORA, um sistema de gestão de cobranças e financeiro.
        
        Ajude os usuários com:
        - Cadastro de novos clientes (recolhendo nome, e-mail, WhatsApp com DDD e DDI, e CPF ou CNPJ)
        - Geração de novas faturas (recolhendo cliente, valor, data de vencimento e descrição)
        - Geração de relatórios financeiros (status de pagamentos, mensais, trimestrais, anuais, DRE, previsões, análise de atrasos, histórico de clientes)
        - Consulta de status das cobranças (pendentes, aprovadas, rejeitadas)
        - Análise financeira e projeções
        
        Comandos especiais que você pode sugerir:
        - "Cadastrar novo cliente" ou "Novo cliente" - Inicia o fluxo de cadastro de cliente
        - "Gerar fatura" ou "Nova fatura" - Inicia o fluxo de geração de fatura
        - "Gerar relatório" ou "Relatório financeiro" - Inicia o fluxo de geração de relatório
        - "Ver faturas" ou "Listar faturas" - Redireciona para a página de faturas
        - "Ver clientes" ou "Listar clientes" - Redireciona para a página de clientes
        
        ${userId ? 'Usuário está autenticado.' : 'Usuário não está autenticado.'}
        ${userPlan ? `Plano do usuário: ${userPlan.name}` : ''}
        ${userCredits !== null ? `Créditos disponíveis: ${userCredits}` : ''}
        
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
