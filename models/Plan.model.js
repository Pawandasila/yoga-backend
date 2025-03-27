import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Free Trial', 'Basic', 'Premium', 'Ultimate'],
    },
    planId: {
        type: String,
        required: true,
        unique: true,
        enum: ['free', 'basic', 'premium', 'ultimate'],
    },
    monthlyPrice: {
        type: Number,
        required: true,
    },
    yearlyPrice: {
        type: Number,
        required: true,
    },
    duration: {
        type: String,
        required: function () {
            return this.planId === 'free';
        },
    },
    features: [{
        type: String,
        required: true,
    }],
    notIncludedFeatures: [{
        type: String,
    }],
    maxRecordedClasses: {
        type: Number,
        required: true,
    },
    maxLiveClassesPerMonth: {
        type: Number,
        required: true,
    },
    hasPersonalInstructor: {
        type: Boolean,
        default: false,
    },
    instructorSessionsPerMonth: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
});

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    planId: {
        type: String,
        required: true,
        enum: ['free', 'basic', 'premium', 'ultimate'],
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    endDate: {
        type: Date,
        required: true,
    },
    isYearly: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active',
    },
    autoRenew: {
        type: Boolean,
        default: true,
    },
    subscriptionAmount: {  // Total amount of the subscription
        type: Number,
        required: true,
    },
    paidThrough: {  // Payment method (UPI, Card, etc.)
        type: String,
        enum: ['upi', 'card', 'wallet', 'bankTransfer'],
        required: true,
    },
    paymentMethodDetails: {  // Store card details or UPI ID
        type: Object,  // Could be card details or UPI ID
        required: function () {
            return this.paidThrough === 'card' || this.paidThrough === 'upi';
        },
        validate: {
            validator: function (value) {
                if (this.paidThrough === 'card') {
                    return value.cardType && value.cardNumber;
                }
                if (this.paidThrough === 'upi') {
                    return value.upiId;
                }
                return true;
            },
            message: 'Invalid payment method details',
        },
    },
    paymentHistory: [{
        amount: Number,
        date: Date,
        transactionId: String,
        status: {
            type: String,
            enum: ['success', 'failed', 'pending'],
        },
        paidThrough: {
            type: String,
            enum: ['upi', 'card', 'wallet', 'bankTransfer'],
        },
        paymentMethodDetails: {
            type: Object,
            validate: {
                validator: function (value) {
                    if (this.paidThrough === 'card') {
                        return value.cardType && value.cardNumber;
                    }
                    if (this.paidThrough === 'upi') {
                        return value.upiId;
                    }
                    return true;
                },
                message: 'Invalid payment method details in payment history',
            },
        },
    }],
    usageStats: {
        recordedClassesAccessed: {
            type: Number,
            default: 0,
        },
        liveClassesAttended: {
            type: Number,
            default: 0,
        },
        instructorSessionsUsed: {
            type: Number,
            default: 0,
        },
    },
    cancellationReason: String,
    cancellationDate: Date,
}, {
    timestamps: true,
});

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

export { Plan, Subscription };