import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connect_to_the_db from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const body_raw = await req.text();
    const signature_from_header = req.headers.get('x-razorpay-signature');

    const secret_shh = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret_shh) {
      console.error('Webhook secret is missing bro');
      return NextResponse.json({ msg: 'Server config error' }, { status: 500 });
    }

    // Verify the signature to make sure it's actually from Razorpay
    const expected_signature = crypto
      .createHmac('sha256', secret_shh)
      .update(body_raw)
      .digest('hex');

    if (expected_signature !== signature_from_header) {
      console.log('Fake webhook attempt? Signature mismatch');
      return NextResponse.json({ msg: 'Not allowed' }, { status: 400 });
    }

    const data = JSON.parse(body_raw);
    console.log('Got event:', data.event);

    // We care if payment is captured (money received)
    if (data.event === 'payment.captured' || data.event === 'order.paid') {
      await connect_to_the_db();

      // Find the order ID in the messy payload
      let razorpay_order_id = '';

      if (data.payload.payment && data.payload.payment.entity) {
         razorpay_order_id = data.payload.payment.entity.order_id;
      } else if (data.payload.order && data.payload.order.entity) {
         razorpay_order_id = data.payload.order.entity.id;
      }

      if (razorpay_order_id) {
        console.log('Looking for user with order id:', razorpay_order_id);

        const person = await User.findOne({ razorpay_thingy_id: razorpay_order_id });

        if (person) {
          if (!person.is_money_given) {
            person.is_money_given = true;
            await person.save();
            console.log('Marked user as paid via webhook (backup worked!)');
          } else {
            console.log('User was already marked paid, all good');
          }
        } else {
          console.log('No user found for this order id, weird');
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook exploded:', error);
    return NextResponse.json({ msg: 'Error processing webhook' }, { status: 500 });
  }
}
