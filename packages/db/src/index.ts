import "./env";

import { PrismaClient } from "../generated/prisma";

export const dbClient = new PrismaClient();
