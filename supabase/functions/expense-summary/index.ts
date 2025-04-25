
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the auth context of the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Parse request body to get date range
    const { start_date, end_date } = await req.json();
    
    if (!start_date || !end_date) {
      throw new Error('start_date and end_date are required');
    }
    
    // Calculate various expense metrics
    
    // 1. Get total expenses
    const { data: totalExpenseData, error: totalExpenseError } = await supabaseClient
      .from('expenses')
      .select('amount')
      .gte('date', start_date)
      .lte('date', end_date);
      
    if (totalExpenseError) throw totalExpenseError;
    
    const total_expenses = totalExpenseData.reduce((sum, item) => sum + Number(item.amount), 0);
    
    // 2. Get recurring expenses
    const { data: recurringExpenseData, error: recurringExpenseError } = await supabaseClient
      .from('expenses')
      .select('amount')
      .in('category', ['Personal', 'Tecnología', 'Arriendo', 'Servicios'])
      .gte('date', start_date)
      .lte('date', end_date);
      
    if (recurringExpenseError) throw recurringExpenseError;
    
    const recurring_expenses = recurringExpenseData.reduce((sum, item) => sum + Number(item.amount), 0);
    
    // 3. Calculate variable expenses
    const variable_expenses = total_expenses - recurring_expenses;
    
    // 4. Get top category
    const { data: categoryData, error: categoryError } = await supabaseClient
      .from('expenses')
      .select('category, amount')
      .gte('date', start_date)
      .lte('date', end_date);
      
    if (categoryError) throw categoryError;
    
    const categorySums = categoryData.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) acc[category] = 0;
      acc[category] += Number(item.amount);
      return acc;
    }, {});
    
    let top_category = '';
    let top_category_amount = 0;
    
    Object.entries(categorySums).forEach(([category, amount]) => {
      if (amount > top_category_amount) {
        top_category = category;
        top_category_amount = amount as number;
      }
    });
    
    // 5. Get monthly averages and trend
    const { data: monthlyData, error: monthlyError } = await supabaseClient
      .from('expenses')
      .select('date, amount')
      .gte('date', start_date)
      .lte('date', end_date);
      
    if (monthlyError) throw monthlyError;
    
    // Group by month
    const monthlyTotals = monthlyData.reduce((acc, item) => {
      const month = item.date.substring(0, 7); // Format: YYYY-MM
      if (!acc[month]) acc[month] = 0;
      acc[month] += Number(item.amount);
      return acc;
    }, {});
    
    const monthlyAmounts = Object.values(monthlyTotals) as number[];
    const avg_monthly_expense = monthlyAmounts.length > 0 
      ? monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length
      : 0;
    
    // Calculate trend (percentage change)
    let expense_trend = 0;
    if (monthlyAmounts.length >= 2) {
      const sortedMonths = Object.keys(monthlyTotals).sort();
      const oldestMonth = sortedMonths[0];
      const newestMonth = sortedMonths[sortedMonths.length - 1];
      
      const oldestAmount = monthlyTotals[oldestMonth];
      const newestAmount = monthlyTotals[newestMonth];
      
      if (oldestAmount > 0) {
        expense_trend = ((newestAmount - oldestAmount) / oldestAmount) * 100;
      }
    }
    
    // Prepare response
    const summary = {
      total_expenses,
      recurring_expenses,
      variable_expenses,
      top_category,
      top_category_amount,
      avg_monthly_expense,
      expense_trend
    };
    
    return new Response(
      JSON.stringify(summary),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
