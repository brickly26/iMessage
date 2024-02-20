import { Button } from "@chakra-ui/react";
import { signOut } from "next-auth/react";

interface ChatProps {}

const Chat: React.FC<ChatProps> = (props) => {
  return (
    <div>
      Chat
      <Button onClick={() => signOut()}>Logout</Button>
    </div>
  );
};

export default Chat;
