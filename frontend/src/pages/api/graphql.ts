import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import http from "http";
import typeDefs from "../../graphql/typeDefs";
import resolvers from "../../graphql/resolvers";
import { GraphQLContext, Session, SubscriptionContext } from "../../util/types";
import { PrismaClient } from "@prisma/client";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";

import { startServerAndCreateNextHandler } from "@as-integrations/next";

const app = express();
const httpServer = http.createServer(app);

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/api/graphql/subscriptions",
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Context Parameters
const prisma = new PrismaClient();
const pubsub = new PubSub();

// Save the returned server's info so we can shutdown this server later
// eslint-disable-next-line react-hooks/rules-of-hooks
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

export default startServerAndCreateNextHandler(server, {
  context: async (req): Promise<GraphQLContext> => {
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/session`,
        {
          headers: {
            Cookie: `next-auth.session-token=${sessionToken}`,
          },
        }
      );
      console.log("3");

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
});
