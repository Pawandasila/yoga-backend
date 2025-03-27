import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import User from "../models/user.Model.js";
import { ClassAttendance, YogaClass } from "../models/Yoga.model.js";

const razorpay = new Razorpay({
  key_id: "rzp_test_zR3Hw3haQMWYC9",
  key_secret: "W50i31GU4hsAObmu6DaTpw1f",
});

export const createPayment = async (req, res) => {
  try {
    const { userId, classId, amount } = req.body;

    if (!userId || !classId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const yogaClass = await YogaClass.findById(classId);
    if (!yogaClass) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create Razorpay order" });
    }

    const payment = new Payment({
      userId,
      classId,
      amount,
      status: "pending",
      transactionId: order.id,
      razorpayOrderId: order.id,
    });

    const savedPayment = await payment.save();
    if (!savedPayment) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to save payment" });
    }

    res
      .status(201)
      .json({ success: true, data: savedPayment, orderId: order.id });
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", "W50i31GU4hsAObmu6DaTpw1f")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const payment = await Payment.findOneAndUpdate(
        { transactionId: razorpay_order_id },
        { status: "success" },
        { new: true }
      );

      const { userId, classId } = payment;

      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { enrolledClasses: classId } },
        { new: true }
      );

      const existingRegistration = await ClassAttendance.findOne({
        yogaClass: classId,
        user: userId,
      });

      if (!existingRegistration) {
        const attendance = new ClassAttendance({
          yogaClass: classId,
          user: userId,
          status: "Registered",
        });
        await attendance.save();
      }

      return res.status(200).json({ success: true, data: payment });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ userId }).populate("classId");
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("classId")
      .populate("userId");

    const filteredPayments = payments.map((payment) => ({
      name: `${payment.userId.firstName} ${payment.userId.lastName}`,
      order_id: payment.razorpayOrderId,
      transaction_id: payment.transactionId,
      amount: payment.amount,
      status: payment.status,
      yogaClassName: payment.classId ? payment.classId.className : null,
      createdAt: payment.createdAt,
    }));

    res.status(200).json({ success: true, data: filteredPayments });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
