import mongoose from 'mongoose';

const randomSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  is_money_given: {
    type: Boolean,
    default: false,
  },
  razorpay_thingy_id: {
    type: String,
  },
});

export default mongoose.models.User || mongoose.model('User', randomSchema);
