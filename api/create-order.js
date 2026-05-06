import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }


  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Missing Razorpay Keys in Environment Variables");
    }

    let parsedBody = req.body;
    if (typeof req.body === 'string') {
      try {
        parsedBody = JSON.parse(req.body);
      } catch (e) {
        throw new Error("Invalid JSON body");
      }
    }

    const { amount, currency = "INR", receipt } = parsedBody || {};
    
    if (!amount || isNaN(amount)) {
      throw new Error(`Invalid amount provided: ${amount}`);
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // ensure it's an integer
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    
    return res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: error.message || error.toString(),
      stack: error.stack
    });
  }
}
