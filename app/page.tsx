"use client";
import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handle_payment_stuff = async () => {
    if (!email) {
      alert("Please enter email");
      return;
    }
    setIsLoading(true);
    setMessage("");

    try {
      // Create order
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.msg || "Something went wrong");
        setIsLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "My Awesome App",
        description: `Payment for ${plan} plan`,
        order_id: data.order_id,
        handler: async function (response: any) {
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: email,
            }),
          });

          if (verifyResponse.ok) {
            setMessage("Payment successful! You are now a premium member.");
          } else {
            setMessage("Payment verification failed.");
          }
          setIsLoading(false);
        },
        prefill: {
          email: email,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        setMessage("Payment failed: " + response.error.description);
        setIsLoading(false);
      });
      rzp1.open();
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something broke");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="z-10 w-full max-w-md items-center justify-between font-mono text-sm lg:flex-col">
        <h1 className="text-4xl font-bold mb-8 text-center">Pay Once App</h1>

        <div className="flex flex-col gap-4">
            <input
                type="email"
                placeholder="Enter your email"
                className="p-3 border rounded text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex gap-2 justify-center mb-2">
                <button
                    onClick={() => setPlan('basic')}
                    className={`p-2 border rounded transition-colors ${plan === 'basic' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                >
                    Basic (1₹)
                </button>
                <button
                    onClick={() => setPlan('premium')}
                    className={`p-2 border rounded transition-colors ${plan === 'premium' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                >
                    Premium (2₹)
                </button>
                <button
                    onClick={() => setPlan('advance')}
                    className={`p-2 border rounded transition-colors ${plan === 'advance' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                >
                    Advance (3₹)
                </button>
            </div>

            <button
                onClick={handle_payment_stuff}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded disabled:bg-gray-400"
            >
                {isLoading ? "Processing..." : `Pay ${plan === 'basic' ? '1' : plan === 'premium' ? '2' : '3'} INR`}
            </button>

            {message && (
                <p className="mt-4 text-center text-lg">{message}</p>
            )}
        </div>
      </div>
    </div>
  );
}
