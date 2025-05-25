import { issuer } from "@openauthjs/openauth"
import { MemoryStorage } from "@openauthjs/openauth/storage/memory"
import { PasswordUI } from "@openauthjs/openauth/ui/password"
import { serve } from "@hono/node-server"
import { cors } from 'hono/cors'
import { subjects } from "@auxarmory/auth-subjects"
import { PasswordProvider } from "@openauthjs/openauth/provider/password"

async function getUser(email: string) {
  return "123"
}

const app = issuer({
  subjects,
  storage: MemoryStorage({
    persist: "./persist.json",
  }),
  providers: {
    password: PasswordProvider(
      PasswordUI({
        sendCode: async (email, code) => {
          console.log(email, code)
        },
      }),
    ),
  },
  success: async (ctx, value) => {
    if (value.provider === "password") {
      return ctx.subject("user", {
        id: await getUser(value.email),
      })
    }
    throw new Error("Invalid provider")
  },
})

app.use('*', cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}))

serve({
    ...app,
    port: 3001
})
