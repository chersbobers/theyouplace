export const authConfig = {
  providers: {
    google: {
      enabled: true,
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  redirectUrls: {
    login: "/auth/callback",
    signup: "/auth/callback",
  },
}
