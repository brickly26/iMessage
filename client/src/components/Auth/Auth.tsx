import { Button } from "@chakra-ui/react";
import { signIn } from "next-auth/react";

interface IAuthProps {}

const Auth: React.FC<IAuthProps> = () => {
  return (
    <div>
      <Button onClick={() => signIn("google")}>Sign in</Button>AUTH
    </div>
  );
};

export default Auth;
