// TODO: Install razorpay package: npm install razorpay
// import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID) {
  console.warn('⚠️  RAZORPAY_KEY_ID not set. Payment features will not work.');
}

// export const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
//   key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
// });

export const razorpay = null; // Placeholder until razorpay package is installed

export const RAZORPAY_CONFIG = {
  keyId: process.env.RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  currency: 'INR',
};
