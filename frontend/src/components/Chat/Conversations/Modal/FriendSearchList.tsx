import { Avatar, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { SearchedFriend } from "../../../../util/types";

interface FriendSearchListProps {
  friends: Array<SearchedFriend>;
  addParticipant: (user: SearchedFriend) => void;
  participants: Array<SearchedFriend>;
}

const FriendSearchList: React.FC<FriendSearchListProps> = ({
  friends,
  addParticipant,
  participants,
}) => {
  return (
    <>
      {friends.length === 0 ? (
        <Flex mt={6} justify="center">
          <Text>No friends found</Text>
        </Flex>
      ) : (
        <Stack mt={6}>
          {friends.map((friend) => (
            <Stack
              key={friend.id}
              direction="row"
              align="center"
              spacing={4}
              py={2}
              px={4}
              borderRadius={4}
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <Avatar src={friend.image} />
              <Flex justify="space-between" align="center" width="100%">
                <Text color="whiteAlpha.700">{friend.username}</Text>
                <Button
                  bg="brand.100"
                  _hover={{ bg: "brand.100" }}
                  isDisabled={
                    !!participants.find(
                      (participant) => participant.id === friend.id
                    )
                  }
                  onClick={() => addParticipant(friend)}
                >
                  Select
                </Button>
              </Flex>
            </Stack>
          ))}
        </Stack>
      )}
    </>
  );
};

export default FriendSearchList;
