// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { 
  handlers: { GET, POST }, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials:any) {
        try {
          // Validación mejorada
          if (!credentials?.username || !credentials?.password) return null;
          
          const isValid = 
            credentials.username === process.env.AUTH_USERNAME &&
            credentials.password === process.env.AUTH_PASSWORD;

          if (!isValid) return null;

          return { 
            id: "1",
            name: "Admin",
            email: "admin@example.com" // Campo obligatorio
          };
        } catch (error) {
          console.error("Error en autorización:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Redirección sin parámetros
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Limpiar parámetros en redirecciones
      const cleanUrl = new URL(url);
      cleanUrl.searchParams.delete("error");
      return cleanUrl.toString();
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
});