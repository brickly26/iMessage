import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../chakra/theme'
import { ApolloProvider } from '@apollo/client';
import { client } from '../graphql/apollo-client';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{session: Session}>) {
  return (
    <ApolloProvider client={client}>
      <SessionProvider session={session}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </SessionProvider>
    </ApolloProvider>
  )
}

export default MyApp
