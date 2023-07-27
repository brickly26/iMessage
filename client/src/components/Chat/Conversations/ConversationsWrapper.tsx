import { Session } from "next-auth";

interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = ({
  session,
}) => {
  return <div>converstaions wrapper</div>;
};

export default ConversationsWrapper;
