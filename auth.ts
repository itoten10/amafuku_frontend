import NextAuth from "next-auth"

export const {
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [],
  debug: process.env.NODE_ENV === 'development'
})