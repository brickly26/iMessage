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
import {
  GraphQLContext,
  GraphQLWSContext,
  SubscriptionContext,
} from "./utils/types";
import { PrismaClient } from "@prisma/client";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";
import RedisStore from "connect-redis";
import session from "express-session";
import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import cookieParser from "cookie-parser";
import cookie from "cookie";

async function main() {
  dotenv.config();
  const app = express();
  const httpServer = http.createServer(app);

  let redisClient = createClient({
    url: process.env.REDIS_URL,
  });
  redisClient.connect().catch(console.error);
  app.set("trust proxy", 1);

  let redisStore = new RedisStore({
    disableTouch: true,
    client: redisClient,
  });

  const corsOptions: cors.CorsOptions = {
    origin: process.env.CLIENT_ORIGIN as string,
    credentials: true,
  };

  console.log("url", process.env.CLIENT_ORIGIN);

  app.use(cors(corsOptions));
  app.use(json());
  app.use(
    session({
      name: "auth",
      store: redisStore,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain:
          process.env.NODE_ENV === "production" ? ".railway.app" : undefined,
        secure: process.env.NODE_ENV === "production", // TODO: change to true when deploying
      },
      genid: function (req) {
        return uuidv4(); // use UUIDs for session IDs
      },
      resave: false,
      saveUninitialized: false,
      secret: "fdshgjfdsgjkaeuiowqtrbfc",
    })
  );

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
      context: async (ctx: SubscriptionContext): Promise<GraphQLWSContext> => {
        if (ctx.connectionParams && ctx.connectionParams.cookies) {
          const { cookies } = ctx.connectionParams;

          const parsedCookie1 = cookie.parse(cookies);

          const parsedCookies = cookieParser.signedCookie(
            parsedCookie1.auth,
            "fdshgjfdsgjkaeuiowqtrbfc"
          );

          let session = null;

          if (!parsedCookies) {
            return { session, prisma, pubsub };
          }

          await redisStore.get(parsedCookies, (err, cookieData) => {
            if (err) throw err;

            session = { userId: cookieData.userId };
          });

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

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<GraphQLContext> => {
        return {
          prisma,
          pubsub,
          res,
          req,
        };
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.PORT || 4000 }, resolve)
  );
  console.log(`🚀 Server ready at https://imessage.up.railway.app/graphql`);
}

main().catch((err) => console.log(err));
