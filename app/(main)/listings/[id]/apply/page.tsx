"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ApplyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    monthlyIncome: "",
    employerName: "",
    message: "",
    creditConsent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: id, ...form }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/dashboard/applications");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please login to apply</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1"
        >
          ← Back to listing
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            Apply for this property
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Fill in your details to send a rental application
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Monthly Income (₹)
              </label>
              <input
                type="number"
                value={form.monthlyIncome}
                onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
                placeholder="e.g. 50000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Employer / Company Name
              </label>
              <input
                type="text"
                value={form.employerName}
                onChange={(e) => setForm({ ...form, employerName: e.target.value })}
                placeholder="e.g. Infosys, Self-employed"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Message to Landlord
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                placeholder="Introduce yourself — why are you a good tenant?"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.creditConsent}
                onChange={(e) => setForm({ ...form, creditConsent: e.target.checked })}
                className="mt-1 rounded"
              />
              <span className="text-sm text-gray-600">
                I consent to a background and credit check as part of this application
              </span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm"
              >
                {loading ? "Submitting..." : "Submit Application →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}