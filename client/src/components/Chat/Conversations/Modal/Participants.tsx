import { Flex, Stack, Text } from "@chakra-ui/react";
import { SearchedUser } from "../../../../util/types";
import { IoIosCloseCircleOutline } from "react-icons/io";

interface ParticipantsProps {
  participants: Array<SearchedUser>;
  removeParticipants: (userId: string) => void;
}

const Participants: React.FC<ParticipantsProps> = ({
  participants,
  removeParticipants,
}) => {
  return (
    <Flex mt={8} gap="10px" flexWrap="wrap">
      {participants.map((participant) => (
        <Stack
          key={participant.id}
          direction="row"
          align="center"
          bg="whiteAlpha.200"
          borderRadius={4}
          p={2}
        >
          <Text>{participant.username}</Text>
          <IoIosCloseCircleOutline
            size={20}
            cursor="pointer"
            onClick={() => removeParticipants(participant.id)}
          />
        </Stack>
      ))}
    </Flex>
  );
};

export default Participants;
