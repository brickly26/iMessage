import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { getSession } from "next-auth/react";

let apolloHTTPUrl = process.env.APOLLO_HTTP_URL as string;

apolloHTTPUrl = "/api/graphql";

let apolloWSUrl = process.env.APOLLO_WS_URL as string;

apolloWSUrl = "ws://localhost:3000/api/graphql/subscriptions";

console.log("http", apolloHTTPUrl);
console.log("ws", apolloWSUrl);

const httpLink = new HttpLink({
  uri: apolloHTTPUrl,
});

const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: apolloWSUrl,
          connectionParams: async () => ({
            session: await getSession(),
          }),
        })
      )
    : null;

const link =
  typeof window !== "undefined" && wsLink !== null
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

console.log("link", link);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  credentials: "include",
});
