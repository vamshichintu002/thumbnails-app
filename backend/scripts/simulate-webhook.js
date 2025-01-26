import { handleSuccessfulPayment } from '../services/webhook-handlers.js';

const PROFILE_ID = 'b6888d1c-eea9-4c30-9d65-973b3ff49c61';

// Test with correct email
const validEvent = {
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_' + Math.random().toString(36).substr(2, 9),
      client_reference_id: PROFILE_ID,
      customer_email: 'princechintu70@gmail.com', // This should match the profile's email
      metadata: {
        priceType: 'basic-monthly',
        userId: PROFILE_ID,
        userEmail: 'princechintu70@gmail.com'
      },
      amount_total: 1000,
      currency: 'usd',
      subscription: 'sub_' + Math.random().toString(36).substr(2, 9)
    }
  }
};

// Test with incorrect email
const invalidEvent = {
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_' + Math.random().toString(36).substr(2, 9),
      client_reference_id: PROFILE_ID,
      customer_email: 'wrong@email.com',
      metadata: {
        priceType: 'basic-monthly',
        userId: PROFILE_ID,
        userEmail: 'wrong@email.com'
      },
      amount_total: 1000,
      currency: 'usd',
      subscription: 'sub_' + Math.random().toString(36).substr(2, 9)
    }
  }
};

console.log('Testing valid payment (should succeed):');
console.log('==============================');
handleSuccessfulPayment(validEvent)
  .then(() => {
    console.log('✅ Valid payment processed successfully\n');
    
    console.log('Testing invalid payment (should fail):');
    console.log('==============================');
    return handleSuccessfulPayment(invalidEvent);
  })
  .then(() => {
    console.log('❌ Error: Invalid payment should have failed');
    process.exit(1);
  })
  .catch(error => {
    if (error.message.includes('Email mismatch')) {
      console.log('✅ Security check worked: Invalid payment was rejected');
      process.exit(0);
    } else {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    }
  }); 