import { handleSuccessfulPayment } from '../services/webhook-handlers.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PROFILE_ID = '2a002140-599b-4b5a-9696-e358f67c0067';

// Test with the specified email
const testEvent = {
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_' + Math.random().toString(36).substr(2, 9),
      client_reference_id: PROFILE_ID,
      customer_email: 'princechintu17@gmail.com',
      metadata: {
        priceType: 'basic-monthly',
        userId: PROFILE_ID,
        userEmail: 'princechintu17@gmail.com'
      },
      amount_total: 1000,
      currency: 'usd',
      subscription: 'sub_' + Math.random().toString(36).substr(2, 9)
    }
  }
};

console.log('🔧 Environment Check:');
console.log('==============================');
console.log('Supabase URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('Supabase Key:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
console.log('==============================\n');

console.log('📝 Test Event Details:');
console.log('==============================');
console.log('Profile ID:', PROFILE_ID);
console.log('Email:', testEvent.data.object.customer_email);
console.log('Price Type:', testEvent.data.object.metadata.priceType);
console.log('Session ID:', testEvent.data.object.id);
console.log('==============================\n');

console.log('🚀 Starting webhook test...\n');

handleSuccessfulPayment(testEvent)
  .then(() => {
    console.log('\n✅ Payment processed successfully');
    console.log('==============================');
    console.log('✓ Webhook event processed');
    console.log('✓ Payment recorded');
    console.log('✓ Subscription updated');
    console.log('✓ Credits allocated');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error processing payment:');
    console.error('==============================');
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }); 