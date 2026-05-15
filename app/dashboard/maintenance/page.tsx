"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const STATUS_COLORS: any = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

const PRIORITY_COLORS: any = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export default function MaintenancePage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTickets = () => {
    const url = filter
      ? `/api/maintenance?status=${filter}`
      : "/api/maintenance";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setTickets(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/maintenance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTickets();
    setUpdating(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Maintenance
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {session?.user.role === "LANDLORD"
                ? "Manage maintenance requests from tenants"
                : "Submit and track maintenance requests"}
            </p>
          </div>
          <Link
            href="/dashboard/maintenance/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            + New Request
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                filter === s
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s === "" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Tickets */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔧</p>
            <h3 className="text-lg font-semibold text-gray-700">
              No tickets found
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {session?.user.role === "LANDLORD"
                ? "No maintenance requests from tenants yet"
                : "Submit a request when something needs fixing"}
            </p>
            <Link
              href="/dashboard/maintenance/new"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              + Submit Request
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket: any) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[ticket.status]}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {ticket.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900">{ticket.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>📍 {ticket.property?.city}</span>
                      {session?.user.role === "LANDLORD" && (
                        <span>👤 {ticket.tenant?.name}</span>
                      )}
                      <span>
                        🕐 {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Actions for landlord */}
                  {session?.user.role === "LANDLORD" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {ticket.status === "OPEN" && (
                        <button
                          onClick={() => updateStatus(ticket.id, "IN_PROGRESS")}
                          disabled={updating === ticket.id}
                          className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-600 transition disabled:opacity-50"
                        >
                          Start Work
                        </button>
                      )}
                      {ticket.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => updateStatus(ticket.id, "RESOLVED")}
                          disabled={updating === ticket.id}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {ticket.status === "RESOLVED" && (
                        <button
                          onClick={() => updateStatus(ticket.id, "CLOSED")}
                          disabled={updating === ticket.id}
                          className="bg-gray-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-600 transition disabled:opacity-50"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}