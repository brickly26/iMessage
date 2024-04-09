import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

let apolloHTTPUrl = process.env.APOLLO_HTTP_URL as string;

let apolloWSUrl = process.env.APOLLO_WS_URL as string;

console.log("http", apolloHTTPUrl);
console.log("ws", apolloWSUrl);

const httpLink = new HttpLink({
  uri: apolloHTTPUrl,
  credentials: "include",
});

const wsLink =
  typeof window !== "undefined" && typeof document !== null
    ? new GraphQLWsLink(
        createClient({
          url: apolloWSUrl,
          connectionParams: async () => ({
            cookies: document.cookie,
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
});

export const createApolloClient = () => {
  return new ApolloClient({
    uri: apolloHTTPUrl,
    cache: new InMemoryCache(),
    credentials: "include",
  });
};
