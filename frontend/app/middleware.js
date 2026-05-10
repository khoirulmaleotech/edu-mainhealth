import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // 1. Proteksi Halaman Admin (Superadmin Only)
    if (pathname.startsWith("/admin") && token?.role !== "superadmin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2. Redirect Superadmin dari halaman Dashboard User Umum
    if (pathname.startsWith("/dashboard") && token?.role === "superadmin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // 3. Proteksi Dashboard Student (Student Only)
    // Berdasarkan struktur folder: /dashboard/student
    if (pathname.startsWith("/dashboard/student") && token?.role !== "student") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 4. Proteksi Dashboard Teacher (Teacher Only)
    // Berdasarkan struktur folder: /dashboard/teacher
    if (pathname.startsWith("/dashboard/teacher") && token?.role !== "teacher") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 5. Proteksi Halaman Psikolog
    if (pathname.startsWith("/expert") && token?.role !== "psychologist") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { 
  matcher: [
    "/admin/:path*", 
    "/dashboard/:path*", 
    "/expert/:path*",
    "/profile/:path*"
  ] 
};