import { Box, Center, Spinner } from "@chakra-ui/react";
import type { NextPage } from "next";
import Auth from "../components/Auth/Auth";
import Chat from "../components/Chat/Chat";
import { useLazyQuery } from "@apollo/client";
import userOperations from "../graphql/operations/user";
import { User } from "../util/types";
import router from "next/router";
import { useLayoutEffect } from "react";

const Home: NextPage = () => {
  const [me, { data, loading }] = useLazyQuery<{ me: User | null }>(
    userOperations.Queries.me
  );

  const reloadSession = async () => {
    me();
  };

  useLayoutEffect(() => {
    me();
  }, []);

  console.log(data);

  return (
    <>
      <Box>
        {loading && (
          <Center h="100vh">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="brand.100"
              size="xl"
            />
          </Center>
        )}
        {!loading && data?.me && (
          <Chat user={data.me} reloadSession={reloadSession} />
        )}
        {!loading && !data?.me && (
          <Auth
            user={data?.me ? data?.me : null}
            reloadSession={reloadSession}
          />
        )}
      </Box>
    </>
  );
};

export default Home;
