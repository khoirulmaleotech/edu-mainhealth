"use client";
import Script from "next/script";
import { Urbanist } from 'next/font/google';
import { NextAuthProvider } from "./providers"; // Import provider baru
import "./globals.css";

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
});

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${urbanist.variable} scroll-smooth`}>
      <head>
        <title>EduMind x Telkom TJSL | Aman Bercerita, Sehat Mentalnya</title>
        <meta name="description" content="Platform kesehatan mental siswa terintegrasi dengan AI Mood Buddy, Portal Orang Tua, dan Konsol Psikolog Profesional." />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
      </head>
      <body className="antialiased font-sans">
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=3398693380287170&ev=PageView&noscript=1" />
        </noscript>

        {/* Bungkus children dengan Provider agar session bisa diakses di semua page */}
        <NextAuthProvider>
          {children}
        </NextAuthProvider>

      </body>
    </html>
  );
}
