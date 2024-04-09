import { Avatar, IconButton, Flex, Stack, Text } from "@chakra-ui/react";
import { FriendRequest } from "../../../../util/types";
import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";

interface FriendRequestListProps {
  friendRequests: Array<FriendRequest>;
  handleFriendRequest: (requestId: string, choice: string) => void;
  friendRequestLoading: {
    loading: boolean;
    requestId: string;
    choice: string;
  };
}

const FriendRequestList: React.FC<FriendRequestListProps> = ({
  friendRequests,
  handleFriendRequest,
  friendRequestLoading: { loading, choice, requestId },
}) => {
  return (
    <>
      {friendRequests.length === 0 ? (
        <Flex mt={6} justify="center">
          <Text>No Friend Requests</Text>
        </Flex>
      ) : (
        <Stack mt={6}>
          {friendRequests.map((friendRequest) => {
            return (
              <Stack
                key={friendRequest.id}
                direction="row"
                align="center"
                spacing={4}
                py={2}
                px={4}
                borderRadius={4}
                _hover={{ bg: "whiteAlpha.100" }}
              >
                <Avatar />
                <Flex justify="space-between" align="center" width="100%">
                  <Text color="whiteAlpha.700">
                    {friendRequest.sender.username}
                  </Text>
                  <Flex gap={2}>
                    <IconButton
                      aria-label="accept"
                      bg="whiteAlpha.300"
                      _hover={{ bg: "brand.100" }}
                      isLoading={
                        requestId === friendRequest.id &&
                        choice === "ACCEPTED" &&
                        loading
                      }
                      onClick={() =>
                        handleFriendRequest(friendRequest.id, "ACCEPTED")
                      }
                      icon={<FaRegCheckCircle />}
                    />
                    <IconButton
                      aria-label="decline"
                      bg="whiteAlpha.300"
                      _hover={{ bg: "red.500" }}
                      isLoading={
                        requestId === friendRequest.id &&
                        choice === "DECLINED" &&
                        loading
                      }
                      onClick={() =>
                        handleFriendRequest(friendRequest.id, "DECLINED")
                      }
                      icon={<FaRegTimesCircle />}
                    />
                  </Flex>
                </Flex>
              </Stack>
            );
          })}
        </Stack>
      )}
    </>
  );
};

export default FriendRequestList;
