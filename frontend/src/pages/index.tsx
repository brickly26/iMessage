import { Box, Center, Spinner } from "@chakra-ui/react";
import type { NextPage } from "next";
import Auth from "../components/Auth/Auth";
import Chat from "../components/Chat/Chat";
import { useLazyQuery, useQuery } from "@apollo/client";
import userOperations from "../graphql/operations/user";
import { User } from "../util/types";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Home: NextPage = () => {
  const [me, { data, loading }] = useLazyQuery<{ me: User | null }>(
    userOperations.Queries.me,
    { fetchPolicy: "network-only" }
  );

  const reloadSession = async () => {
    // router.reload();
    console.log("reloadSession");
    await me();
  };

  console.log("me:", data);

  useEffect(() => {
    me();
  }, []);

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
