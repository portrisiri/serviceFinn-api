const Stripe = require("stripe")
const stripe = Stripe('sk_test_51R24odC6Qbqmxg3bSfV7eIo8qh44Fe5RplsO6pHaI9BDTqNNGEtaQgTVKqmCefH6qvLTVDTf1YrwjGdsKj9Y5ing00iNRwZ0YY');
const prisma = require('../models')
const paymentController = {};

paymentController.createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || isNaN(parseInt(bookingId))) {
      return res.status(400).json({ error: "Invalid bookingId" });
    }

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Convert amount to satangs (smallest currency unit)
    const amountInSatang = Math.round(amount * 100);

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "promptpay"], // Supports card & PromptPay
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: `Booking #${bookingId}`, // Set bookingId as name
            },
            unit_amount: amountInSatang,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173//payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173//payment-cancel`,
    });

    // Store payment details in the database
    const newPayment = await prisma.payment.create({
      data: {
        bookingId: parseInt(bookingId),
        amount: parseFloat(amount),
        paymentDate: new Date(),
        paymentStatus: "PENDING",
        transactionId: session.id,
      },
    });

    res.json({
      sessionId: session.id,
      checkoutUrl: session.url, // URL for the frontend to redirect user
      paymentId: newPayment.paymentId,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({ error: error.message });
  }
};

paymentController.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing session ID" });
    }

    // Retrieve session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Get the payment intent ID (actual transaction ID)
    const transactionId = session.payment_intent;

    if (!transactionId) {
      return res.status(400).json({ error: "No payment transaction found" });
    }

    // Retrieve payment intent details from Stripe (optional but recommended)
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    // Determine payment status
    const paymentStatus = paymentIntent.status === "succeeded" ? "PAID" : "FAILED";

    // Update the payment record with the transaction ID and status
    const updatedPayment = await prisma.payment.updateMany({
      where: { sessionId },
      data: {
        transactionId, // Store the actual Stripe transaction ID
        paymentStatus,
      },
    });

    if (updatedPayment.count === 0) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    res.json({ success: true, message: `Payment ${paymentStatus.toLowerCase()} and transaction ID stored` });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ error: error.message });
  }
};

paymentController.refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.body; // Expecting paymentId of the payment to refund

    if (!paymentId) {
      return res.status(400).json({ error: "Missing payment ID" });
    }

    // Retrieve the payment record from the database using paymentId
    const payment = await prisma.payment.findUnique({
      where: { paymentId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Ensure the payment is marked as PAID before processing a refund
    if (payment.paymentStatus !== "PAID") {
      return res.status(400).json({ error: "Payment not eligible for refund" });
    }

    // Refund the payment via Stripe (using the Stripe transactionId)
    const refund = await stripe.refunds.create({
      payment_intent: payment.transactionId, // Use the transactionId (payment intent ID)
    });

    // Update the payment status to 'REFUNDED' and store the refund transaction ID
    const updatedPayment = await prisma.payment.update({
      where: { paymentId },
      data: {
        paymentStatus: "REFUNDED",
        refundTransactionId: refund.id, // Store the refund transaction ID
      },
    });

    res.json({
      success: true,
      message: "Payment refunded successfully",
      refundTransactionId: refund.id,
    });
  } catch (error) {
    console.error("Refund error:", error);
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

// paymentController.updatePaymentStatus = async (req, res) => {
//   try {
//     const { transactionId, status } = req.body;

//     // Validate that payment status is one of the valid statuses
//     if (!["PENDING", "COMPLETED", "FAILED"].includes(status)) {
//       return res.status(400).json({ error: "Invalid payment status" });
//     }

//     // Update the payment status in the database
//     await prisma.payment.update({
//       where: { transactionId },
//       data: { paymentStatus: status },
//     });

//     res.json({ message: "Payment status updated successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
