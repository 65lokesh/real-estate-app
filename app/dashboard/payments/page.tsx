"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const STATUS_COLORS: any = {
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const fetchPayments = () => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((d) => {
        setPayments(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPayments();
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, []);

  const handlePayment = async (amount: number, type: string) => {
    setPaying(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, type }),
      });

      const data = await res.json();

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "PropFind",
        description: type === "DEPOSIT" ? "Security Deposit" : "Monthly Rent",
        order_id: data.orderId,
        handler: async (response: any) => {
          // Payment successful
          await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          fetchPayments();
          alert("✅ Payment successful!");
        },
        prefill: {
          name: "Tenant",
          email: "tenant@example.com",
        },
        theme: { color: "#2563EB" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Payment failed. Try again.");
    }
    setPaying(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">Pay rent and track payment history</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium">
            ✅ Payment successful!
          </div>
        )}

        {/* Quick Pay Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-2xl mb-2">🏠</p>
            <h3 className="font-bold text-gray-800 mb-1">Pay Monthly Rent</h3>
            <p className="text-xs text-gray-400 mb-4">
              Test mode — use card 4111 1111 1111 1111
            </p>
            <button
              onClick={() => handlePayment(10000, "RENT")}
              disabled={paying}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {paying ? "Opening..." : "Pay ₹10,000 Rent"}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-2xl mb-2">🔐</p>
            <h3 className="font-bold text-gray-800 mb-1">Pay Security Deposit</h3>
            <p className="text-xs text-gray-400 mb-4">
              One-time deposit — refundable on exit
            </p>
            <button
              onClick={() => handlePayment(50000, "DEPOSIT")}
              disabled={paying}
              className="w-full bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition disabled:opacity-50"
            >
              {paying ? "Opening..." : "Pay ₹50,000 Deposit"}
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Payment History</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-4xl mb-3">💳</p>
              <h3 className="text-lg font-semibold text-gray-700">No payments yet</h3>
              <p className="text-gray-400 text-sm mt-1">
                Make your first payment above
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {p.type === "RENT" ? "🏠 Rent" :
                       p.type === "DEPOSIT" ? "🔐 Deposit" : p.type}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ₹{Number(p.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}