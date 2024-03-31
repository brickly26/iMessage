import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  Avatar,
  Button,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import ConversationOperations from "../../../../graphql/operations/conversation";
import { formatUsernames } from "../../../../util/functions";
import {
  ConversationData,
  ConversationDeletedData,
  ConversationsData,
} from "../../../../util/types";
import userOperations from "../../../../graphql/operations/user";
import toast from "react-hot-toast";
import conversationOperations from "../../../../graphql/operations/conversation";
// import SkeletonLoader from "../../../common/SkeletonLoader";

interface MessagesHeaderProps {
  userId: string;
  conversationId: string;
}

const MessagesHeader: React.FC<MessagesHeaderProps> = ({
  userId,
  conversationId,
}) => {
  const router = useRouter();
  const { data, loading } = useQuery<
    ConversationData,
    { conversationId: string }
  >(ConversationOperations.Queries.conversation, {
    variables: {
      conversationId,
    },
  });

  console.log(data);

  if (data && !loading && !data?.conversation) {
    router.replace(process.env.NEXT_PUBLIC_BASE_URL as string);
  }

  const [
    sendFriendRequest,
    {
      error: sendFriendRequestError,
      data: sendFriendRequestdata,
      loading: sendFriendRequestLoading,
    },
  ] = useMutation<{ sendFriendRequest: boolean }, { userId: string }>(
    userOperations.Mutation.sendFriendRequest
  );

  const onSendRequest = (receiverId: string) => {
    try {
      // send friend request
      sendFriendRequest({
        variables: {
          userId: receiverId,
        },
        update: (cache) => {
          const data = cache.readQuery<
            ConversationData,
            { conversationId: string }
          >({
            query: ConversationOperations.Queries.conversation,
            variables: { conversationId },
          });

          if (!data) return;

          const { conversation } = data;

          const updatedParticipants = conversation.participants.map(
            (participant) => {
              if (participant.user.id === receiverId) {
                return {
                  ...participant,
                  user: {
                    ...participant.user,
                    friendshipStatus: "PENDING",
                  },
                };
              }
              return participant;
            }
          );

          console.log("searchUsers", updatedParticipants);

          cache.writeQuery<ConversationData, { conversationId: string }>({
            query: ConversationOperations.Queries.conversation,
            variables: { conversationId },
            data: {
              conversation: {
                ...conversation,
                participants: updatedParticipants,
              },
            },
          });
        },
      });
    } catch (error: any) {
      console.log("onSendRequest Error", error);
      toast.error("Failed to send friend request");
    }
  };

  return (
    <Stack
      direction="row"
      align="center"
      spacing={6}
      py={5}
      px={{ base: 4, md: 0 }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Button
        display={{ md: "none" }}
        onClick={() =>
          router.replace("?conversationId", "/", {
            shallow: true,
          })
        }
      >
        Back
      </Button>
      {/* {loading && <SkeletonLoader count={1} height="30px" width="320px" />} */}
      {!data?.conversation && !loading && <Text>Conversation Not Found</Text>}
      {data?.conversation && (
        <Stack direction="row">
          <Text color="whiteAlpha.600">To: </Text>
          {data.conversation.participants
            .filter((participant) => participant.user.id !== userId)
            .map((participant) => (
              <Popover key={participant.user.id}>
                <PopoverContent border="none">
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>
                    <Stack
                      key={participant.user.id}
                      direction="row"
                      align="center"
                      spacing={4}
                      py={4}
                      px={6}
                      borderRadius={4}
                    >
                      <Avatar />
                      {/* <Avatar src={participant.user.image} /> */}
                      <Flex
                        justify="space-between"
                        align="center"
                        width="100%"
                        gap={5}
                      >
                        <Text color="whiteAlpha.700">
                          {participant.user.username}
                        </Text>
                        <Button
                          bg="brand.100"
                          _hover={{ bg: "brand.100" }}
                          isDisabled={
                            participant.user.friendshipStatus !== "SENDABLE"
                          }
                          onClick={() => {
                            onSendRequest(participant.user.id);
                          }}
                        >
                          {participant.user.friendshipStatus == "SENDABLE" &&
                            "+ Add"}
                          {participant.user.friendshipStatus == "ACCEPTED" &&
                            "Friends"}
                          {participant.user.friendshipStatus == "DECLINED" &&
                            "Already Sent"}
                          {participant.user.friendshipStatus == "PENDING" &&
                            "Already Sent"}
                        </Button>
                      </Flex>
                    </Stack>
                  </PopoverBody>
                </PopoverContent>
                <PopoverTrigger>
                  <Text
                    fontWeight={600}
                    key={participant.user.id}
                    cursor="pointer"
                    _hover={{
                      textDecor: "underline",
                      color: "whiteAlpha.600",
                    }}
                  >
                    {participant.user.username}
                  </Text>
                </PopoverTrigger>
              </Popover>
            ))}
        </Stack>
      )}
    </Stack>
  );
};
export default MessagesHeader;
