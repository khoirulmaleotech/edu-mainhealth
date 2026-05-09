import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // 1. Proteksi Halaman Admin
    // Hanya role 'superadmin' yang bisa akses /admin/...
    if (pathname.startsWith("/admin") && token?.role !== "superadmin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2. Proteksi Halaman Dashboard User Umum
    // Role 'superadmin' jangan masuk ke dashboard user biasa agar tidak rancu
    if (pathname.startsWith("/dashboard") && token?.role === "superadmin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // 3. Proteksi Halaman Psikolog
    if (pathname.startsWith("/expert") && token?.role !== "psychologist") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      // Middleware hanya berjalan jika user sudah terautentikasi (punya token)
      authorized: ({ token }) => !!token,
    },
  }
);

// Tentukan halaman mana saja yang butuh login
export const config = { 
  matcher: [
    "/admin/:path*", 
    "/dashboard/:path*", 
    "/expert/:path*",
    "/profile/:path*"
  ] 
};