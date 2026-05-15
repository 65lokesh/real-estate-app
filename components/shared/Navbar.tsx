"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-blue-600">
        🏠 <span>PropFind</span>
      </Link>

      <div className="flex items-center gap-1">
        <Link href="/listings" className="text-sm text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition">
          Browse
        </Link>

        {session ? (
          <>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition">
              Dashboard
            </Link>
            <Link href="/dashboard/applications" className="text-sm text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition">
              Applications
            </Link>
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-gray-500 hover:text-red-500 transition"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 ml-2">
            <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition">
              Login
            </Link>
            <Link href="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-medium">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}