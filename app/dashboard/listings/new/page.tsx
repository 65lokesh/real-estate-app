"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const AMENITIES = [
  "Parking", "Swimming Pool", "Gym", "Lift", "Security",
  "Power Backup", "Garden", "Pet Friendly", "WiFi", "AC",
  "Furnished", "Semi-Furnished",
];

interface UploadedPhoto {
  url: string;
  publicId: string;
  preview: string;
}

export default function NewListingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    lat: "",
    lng: "",
    propertyType: "APARTMENT",
    listingType: "RENT",
    price: "",
    bedrooms: "1",
    bathrooms: "1",
    areaSqFt: "",
    availableFrom: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Upload photo to Cloudinary immediately when selected
  const handleFiles = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const preview = URL.createObjectURL(file);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setPhotos((prev) => [...prev, { url: data.url, publicId: data.publicId, preview }]);
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Step 1 — Create listing
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amenities: selectedAmenities }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Something went wrong");
      setLoading(false);
      return;
    }

    const listingId = data.id;

    // Step 2 — Save photos to listing
    for (let i = 0; i < photos.length; i++) {
      await fetch(`/api/listings/${listingId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: photos[i].url,
          publicId: photos[i].publicId,
          isPrimary: i === 0,
        }),
      });
    }

    router.push("/dashboard/listings");
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Create New Listing</h1>
          <p className="text-gray-500 mt-1">Fill in the details to list your property</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">🏠 Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Property Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required
                  placeholder="e.g. Spacious 2BHK in Bandra West"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                  placeholder="Describe your property..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Listing Type *</label>
                  <select name="listingType" value={form.listingType} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="RENT">For Rent</option>
                    <option value="SALE">For Sale</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Property Type *</label>
                  <select name="propertyType" value={form.propertyType} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="VILLA">Villa</option>
                    <option value="STUDIO">Studio</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">📍 Location</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Full Address *</label>
                <input name="address" value={form.address} onChange={handleChange} required
                  placeholder="e.g. 12, Hill Road, Bandra West"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">City *</label>
                  <input name="city" value={form.city} onChange={handleChange} required placeholder="Mumbai"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">State *</label>
                  <input name="state" value={form.state} onChange={handleChange} required placeholder="Maharashtra"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">ZIP Code *</label>
                  <input name="zipCode" value={form.zipCode} onChange={handleChange} required placeholder="400050"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">💰 Pricing & Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Price (₹) *</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="25000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Area (sqft)</label>
                <input name="areaSqFt" type="number" value={form.areaSqFt} onChange={handleChange} placeholder="850"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Bedrooms *</label>
                <select name="bedrooms" value={form.bedrooms} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n===1?"Bedroom":"Bedrooms"}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Bathrooms *</label>
                <select name="bathrooms" value={form.bathrooms} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n} {n===1?"Bathroom":"Bathrooms"}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Available From</label>
                <input name="availableFrom" type="date" value={form.availableFrom} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">✨ Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => (
                <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    selectedAmenities.includes(amenity)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                  }`}>
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-1">📸 Property Photos</h2>
            <p className="text-xs text-gray-400 mb-4">Upload photos before submitting — first photo will be the cover</p>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                dragOver ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
              }`}
            >
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              <div className="text-4xl mb-3">📸</div>
              {uploading ? (
                <p className="text-blue-600 font-medium text-sm animate-pulse">Uploading photos...</p>
              ) : (
                <>
                  <p className="text-gray-700 font-medium text-sm">Drop photos here or click to upload</p>
                  <p className="text-gray-400 text-xs mt-1">JPG, PNG up to 10MB — multiple allowed</p>
                </>
              )}
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden h-28 bg-gray-100">
                    <img src={photo.preview} alt={`Photo ${i+1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                    <button type="button" onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hidden group-hover:flex items-center justify-center">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-8">
            <button type="button" onClick={() => router.back()}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading || uploading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? "Creating listing..." : uploading ? "Wait for upload..." : "Create Listing ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}