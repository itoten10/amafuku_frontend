import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// Prismaクライアントを安全に初期化
let prisma: PrismaClient
try {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'minimal'
  })
} catch (error) {
  console.error('❌ Prisma initialization failed:', error)
  // フォールバック: Prismaなしでも認証は動作させる
  prisma = null as any
}

export const {
  auth,
  signIn,
  signOut,
  handlers,
} = NextAuth({
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  secret: process.env.NEXTAUTH_SECRET || "your-nextauth-secret-here",
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      },
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !prisma) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Database error in authorize:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user, account }) {
      console.log('🔐 SignIn attempt:', { 
        provider: account?.provider, 
        userId: user?.id,
        email: user?.email 
      })
      
      if (account?.provider === "google") {
        console.log('✅ Google sign-in successful')
        return true
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect:', { url, baseUrl })
      
      // 同じドメインかチェック
      if (url.startsWith("/")) return `${baseUrl}${url}`
      
      // ベースURLと同じドメインかチェック
      if (new URL(url).origin === baseUrl) return url
      
      return baseUrl
    }
  },
  debug: process.env.NODE_ENV === 'development'
})