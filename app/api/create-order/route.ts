import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connect_to_the_db from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connect_to_the_db();

    const { email, plan } = await req.json();

    if (!email) {
      return NextResponse.json({ msg: 'Email is missing' }, { status: 400 });
    }

    let amount = 0;
    if (plan === 'basic') {
        amount = 100; // 1 Rs
    } else if (plan === 'premium') {
        amount = 200; // 2 Rs
    } else if (plan === 'advance') {
        amount = 300; // 3 Rs
    } else {
        return NextResponse.json({ msg: 'Invalid plan selected' }, { status: 400 });
    }

    let person = await User.findOne({ email });

    if (!person) {
      person = await User.create({
        email,
        is_money_given: false
      });
    }

    if (person.is_money_given) {
      return NextResponse.json({ msg: 'Already paid ' }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      user_id: person._id
    });

  } catch (err) {
    console.log("Something bad happened", err);
    return NextResponse.json({ msg: 'Server crashed or something' }, { status: 500 });
  }
}
