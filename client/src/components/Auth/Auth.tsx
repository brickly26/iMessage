import { Button, Center, Stack, Text, Image, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import UserOperations from "../../graphql/operations/users";
import { CreateUsernameData, CreateUsernameVariables } from "../../util/types";

interface IAuthProps {
  session: Session | null;
  reloadSession: () => void;
}

const Auth: React.FC<IAuthProps> = ({ session, reloadSession }) => {
  const [username, setUsername] = useState("");

  const [createUsername, { loading, error }] = useMutation<
    CreateUsernameData,
    CreateUsernameVariables
  >(UserOperations.Mutation.createUsername);

  const onSubmit = async () => {
    if (!username) return;
    try {
      // createUsername Mutation to send our username to the Graphql API
      const { data } = await createUsername({ variables: { username } });

      if (!data?.createUsername) {
        throw new Error();
      }

      if (data?.createUsername.error) {
        const {
          createUsername: { error },
        } = data;

        throw new Error(error);
      }

      // Reload session to obtainnew username;
      reloadSession();
    } catch (error) {
      console.log("onSubmit Error", error);
    }
  };

  return (
    <Center width="100vw" height="100vh">
      <Stack align="center" spacing={8}>
        {session ? (
          <>
            <Text fontSize={"3xl"}>Create a Username</Text>
            <Input
              placeholder="Enter a name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button width="100%" onClick={onSubmit} isLoading={loading}>
              Save
            </Button>
          </>
        ) : (
          <>
            <Text fontSize="3xl">iMessage</Text>
            <Button
              onClick={() => signIn("google")}
              leftIcon={<Image height="20px" src="/images/googlelogo.png" />}
            >
              Continue with Google
            </Button>
          </>
        )}
      </Stack>
    </Center>
  );
};

export default Auth;
