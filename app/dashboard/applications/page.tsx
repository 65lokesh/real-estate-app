"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const STATUS_COLORS: any = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-600",
};

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchApplications = () => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => {
        setApplications(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchApplications();
    setUpdating(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {session?.user.role === "LANDLORD" ? "Received Applications" : "My Applications"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {session?.user.role === "LANDLORD"
              ? "Review and manage rental applications"
              : "Track your rental applications"}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 font-medium">No applications yet</p>
            <p className="text-gray-400 text-sm mt-1">
              {session?.user.role === "LANDLORD"
                ? "Applications will appear here when renters apply"
                : "Browse listings and apply for properties"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Property info */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[app.status]}`}>
                        {app.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        Applied {new Date(app.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900">
                      {app.listing?.property?.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      📍 {app.listing?.property?.city}, {app.listing?.property?.state}
                    </p>
                    <p className="text-sm font-semibold text-blue-600 mt-1">
                      ₹{app.listing?.price?.toLocaleString("en-IN")}/mo
                    </p>

                    {/* Applicant info (landlord view) */}
                    {session?.user.role === "LANDLORD" && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-800">
                          👤 {app.applicant?.name}
                        </p>
                        <p className="text-xs text-gray-500">{app.applicant?.email}</p>
                        {app.monthlyIncome && (
                          <p className="text-xs text-gray-500 mt-1">
                            Income: ₹{Number(app.monthlyIncome).toLocaleString("en-IN")}/mo
                            {app.employerName && ` · ${app.employerName}`}
                          </p>
                        )}
                        {app.message && (
                          <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg italic">
                            "{app.message}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {session?.user.role === "LANDLORD" && app.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => updateStatus(app.id, "APPROVED")}
                          disabled={updating === app.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, "REJECTED")}
                          disabled={updating === app.id}
                          className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-600 transition disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}
                    {session?.user.role === "RENTER" && app.status === "PENDING" && (
                      <button
                        onClick={() => updateStatus(app.id, "WITHDRAWN")}
                        disabled={updating === app.id}
                        className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}