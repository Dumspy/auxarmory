import "./env.js"
import { PrismaClient } from "../generated/prisma"

export const dbClient = new PrismaClient()
