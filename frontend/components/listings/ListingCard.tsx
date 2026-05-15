import Link from "next/link";

interface Props {
  listing: {
    id: string;
    type: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    areaSqFt?: number;
    status: string;
    property: {
      title: string;
      address: string;
      city: string;
      state: string;
    };
    photos: { url: string }[];
  };
}

export default function ListingCard({ listing }: Props) {
  const photo = listing.photos[0]?.url || null;

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
          {photo ? (
            <img
              src={photo}
              alt={listing.property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🏠
            </div>
          )}
          {/* Badge */}
          <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
            listing.type === "RENT"
              ? "bg-blue-600 text-white"
              : "bg-emerald-500 text-white"
          }`}>
            {listing.type === "RENT" ? "For Rent" : "For Sale"}
          </span>
          {/* Favourite */}
          <button className="absolute top-3 right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:scale-110 transition text-gray-400 hover:text-red-500">
            ♡
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {listing.property.title}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                📍 {listing.property.city}, {listing.property.state}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-extrabold text-blue-600">
                ₹{listing.price.toLocaleString("en-IN")}
              </p>
              {listing.type === "RENT" && (
                <p className="text-xs text-gray-400">/month</p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mt-3 pt-3 flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              🛏 <span className="font-medium">{listing.bedrooms}</span> Beds
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              🚿 <span className="font-medium">{listing.bathrooms}</span> Baths
            </span>
            {listing.areaSqFt && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                📐 <span className="font-medium">{listing.areaSqFt}</span> sqft
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}