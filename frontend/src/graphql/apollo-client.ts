import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { getSession } from "next-auth/react";

let apolloUrl = process.env.APOLLO_GRAPHQL_SERVER_BASE_URL as string;

let apolloHTTPUrl = `https://${apolloUrl}/graphql`;

if (process.env.APOLLO_GRAPHQL_SERVER_BASE_URL === "localhost:4000") {
  apolloHTTPUrl = `http://${apolloUrl}/graphql`;
}

const apolloWSUrl = `ws://${apolloUrl}/graphql/subscriptions`;

if (typeof apolloUrl !== "string") {
  console.log(apolloUrl);
  throw Error("poop");
}

console.log(apolloHTTPUrl);

const httpLink = new HttpLink({
  uri: apolloHTTPUrl,
  credentials: "include",
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

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
