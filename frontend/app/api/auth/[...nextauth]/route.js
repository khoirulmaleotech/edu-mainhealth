import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
// Impor fungsi connectDB terpusat yang dipertahankan di folder lib Bapak
import { connectDB } from "@/lib/mongodb"; 

const handler = NextAuth({
  // 1. Pengaturan Session (Expired 1 Hari)
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 hari dalam hitungan detik
  },

  // 2. Providers: Login menggunakan Email & Password
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        // Menggunakan koneksi terpusat yang memanfaatkan pooling global caching
        const client = await connectDB();
        const db = client.db();

        // Cari user berdasarkan email
        const user = await db.collection("users").findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user) {
          // HAPUS client.close() karena kita ingin pooling koneksinya tetap hidup di cache global
          throw new Error("Email tidak terdaftar!");
        }

        // Cek Password
        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Password salah!");
        }

        // Cek Verifikasi (Terutama untuk Psikolog/Sekolah)
        if (!user.is_verified && user.role !== 'superadmin') {
          throw new Error("Akun Anda belum diverifikasi oleh admin.");
        }

        // Data yang dikembalikan untuk disimpan di JWT
        return {
          id: user._id.toString(),
          name: user.fullname,
          email: user.email,
          role: user.role, // Penting untuk fungsi redirect dashboard stakeholder
        };
      },
    }),
  ],

  // 3. Callbacks: Memasukkan role dan id ke dalam session agar bisa terbaca di layout/page
  callbacks: {
    async signIn({ user }) {
      if (user) {
        try {
          const client = await connectDB();
          const db = client.db();
          await db.collection("login_logs").insertOne({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: new Date(),
          });
        } catch (err) {
          console.error("Failed to log login:", err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },

  // 4. Secret & Pages
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Mengarahkan ke landing page login EduMind by Educourse
  },
});

export { handler as GET, handler as POST };