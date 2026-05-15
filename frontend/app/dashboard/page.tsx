"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Stats {
  totalListings: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalListings: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
  });
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/listings").then((r) => r.json()),
      fetch("/api/applications").then((r) => r.json()),
    ]).then(([listingsData, appsData]) => {
      const apps = Array.isArray(appsData) ? appsData : [];
      setStats({
        totalListings: listingsData.total || 0,
        totalApplications: apps.length,
        pendingApplications: apps.filter((a: any) => a.status === "PENDING").length,
        approvedApplications: apps.filter((a: any) => a.status === "APPROVED").length,
      });
      setApplications(apps.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const STATUS_COLORS: any = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    WITHDRAWN: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome back, {session?.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your properties today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Listings",
              value: stats.totalListings,
              icon: "🏠",
              color: "bg-blue-50 text-blue-600",
              link: "/dashboard/listings",
            },
            {
              label: "Total Applications",
              value: stats.totalApplications,
              icon: "📋",
              color: "bg-purple-50 text-purple-600",
              link: "/dashboard/applications",
            },
            {
              label: "Pending",
              value: stats.pendingApplications,
              icon: "⏳",
              color: "bg-yellow-50 text-yellow-600",
              link: "/dashboard/applications",
            },
            {
              label: "Approved",
              value: stats.approvedApplications,
              icon: "✅",
              color: "bg-green-50 text-green-600",
              link: "/dashboard/applications",
            },
          ].map((stat) => (
            <Link href={stat.link} key={stat.label}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition cursor-pointer">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-extrabold text-gray-900">
                  {loading ? "..." : stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Applications */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Recent Applications</h2>
              <Link
                href="/dashboard/applications"
                className="text-xs text-blue-600 hover:underline"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-gray-400 text-sm">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app: any) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {app.listing?.property?.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {session?.user.role === "LANDLORD"
                          ? app.applicant?.name
                          : app.listing?.property?.city}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ml-3 ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {session?.user.role === "LANDLORD" && (
                <Link href="/dashboard/listings/new">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition cursor-pointer">
                    <span className="text-xl">➕</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-700">New Listing</p>
                      <p className="text-xs text-blue-500">Add a property</p>
                    </div>
                  </div>
                </Link>
              )}

              <Link href="/listings">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer mt-3">
                  <span className="text-xl">🔍</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Browse Listings</p>
                    <p className="text-xs text-gray-400">Find properties</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/applications">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Applications</p>
                    <p className="text-xs text-gray-400">View all applications</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/profile">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                  <span className="text-xl">👤</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Profile</p>
                    <p className="text-xs text-gray-400">Edit your details</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}