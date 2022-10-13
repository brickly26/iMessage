import { Session } from "next-auth";

export interface GrapghQLContext {
  session: Session | null;
  // prisma
  // pubsub
}