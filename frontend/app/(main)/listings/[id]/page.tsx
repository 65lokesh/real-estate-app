"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setListing(d);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse text-sm">Loading property...</div>
      </div>
    );
  }

  if (!listing || listing.message) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🏚</p>
          <p className="text-gray-500">Listing not found</p>
        </div>
      </div>
    );
  }

  const photos = listing.photos || [];
  const amenities = listing.amenities || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1"
        >
          ← Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Photos + Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Photo Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {photos.length > 0 ? (
                <div>
                  {/* Main photo */}
                  <div className="h-80 bg-gray-100">
                    <img
                      src={photos[activePhoto]?.url}
                      alt="Property"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Thumbnails */}
                  {photos.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                      {photos.map((photo: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setActivePhoto(i)}
                          className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition ${
                            activePhoto === i
                              ? "border-blue-500"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-80 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-6xl">
                  🏠
                </div>
              )}
            </div>

            {/* Title + Basic Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      listing.type === "RENT"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {listing.type === "RENT" ? "For Rent" : "For Sale"}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      {listing.property?.type}
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-gray-900">
                    {listing.property?.title}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    📍 {listing.property?.address}, {listing.property?.city}, {listing.property?.state}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-extrabold text-blue-600">
                    ₹{listing.price?.toLocaleString("en-IN")}
                  </p>
                  {listing.type === "RENT" && (
                    <p className="text-xs text-gray-400">/month</p>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100 my-4">
                <div className="text-center">
                  <p className="text-2xl">🛏</p>
                  <p className="text-lg font-bold text-gray-800">{listing.bedrooms}</p>
                  <p className="text-xs text-gray-400">Bedrooms</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl">🚿</p>
                  <p className="text-lg font-bold text-gray-800">{listing.bathrooms}</p>
                  <p className="text-xs text-gray-400">Bathrooms</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl">📐</p>
                  <p className="text-lg font-bold text-gray-800">
                    {listing.areaSqFt || "—"}
                  </p>
                  <p className="text-xs text-gray-400">Sq. Ft.</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-2">About this property</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {listing.property?.description}
                </p>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">✨ Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a: any) => (
                    <span
                      key={a.id}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {listing.availableFrom && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-800 mb-2">📅 Availability</h2>
                <p className="text-sm text-gray-600">
                  Available from{" "}
                  <span className="font-semibold text-gray-800">
                    {new Date(listing.availableFrom).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Right — Contact / Apply Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24 space-y-4">
              <h2 className="text-base font-bold text-gray-800">Interested in this property?</h2>

              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Price</span>
                  <span className="font-bold text-gray-900">
                    ₹{listing.price?.toLocaleString("en-IN")}
                    {listing.type === "RENT" && "/mo"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-medium text-gray-700">{listing.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-medium text-emerald-600">{listing.status}</span>
                </div>
              </div>

              {session ? (
                <button
                  onClick={() => router.push(`/listings/${id}/apply`)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
                >
                  Apply Now →
                </button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
                >
                  Login to Apply →
                </button>
              )}

              <button className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
                📞 Contact Landlord
              </button>

              <button className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
                🗓 Schedule Tour
              </button>

              <p className="text-xs text-gray-400 text-center">
                Listed on{" "}
                {new Date(listing.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}