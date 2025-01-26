import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const PROFILE_ID = 'b6888d1c-eea9-4c30-9d65-973b3ff49c61';

async function checkProfileStatus() {
  try {
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', PROFILE_ID)
      .single();

    if (profileError) throw profileError;

    // Get subscription data
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('profile_id', PROFILE_ID)
      .single();

    if (subError && subError.code !== 'PGRST116') throw subError;

    // Get recent payments
    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select('*')
      .eq('profile_id', PROFILE_ID)
      .order('created_at', { ascending: false })
      .limit(5);

    if (payError) throw payError;

    console.log('\nProfile Status:');
    console.log('==============');
    console.log('Credits:', profile.credits);
    console.log('Updated at:', profile.updated_at);

    console.log('\nSubscription Status:');
    console.log('===================');
    if (subscription) {
      console.log('Type:', subscription.subscription_type);
      console.log('Status:', subscription.subscription_status);
      console.log('Start Date:', subscription.subscription_start_date);
      console.log('End Date:', subscription.subscription_end_date);
    } else {
      console.log('No active subscription');
    }

    console.log('\nRecent Payments:');
    console.log('===============');
    if (payments.length > 0) {
      payments.forEach(payment => {
        console.log(`- Amount: $${payment.amount} (${payment.credits_added} credits)`);
        console.log(`  Status: ${payment.payment_status}`);
        console.log(`  Date: ${payment.created_at}`);
        console.log('---');
      });
    } else {
      console.log('No recent payments');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkProfileStatus(); 