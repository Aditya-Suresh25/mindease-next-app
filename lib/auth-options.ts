import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true, // Allow linking if user signed up with email first
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                // Pass the token to the client so it can be used for API requests
                (session as any).accessToken = token.accessToken;
                (session as any).user.id = token.sub;
            }
            return session;
        },
        async jwt({ token, user, account }) {
            // If user logs in (initial sign in)
            if (user) {
                token.sub = user.id; // user.id comes from MongoDB _id via Adapter

                // Generate a backend-compatible JWT
                // The backend expects { userId: string } payload
                // We replicate this here using the same JWT_SECRET
                const backendToken = jwt.sign(
                    { userId: user.id },
                    process.env.JWT_SECRET || "your-secret-key",
                    { expiresIn: "24h" }
                );

                token.accessToken = backendToken;
            }
            return token;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "super-secret-next-auth-key",
};
