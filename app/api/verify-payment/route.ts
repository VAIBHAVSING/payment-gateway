import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connect_to_the_db from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connect_to_the_db();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Database update logic comes here
      await User.findOneAndUpdate(
        { email },
        {
          is_money_given: true,
          razorpay_thingy_id: razorpay_payment_id
        }
      );

      return NextResponse.json({
        msg: "success",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      return NextResponse.json({
        msg: "fail",
      }, { status: 400 });
    }

  } catch (err) {
    console.log("Error verifying payment", err);
    return NextResponse.json({ msg: 'Error verifying payment' }, { status: 500 });
  }
}
