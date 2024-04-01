import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { getSession } from "next-auth/react";

const apolloUrl = process.env.APOLLO_GRAPHQL_SERVER_BASE_URL as string;

if (typeof apolloUrl !== "string") {
  console.log(apolloUrl);
  throw Error("poop");
}

console.log(apolloUrl);

const httpLink = new HttpLink({
  uri: `https://${apolloUrl}/graphql`,
  credentials: "include",
});

const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: `wss://${apolloUrl}/graphql/subscriptions`,
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
function setContext(
  arg0: (_: any, { headers }: { headers: any }) => { headers: any }
) {
  throw new Error("Function not implemented.");
}
