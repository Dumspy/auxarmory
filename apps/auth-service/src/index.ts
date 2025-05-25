import { issuer } from "@openauthjs/openauth"
import { MemoryStorage } from "@openauthjs/openauth/storage/memory"
import { PasswordUI } from "@openauthjs/openauth/ui/password"
import { serve } from "@hono/node-server"
import { cors } from 'hono/cors'
import { subjects } from "@auxarmory/auth-subjects"
import { PasswordProvider } from "@openauthjs/openauth/provider/password"
import { env } from "./env.js"
import { Oauth2Provider } from "@openauthjs/openauth/provider/oauth2"
import { GithubProvider } from "@openauthjs/openauth/provider/github"

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
    battlenet: Oauth2Provider({
      clientID: env.BATTLENET_CLIENT_ID,
      clientSecret: env.BATTLENET_CLIENT_SECRET,
      endpoint: {
        authorization: "https://eu.battle.net/oauth/authorize ",
        token: "https://eu.battle.net/oauth/token",
      },
      scopes: ["wow.profile"],
      query: {
        "grant_type": "authorization_code",
        "response_type": "code",
      }
    }),
  },
  success: async (ctx, value) => {
    switch (value.provider) {
      case "battlenet": {
        console.log(value)

        return await ctx.subject("user", {
          id: await getUser(value.clientID),
        })
      }
      case "password": {
        return await ctx.subject("user", {
          id: await getUser(value.email),
        })
      }
      default:
        throw new Error("Invalid provider")
    }
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
