import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "./components/ConditionalLayout";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
});

export const metadata: Metadata = {
  title: "E-Shop - Your Online Store",
  description: "Discover amazing products at great prices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${leagueSpartan.variable} font-sans antialiased bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex flex-col`}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
