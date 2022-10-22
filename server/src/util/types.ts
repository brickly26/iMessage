import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";

export interface GrapghQLContext {
  session: Session | null;
  prisma: PrismaClient;
  // pubsub
}