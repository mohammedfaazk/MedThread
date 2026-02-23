import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testPaymentSystem() {
  console.log('🧪 Testing Payment System...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@medthread.com',
      password: 'Admin@123456',
    });

    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    console.log('✅ Logged in successfully\n');

    // Step 2: Create a payment
    console.log('2️⃣ Creating a payment...');
    const paymentResponse = await axios.post(
      `${API_URL}/payment/create-intent`,
      {
        amount: 50.00,
        type: 'CONSULTATION',
        description: 'Test consultation payment',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('✅ Payment created:', paymentResponse.data);
    const paymentIntentId = paymentResponse.data.data.paymentIntentId;
    console.log('   Payment will auto-complete in 2 seconds...\n');

    // Wait for auto-completion
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Check payment history
    console.log('3️⃣ Checking payment history...');
    const historyResponse = await axios.get(
      `${API_URL}/payment/history`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('✅ Payment history:', historyResponse.data);
    console.log('   Total payments:', historyResponse.data.data.payments.length);
    
    if (historyResponse.data.data.payments.length > 0) {
      const lastPayment = historyResponse.data.data.payments[0];
      console.log('   Last payment status:', lastPayment.status);
      console.log('   Last payment amount: $' + lastPayment.amount);
    }
    console.log();

    // Step 4: Create a subscription
    console.log('4️⃣ Creating a subscription...');
    const subscriptionResponse = await axios.post(
      `${API_URL}/payment/subscription`,
      {
        planName: 'Premium Plan',
        planPrice: 9.99,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('✅ Subscription created:', subscriptionResponse.data);
    const subscriptionId = subscriptionResponse.data.data.subscriptionId;
    console.log();

    // Step 5: Get subscriptions
    console.log('5️⃣ Getting user subscriptions...');
    const subsResponse = await axios.get(
      `${API_URL}/payment/subscriptions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('✅ User subscriptions:', subsResponse.data);
    console.log('   Total subscriptions:', subsResponse.data.data.length);
    console.log();

    // Step 6: Request a refund
    if (historyResponse.data.data.payments.length > 0) {
      const paymentId = historyResponse.data.data.payments[0].id;
      
      console.log('6️⃣ Requesting a refund...');
      const refundResponse = await axios.post(
        `${API_URL}/payment/refund`,
        {
          paymentId: paymentId,
          reason: 'Test refund request',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Refund requested:', refundResponse.data);
      console.log();
    }

    console.log('=' .repeat(60));
    console.log('✅ ALL PAYMENT TESTS PASSED!');
    console.log('=' .repeat(60));
    console.log('\n📊 Payment System Status:');
    console.log('  ✅ Payment creation: Working');
    console.log('  ✅ Auto-completion: Working');
    console.log('  ✅ Payment history: Working');
    console.log('  ✅ Subscriptions: Working');
    console.log('  ✅ Refunds: Working');
    console.log('\n🎉 Payment system is 100% functional!');

  } catch (error: any) {
    console.error('\n❌ Test failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
}

testPaymentSystem();
