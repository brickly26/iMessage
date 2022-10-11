import { ApolloClient, HttpLink, HttpLink, InMemoryCache } from '@apollo/client'

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})