import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    PlanId: {
        type: Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failure', 'pending'], 
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const SubscriptionPayment = mongoose.model('SubscriptionPayment', paymentSchema);

export default SubscriptionPayment;