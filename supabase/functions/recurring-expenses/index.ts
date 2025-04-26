
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
    
    // Process all active recurring expenses
    const { data: activeRecurringExpenses, error: fetchError } = await supabaseClient
      .from('gastos_recurrentes')
      .select('*')
      .eq('is_active', true);
    
    if (fetchError) throw fetchError;
    
    const today = new Date();
    const results = [];
    
    // For each active recurring expense, generate appropriate caused expenses up to today
    for (const expense of activeRecurringExpenses) {
      // Get existing caused expenses for this recurring expense
      const { data: existingCaused, error: existingError } = await supabaseClient
        .from('gastos_causados')
        .select('date')
        .eq('source_type', 'recurrente')
        .eq('source_id', expense.id)
        .order('date', { ascending: true });
      
      if (existingError) throw existingError;
      
      // Determine the next date to generate expenses from
      let nextDate;
      
      if (existingCaused && existingCaused.length > 0) {
        // If we have existing caused expenses, start from the latest one
        const sortedDates = existingCaused
          .map(e => new Date(e.date))
          .sort((a, b) => a.getTime() - b.getTime());
          
        nextDate = getNextDate(sortedDates[sortedDates.length - 1], expense.frequency);
      } else {
        // Otherwise start from the recurring expense's start date
        nextDate = new Date(expense.start_date);
      }
      
      // Generate all missing caused expenses up to today
      while (nextDate <= today && (!expense.end_date || nextDate <= new Date(expense.end_date))) {
        // Check if this specific date already has a caused expense
        const dateString = nextDate.toISOString().split('T')[0];
        const alreadyExists = existingCaused && existingCaused.some(e => 
          new Date(e.date).toISOString().split('T')[0] === dateString
        );
        
        if (!alreadyExists) {
          // Insert the new caused expense with the original expense amount (not multiplied)
          const { data: newCaused, error: insertError } = await supabaseClient
            .from('gastos_causados')
            .insert({
              source_type: 'recurrente',
              source_id: expense.id,
              date: dateString,
              description: expense.description,
              amount: expense.amount, // Use the original amount as configured, not multiplied
              category: expense.category,
              paymentmethod: expense.paymentmethod,
              currency: expense.currency,
              status: expense.is_auto_debit ? 'pagado' : 'pendiente',
              notes: expense.notes
            })
            .select()
            .single();
            
          if (insertError) throw insertError;
          results.push(newCaused);
        }
        
        nextDate = getNextDate(nextDate, expense.frequency);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated recurring expenses: ${results.length} new caused expenses created`,
        details: results 
      }),
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

// Helper function to calculate next date based on frequency
function getNextDate(currentDate: Date, frequency: string): Date {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'bimonthly':
      nextDate.setMonth(nextDate.getMonth() + 2);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'semiannual':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case 'annual':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1); // Default to monthly
  }
  
  return nextDate;
}
