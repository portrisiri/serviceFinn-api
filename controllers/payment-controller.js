const Stripe = require("stripe")
const stripe = Stripe('sk_test_51R24odC6Qbqmxg3bSfV7eIo8qh44Fe5RplsO6pHaI9BDTqNNGEtaQgTVKqmCefH6qvLTVDTf1YrwjGdsKj9Y5ing00iNRwZ0YY');

const paymentController = {};

paymentController.createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    // Convert amount to the smallest currency unit (Stripe uses Satangs for THB)
    const amountInSatang = Math.round(amount * 100);

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSatang,
      currency: "thb",
      payment_method_types: [paymentMethod], // Include PromptPay
    });

    // Store payment details in the database
    const newPayment = await prisma.payment.create({
      data: {
        bookingId: parseInt(bookingId),
        amount: parseFloat(amount),
        paymentDate: new Date(),
        paymentMethod,
        paymentStatus: "PENDING",
        transactionId: paymentIntent.id,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret, // Used by frontend for payment confirmation
      qrCodeUrl: paymentIntent.next_action?.display_qr_code?.image_url, // QR code for PromptPay
      paymentId: newPayment.paymentId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



paymentController.updatePaymentStatus = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    // Validate that payment status is one of the valid statuses
    if (!["PENDING", "COMPLETED", "FAILED"].includes(status)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    // Update the payment status in the database
    await prisma.payment.update({
      where: { transactionId },
      data: { paymentStatus: status },
    });

    res.json({ message: "Payment status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




module.exports = paymentController;


// app.post("/stripe-webhook", async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "payment_intent.succeeded") {
//     const paymentIntent = event.data.object;

//     // Update payment status in the database
//     await prisma.payment.update({
//       where: { transactionId: paymentIntent.id },
//       data: { paymentStatus: "COMPLETED" },
//     });

//     console.log("✅ Payment successful:", paymentIntent.id);
//   }

//   res.json({ received: true });
// });

// app.post("/update-payment-status", async (req, res) => {
//   try {
//     const { transactionId, status } = req.body;
//     await prisma.payment.update({
//       where: { transactionId },
//       data: { paymentStatus: status },
//     });

//     res.json({ message: "Payment status updated successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });