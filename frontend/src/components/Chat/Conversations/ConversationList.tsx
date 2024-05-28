import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";

import ConversationModal from "./Modal/ConversationModal";
import { useEffect, useState } from "react";
import {
  AcceptFriendRequestData,
  ConversationPopulated,
  DeclineFriendRequestData,
  FriendRequestsData,
  ParticipantPopulated,
  SendFriendRequestData,
  User,
} from "../../../util/types";
import ConversationItem from "./ConversationItem";
import { useRouter } from "next/router";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import conversationOperations from "../../../graphql/operations/conversation";
import toast from "react-hot-toast";
import { HiOutlineUsers } from "react-icons/hi";
import { IoPersonAddOutline } from "react-icons/io5";
import AddFriendModal from "./Modal/AddFriendModal";
import FriendRequestModal from "./Modal/FriendRequestModal";
import userOperations from "../../../graphql/operations/user";
import { css } from "@emotion/react";

interface ConversationListProps {
  user: User;
  conversations: Array<ConversationPopulated>;
  onViewConversation: (
    conversationId: string,
    hasSeenLatestMessage: boolean | undefined
  ) => void;
  reloadSession: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  user,
  conversations,
  onViewConversation,
  reloadSession,
}) => {
  const router = useRouter();
  const { id: userId } = user;

  const [editingConversation, setEditingConversation] =
    useState<ConversationPopulated | null>(null);

  const [isOpenConvo, setIsOpenConvo] = useState(false);
  const onOpenConvo = () => setIsOpenConvo(true);
  const onCloseConvo = () => setIsOpenConvo(false);

  const [isOpenFriendRequest, setIsOpenFriendRequest] = useState(false);
  const onOpenFriendRequests = () => setIsOpenFriendRequest(true);
  const onCloseFriendRequests = () => setIsOpenFriendRequest(false);

  const [isOpenAddFriend, setIsOpenAddFriend] = useState(false);
  const onOpenAddFriend = () => setIsOpenAddFriend(true);
  const onCloseAddFriend = () => setIsOpenAddFriend(false);

  /**
   * Queries
   */
  const {
    data: friendRequestsData,
    error,
    loading,
  } = useQuery<FriendRequestsData>(userOperations.Queries.friendRequests);

  console.log("friendRequest data", error);

  /**
   * Subscriptions
   */
  useSubscription<AcceptFriendRequestData>(
    userOperations.Subscriptions.acceptFriendRequest,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const existing = client.readQuery<FriendRequestsData>({
          query: userOperations.Queries.friendRequests,
        });

        if (!existing) return;

        const { friendRequests } = existing;
        const {
          acceptFriendRequest: { id: acceptedFriendRequestId },
        } = subscriptionData;

        client.writeQuery<FriendRequestsData>({
          query: userOperations.Queries.friendRequests,
          data: {
            friendRequests: friendRequests.filter(
              (request) => request.id !== acceptedFriendRequestId
            ),
          },
        });
      },
    }
  );

  useSubscription<DeclineFriendRequestData>(
    userOperations.Subscriptions.declineFriendRequest,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const existing = client.readQuery<FriendRequestsData>({
          query: userOperations.Queries.friendRequests,
        });

        if (!existing) return;

        const { friendRequests } = existing;
        const {
          declineFriendRequest: { id: declinedFriendRequestId },
        } = subscriptionData;

        client.writeQuery<FriendRequestsData>({
          query: userOperations.Queries.friendRequests,
          data: {
            friendRequests: friendRequests.filter(
              (request) => request.id !== declinedFriendRequestId
            ),
          },
        });
      },
    }
  );

  useSubscription<SendFriendRequestData>(
    userOperations.Subscriptions.sendFriendRequest,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        if (subscriptionData.sendFriendRequest.sender.id === userId) return;

        console.log("sub data", subscriptionData);

        const existing = client.readQuery<FriendRequestsData>({
          query: userOperations.Queries.friendRequests,
        });

        if (!existing) return;

        const { friendRequests } = existing;
        const { sendFriendRequest } = subscriptionData;

        client.writeQuery<FriendRequestsData>({
          query: userOperations.Queries.friendRequests,
          data: {
            friendRequests: [sendFriendRequest, ...friendRequests],
          },
        });
      },
    }
  );

  /**
   * Mutations
   */
  const [signOut] = useMutation(userOperations.Mutation.signOut);

  const [updateParticipants, { loading: updateParticipantsLoading }] =
    useMutation<
      { updateParticipants: boolean },
      { conversationId: string; participantIds: Array<string> }
    >(conversationOperations.Mutations.updateParticipants);

  const [deleteConversation] = useMutation<
    { deleteConversation: boolean },
    { conversationId: string }
  >(conversationOperations.Mutations.deleteConversation);

  const onLeaveConversation = async (conversation: ConversationPopulated) => {
    const participantIds = conversation.participants
      .filter((p) => p.user.id !== userId)
      .map((p) => p.user.id);

    try {
      const { data, errors } = await updateParticipants({
        variables: {
          conversationId: conversation.id,
          participantIds,
        },
      });

      if (!data || errors) {
        throw new Error("Failed to update participants");
      }
    } catch (error: any) {
      console.log("onUpdateConversation error", error);
      toast.error(error.message);
    }
  };

  const onDeleteConversation = async (conversationId: string) => {
    try {
      toast.promise(
        deleteConversation({
          variables: {
            conversationId,
          },
          update: () => {
            router.replace(
              typeof process.env.NEXT_PUBLIC_BASE_URL === "string"
                ? process.env.NEXT_PUBLIC_BASE_URL
                : ""
            );
          },
        }),
        {
          loading: "Deleting...",
          success: "Conversation deleted",
          error: "Failed to delete conversation",
        }
      );
    } catch (error) {
      console.log("onDeleteConversation error", error);
    }
  };

  const getUserParticipantObject = (conversation: ConversationPopulated) => {
    return conversation.participants.find(
      (p) => p.user.id === user.id
    ) as ParticipantPopulated;
  };

  const onEditConversation = (conversation: ConversationPopulated) => {
    setEditingConversation(conversation);
    onOpenConvo();
  };

  const toggleCloseConvo = () => {
    setEditingConversation(null);
    onCloseConvo();
  };

  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()
  );

  const signOutHandler = async () => {
    try {
      await signOut();
      await router.push("/");
      reloadSession();
    } catch (error: any) {
      console.log("signout error", error);
      toast.error(error.message);
    }
  };

  return (
    <Box
      width={{ base: "100%", md: "400px" }}
      position="relative"
      height="100%"
      overflow="hidden"
    >
      <Flex mb={4} justify="space-between">
        <IconButton
          css={css`
            position: relative !important;
          `}
          bg="blackAlpha.300"
          aria-label="Friends"
          icon={
            <>
              <HiOutlineUsers />
              {friendRequestsData?.friendRequests &&
                friendRequestsData.friendRequests.length !== 0 && (
                  <Box
                    as={"span"}
                    color={"white"}
                    position={"absolute"}
                    top={"2px"}
                    right={"2px"}
                    fontSize={12}
                    bgColor={"red"}
                    borderRadius={"1000px"}
                    zIndex={9999}
                    width={4}
                    height={4}
                    p={"1px"}
                  >
                    {friendRequestsData.friendRequests.length}
                  </Box>
                )}
            </>
          }
          onClick={onOpenFriendRequests}
        />
        <IconButton
          bg="blackAlpha.300"
          aria-label="Friends"
          icon={<IoPersonAddOutline />}
          onClick={onOpenAddFriend}
        />
      </Flex>
      <Box
        py={2}
        px={4}
        mb={4}
        bg="blackAlpha.300"
        borderRadius={4}
        cursor="pointer"
        onClick={onOpenConvo}
      >
        <Text textAlign="center" color="whiteAlpha.800" fontWeight={500}>
          Find or start a conversation
        </Text>
      </Box>

      <AddFriendModal
        isOpen={isOpenAddFriend}
        onClose={onCloseAddFriend}
        user={user}
      />

      {friendRequestsData && (
        <FriendRequestModal
          isOpen={isOpenFriendRequest}
          onClose={onCloseFriendRequests}
          friendRequests={friendRequestsData.friendRequests}
        />
      )}

      <ConversationModal
        isOpen={isOpenConvo}
        onClose={toggleCloseConvo}
        user={user}
        conversations={conversations}
        editingConversation={editingConversation}
        getUserParticipantObject={getUserParticipantObject}
        onViewConversation={onViewConversation}
      />
      {sortedConversations.map((conversation) => {
        const participant = conversation.participants.find(
          (p) => p.user.id === user.id
        );
        return (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            onClick={() =>
              onViewConversation(
                conversation.id,
                participant?.hasSeenLatestMessage
              )
            }
            hasSeenLatestMessage={participant?.hasSeenLatestMessage}
            isSelected={conversation.id === router.query.conversationId}
            userId={userId}
            onDeleteConversation={onDeleteConversation}
            onLeaveConversation={onLeaveConversation}
            onEditConversation={() => onEditConversation(conversation)}
          />
        );
      })}
      <Box position="absolute" bottom={0} left={0} width="100%" px={8}>
        <Button onClick={signOutHandler} width="100%">
          sign out
        </Button>
      </Box>
    </Box>
  );
};

export default ConversationList;
