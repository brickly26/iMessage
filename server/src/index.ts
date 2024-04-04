import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import http from "http";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import * as dotenv from "dotenv";
import cors from "cors";
import { json } from "body-parser";
import { GraphQLContext, Session, SubscriptionContext } from "./util/types";
import { PrismaClient } from "@prisma/client";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";
import { getSession } from "next-auth/react";

async function main() {
  dotenv.config();
  const app = express();
  const httpServer = http.createServer(app);

  // Create our WebSocket server using the HTTP server we just set up.
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql/subscriptions",
  });

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Context Parameters
  const prisma = new PrismaClient();
  const pubsub = new PubSub();

  // Save the returned server's info so we can shutdown this server later
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx: SubscriptionContext): Promise<GraphQLContext> => {
        if (ctx.connectionParams && ctx.connectionParams.session) {
          const { session } = ctx.connectionParams;

          return { session, prisma, pubsub };
        }

        return { session: null, prisma, pubsub };
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();

  const corsOptions = {
    origin: process.env.CLIENT_ORIGIN as string,
    credentials: true,
  };

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({ origin: "*" }),
    json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<GraphQLContext> => {
        const cookies = req?.headers?.cookie;
        console.log(cookies);
        console.log("0", req?.headers);

        const parsedCookies = require("cookie").parse(cookies);
        console.log("1");
        const sessionToken = parsedCookies["next-auth.session-token"];
        console.log("1", sessionToken);

        if (sessionToken) {
          console.log("2");
          const sessionResponse = await fetch(
            `${process.env.CLIENT_ORIGIN}/api/auth/session`,
            {
              headers: {
                Cookie: `next-auth.session-token=${sessionToken}`,
              },
            }
          );

          const session = (await sessionResponse.json()) as Session;
          console.log("4", session);
          return {
            session,
            prisma,
            pubsub,
          };
        } else {
          return { session: null, prisma, pubsub };
        }
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.PORT || 4000 }, resolve)
  );
  console.log(`🚀 Server ready at https://imessage.up.railway.app/graphql`);
}

main().catch((err) => console.log(err));
