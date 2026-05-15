"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function MyListingsPage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings")
      .then((r) => r.json())
      .then((d) => {
        setListings(d.listings || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Listings</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your properties
            </p>
          </div>
          <Link
            href="/dashboard/listings/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            + New Listing
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-5xl mb-3">🏠</div>
              <h3 className="text-lg font-semibold text-gray-700">
                No listings yet
              </h3>
              <p className="text-gray-400 text-sm mt-1 mb-4">
                Create your first listing to get started
              </p>
              <Link
                href="/dashboard/listings/new"
                className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
              >
                + Create Listing
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Property</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listings.map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{l.property.title}</p>
                      <p className="text-xs text-gray-400">{l.property.city}, {l.property.state}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        l.type === "RENT" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {l.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      ₹{l.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        l.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700" :
                        l.status === "RENTED" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/listings/${l.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/listings/${l.id}/edit`}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
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