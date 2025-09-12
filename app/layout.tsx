import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider
} from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner"
import Header from "./_components/Header";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit", // or "--font-outfit" if you prefer custom name
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Buyer Leads",
  description: "Track your buyer leads efficiently",
  icons: {
    icon: '/BuyerLeadLogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

 
  return (
    <ClerkProvider>

      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
        >
        <Toaster />
        <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>

  );
}
