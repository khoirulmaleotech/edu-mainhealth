import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import { compare } from "bcryptjs";
import { connectDB } from "@/lib/mongodb";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 Hari
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db();

        const user = await db.collection("users").findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user) {
          client.close();
          throw new Error("Email tidak ditemukan!");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          client.close();
          throw new Error("Password salah!");
        }

        // Verifikasi Akun (Kecuali Superadmin)
        if (!user.is_verified && user.role !== 'superadmin') {
          client.close();
          throw new Error("Akun Anda sedang dalam proses verifikasi admin.");
        }

        client.close();
        return {
          id: user._id.toString(),
          name: user.fullname,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
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
          console.error("Failed to log login in authOptions:", err);
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
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};