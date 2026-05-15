"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ListingCard from "@/components/listings/ListingCard";

export default function HomePage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    fetch("/api/listings?limit=6")
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("city", search);
    if (type) params.set("type", type);
    window.location.href = `/listings?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white opacity-5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white opacity-5 rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <span className="inline-block bg-white bg-opacity-20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            🏠 India's trusted real estate platform
          </span>
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Find Your Perfect<br />
            <span className="text-yellow-300">Home in India</span>
          </h1>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Search thousands of verified listings across Mumbai, Pune, Bangalore and more. Rent or buy with confidence.
          </p>

          {/* Search box */}
          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-wrap gap-2 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="🔍  Search city, area, locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 min-w-[180px] px-4 py-2 text-sm text-gray-700 outline-none"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-2 text-sm text-gray-600 border-l border-gray-200 outline-none bg-white"
            >
              <option value="">All Types</option>
              <option value="RENT">For Rent</option>
              <option value="SALE">For Sale</option>
            </select>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition"
            >
              Search
            </button>
          </div>

          {/* Quick links */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {["Mumbai", "Pune", "Bangalore", "Delhi", "Hyderabad"].map((city) => (
              <Link
                key={city}
                href={`/listings?city=${city}`}
                className="text-sm text-blue-100 hover:text-white underline underline-offset-2 transition"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10,000+", label: "Properties Listed" },
              { value: "5,000+", label: "Happy Tenants" },
              { value: "50+", label: "Cities Covered" },
              { value: "99%", label: "Verified Listings" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-blue-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Featured Properties
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Hand-picked listings across top cities
              </p>
            </div>
            <Link
              href="/listings"
              className="text-sm text-blue-600 font-semibold hover:underline"
            >
              View all →
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🏠</p>
              <p className="text-gray-400 text-sm">No listings yet</p>
              {session?.user.role === "LANDLORD" && (
                <Link
                  href="/dashboard/listings/new"
                  className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                >
                  + Add First Listing
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-gray-900">
              How PropFind Works
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Simple, fast, and transparent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "Search Properties",
                desc: "Browse thousands of verified listings. Filter by city, price, size and more.",
              },
              {
                icon: "📋",
                title: "Apply Online",
                desc: "Submit your rental application directly. No paperwork, no hassle.",
              },
              {
                icon: "🏠",
                title: "Move In",
                desc: "Get approved, sign your lease online, and pay rent digitally every month.",
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Landlords */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-200 text-xs font-semibold uppercase tracking-wide">
                For Landlords
              </span>
              <h2 className="text-3xl font-extrabold mt-2 mb-4">
                List your property for free
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                Reach thousands of verified renters. Manage applications, leases, and payments — all in one place.
              </p>
              <div className="space-y-3">
                {[
                  "✅ Free to list your property",
                  "✅ Screen tenants with applications",
                  "✅ Collect rent online",
                  "✅ Track maintenance requests",
                ].map((f) => (
                  <p key={f} className="text-sm text-blue-100">{f}</p>
                ))}
              </div>
              <Link
                href={session ? "/dashboard/listings/new" : "/register"}
                className="inline-block mt-8 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition"
              >
                {session ? "List a Property →" : "Get Started Free →"}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🏠", label: "List Property", value: "Free" },
                { icon: "👥", label: "Tenant Screening", value: "Built-in" },
                { icon: "💰", label: "Rent Collection", value: "Online" },
                { icon: "🔧", label: "Maintenance", value: "Tracked" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white bg-opacity-10 rounded-2xl p-4 text-center"
                >
                  <p className="text-2xl mb-1">{item.icon}</p>
                  <p className="text-xs font-semibold text-blue-100">
                    {item.label}
                  </p>
                  <p className="text-sm font-extrabold text-white mt-1">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Ready to find your home?
          </h2>
          <p className="text-gray-500 mb-8">
            Join thousands of renters and landlords on PropFind
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/listings"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition"
            >
              Browse Properties
            </Link>
            {!session && (
              <Link
                href="/register"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xl font-extrabold text-white">
              🏠 PropFind
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/listings" className="hover:text-white transition">Browse</Link>
              <Link href="/register" className="hover:text-white transition">Register</Link>
              <Link href="/login" className="hover:text-white transition">Login</Link>
            </div>
            <p className="text-xs text-gray-600">
              © 2026 PropFind. Built with ❤️ in India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}