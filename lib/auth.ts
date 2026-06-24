import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Edge-safe auth config — NO direct Mongoose imports at module level
// DB access happens via API routes, not middleware

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        // Call our own API to validate — keeps Edge runtime clean
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/validate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Pass internal secret so the endpoint rejects public calls
            "x-internal-secret": INTERNAL_SECRET,
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/google-sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": INTERNAL_SECRET,
            },
            body: JSON.stringify({ user }),
          });
          const data = await res.json();
          if (data.success && data.userId) {
            user.id = data.userId;
            (user as { role?: string }).role = data.role;
          }
        } catch (error) {
          console.error("Google sync failed:", error);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }

      // Ensure JWT stores MongoDB user ID (not Google OAuth sub)
      if (
        token.email &&
        token.id &&
        !/^[a-f\d]{24}$/i.test(token.id as string)
      ) {
        try {
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/resolve-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": INTERNAL_SECRET,
            },
            body: JSON.stringify({ email: token.email }),
          });
          const data = await res.json();
          if (data.success && data.userId) {
            token.id = data.userId;
            token.role = data.role || token.role;
          }
        } catch (error) {
          console.error("User ID resolve failed:", error);
        }
      }

      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
