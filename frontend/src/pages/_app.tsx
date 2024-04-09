import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../chakra/theme";
import { ApolloProvider } from "@apollo/client";
import { client } from "../graphql/apollo-client";
import { Toaster } from "react-hot-toast";

export default function App({
  Component,
  pageProps: { user, ...pageProps },
}: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
        <Toaster />
      </ChakraProvider>
    </ApolloProvider>
  );
}
