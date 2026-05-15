"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/listings/ListingCard";

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
  });

  const fetchListings = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.city) params.set("city", filters.city);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    const res = await fetch(`/api/listings?${params.toString()}`);
    const data = await res.json();
    setListings(data.listings || []);
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Hero Search Bar */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Find Your Perfect Home
          </h1>
          <p className="text-blue-100 mb-8 text-sm">
            Search from thousands of verified listings across India
          </p>

          {/* Search Row */}
          <div className="bg-white rounded-2xl shadow-xl p-3 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="🔍  Search city, area..."
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="flex-1 min-w-[160px] px-4 py-2 text-sm text-gray-700 outline-none"
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 text-sm text-gray-700 border-l border-gray-200 outline-none bg-white"
            >
              <option value="">All Types</option>
              <option value="RENT">For Rent</option>
              <option value="SALE">For Sale</option>
            </select>
            <select
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              className="px-4 py-2 text-sm text-gray-700 border-l border-gray-200 outline-none bg-white"
            >
              <option value="">Any Beds</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
            <button
              onClick={fetchListings}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{listings.length}</span> properties
          </p>
          <div className="flex gap-2">
            {["All","Rent","Sale"].map((t) => (
              <button
                key={t}
                onClick={() => setFilters({ ...filters, type: t === "All" ? "" : t.toUpperCase() })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  (t === "All" && !filters.type) || filters.type === t.toUpperCase()
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <div className="w-60 shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5 sticky top-6">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
              Filters
            </h2>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-2">
                Price Range (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-2">
                Property Type
              </label>
              <div className="space-y-2">
                {["APARTMENT","HOUSE","VILLA","STUDIO"].map((pt) => (
                  <label key={pt} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    {pt.charAt(0) + pt.slice(1).toLowerCase()}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={fetchListings}
              className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setFilters({ type: "", city: "", minPrice: "", maxPrice: "", bedrooms: "" });
                setTimeout(fetchListings, 100);
              }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Clear all filters
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100 shadow-sm" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-lg font-semibold text-gray-700">No listings found</h3>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search a different city</p>
              <button
                onClick={() => setFilters({ type: "", city: "", minPrice: "", maxPrice: "", bedrooms: "" })}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}