import Razorpay from "razorpay";
console.log(typeof Razorpay);
try {
  new Razorpay({ key_id: "test", key_secret: "test" });
  console.log("Success");
} catch(e) {
  console.log("Error:", e.message);
}
