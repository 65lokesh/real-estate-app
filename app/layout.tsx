import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Real Estate Platform",
  description: "Find your perfect home",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}