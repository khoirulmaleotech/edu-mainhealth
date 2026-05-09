import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import { compare } from "bcryptjs";

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
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db();

        // Cari user berdasarkan email
        const user = await db.collection("users").findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user) {
          client.close();
          throw new Error("Email tidak terdaftar!");
        }

        // Cek Password
        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          client.close();
          throw new Error("Password salah!");
        }

        // Cek Verifikasi (Terutama untuk Psikolog/Sekolah)
        if (!user.is_verified && user.role !== 'superadmin') {
          client.close();
          throw new Error("Akun Anda belum diverifikasi oleh admin.");
        }

        client.close();

        // Data yang dikembalikan untuk disimpan di JWT
        return {
          id: user._id.toString(),
          name: user.fullname,
          email: user.email,
          role: user.role, // Penting untuk redirect dashboard
        };
      },
    }),
  ],

  // 3. Callbacks: Memasukkan role ke dalam session
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },

  // 4. Secret & Pages
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Arahkan ke page login buatan kita
  },
});

export { handler as GET, handler as POST };