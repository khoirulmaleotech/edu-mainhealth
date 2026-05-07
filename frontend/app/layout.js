"use client";
import Script from "next/script";
import { Urbanist } from 'next/font/google';
import "./globals.css";

const urbanist = Urbanist({ 
  subsets: ['latin'],
  variable: '--font-urbanist',
});

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${urbanist.variable} scroll-smooth`}>
      <head>
        <title>EduMind | AI-Powered Student Wellbeing Ecosystem</title>
        <meta name="description" content="Platform kesehatan mental siswa terintegrasi dengan AI Mood Buddy, Portal Orang Tua, dan Konsol Psikolog Profesional." />
      </head>
      <body className="antialiased font-sans">
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=3398693380287170&ev=PageView&noscript=1" />
        </noscript>
        {children}
      </body>
    </html>
  );
}