import { useMutation } from "@apollo/client";
import { Text, Input, Button, Link, Stack } from "@chakra-ui/react";
import { useState } from "react";
import userOperations from "../../graphql/operations/user";
import { LoginData, LoginVariables } from "../../util/types";
import toast from "react-hot-toast";

interface LoginProps {
  reloadSession: () => void;
  setAuthPage: React.Dispatch<React.SetStateAction<string>>;
}

const Login: React.FC<LoginProps> = ({ reloadSession, setAuthPage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [createUsername, { loading, error }] = useMutation<
    LoginData,
    LoginVariables
  >(userOperations.Mutation.login);

  const onSubmit = async () => {
    if (!username || !password) return;

    try {
      const { data } = await createUsername({
        variables: { username, password },
      });

      if (!data?.login) {
        throw new Error();
      }

      toast.success("Login Success");
      // reloade session to obtain new username
      reloadSession();
    } catch (error: any) {
      console.log("onsubmit error", error);
      toast.error(error?.message);
    }
  };
  return (
    <>
      <Text fontSize="3xl">Login</Text>
      <Input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        placeholder="Password"
        value={password}
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Stack width="100%" spacing={5} align="end">
        <Button onClick={onSubmit} width="100%" isLoading={loading}>
          Login
        </Button>
        <Text>
          Don&#39;t have an account?
          <Link
            textDecoration="underline"
            onClick={() => setAuthPage("register")}
            pl={2}
          >
            Register now
          </Link>
        </Text>
      </Stack>
    </>
  );
};

export default Login;
