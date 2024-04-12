import { Center, Stack } from "@chakra-ui/react";

import { useState } from "react";
import { User } from "../../util/types";
import Login from "./Login";
import Register from "./Register";

interface AuthProps {
  user: User | null;
  reloadSession: () => Promise<void>;
}

const Auth: React.FC<AuthProps> = ({ user, reloadSession }) => {
  const [authPage, setAuthPage] = useState("login");

  return (
    <Center height="100vh">
      <Stack
        spacing={8}
        align="center"
        borderRadius="lg"
        w="500px"
        px={5}
        py={7}
        bg="whiteAlpha.50"
      >
        {authPage === "login" ? (
          <Login reloadSession={reloadSession} setAuthPage={setAuthPage} />
        ) : (
          <Register reloadSession={reloadSession} setAuthPage={setAuthPage} />
        )}
      </Stack>
    </Center>
  );
};

export default Auth;
