import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    razorpay_order_id: {
        type:String,
        required:true,
    },
    razor_payment_id:{
        type:String,
        required:true,
    },
    razorpay_signature: {
        type:String,
        requires: true,
    },
    createdAt: {
        type:Date,
        default: Date.now,
    }
});

export const Payment = mongoose.model("Payment",schema);