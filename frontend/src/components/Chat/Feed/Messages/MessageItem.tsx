import {
  Avatar,
  Box,
  Button,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Text,
} from "@chakra-ui/react";
import { MessageIsFriend, MessagePopulated } from "../../../../util/types";
import { formatRelative } from "date-fns";
import enUS from "date-fns/locale/en-US";

interface MessageItemProps {
  message: MessageIsFriend;
  sentByMe: boolean;
  sendRequest: (receiverId: string) => void;
}

const formateRelativeLocale = {
  lastWeek: "eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "p",
  other: "MM/dd/yy",
};

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  sentByMe,
  sendRequest,
}) => {
  return (
    <Popover>
      <Stack
        direction="row"
        p={4}
        spacing={4}
        _hover={{ bg: "whiteAlpha.200" }}
        justify={sentByMe ? "flex-end" : "flex-start"}
        wordBreak="break-word"
      >
        {!sentByMe && (
          <PopoverTrigger>
            <Flex align="flex-end" cursor="pointer">
              <Avatar size="sm" />
            </Flex>
          </PopoverTrigger>
        )}
        <Stack spacing={1} width="100%">
          <Stack
            direction="row"
            align="center"
            justify={sentByMe ? "flex-end" : "flex-start"}
          >
            {!sentByMe && (
              <PopoverTrigger>
                <Text cursor="pointer" fontWeight={500} textAlign="left">
                  {message.sender.username}
                </Text>
              </PopoverTrigger>
            )}
            <Text fontSize={14} color="whiteAlpha.700">
              {formatRelative(message.createdAt, new Date(), {
                locale: {
                  ...enUS,
                  formatRelative: (token) =>
                    formateRelativeLocale[
                      token as keyof typeof formateRelativeLocale
                    ],
                },
              })}
            </Text>
          </Stack>
          <Flex justify={sentByMe ? "flex-end" : "flex-start"}>
            <Box
              bg={sentByMe ? "brand.100" : "whiteAlpha.300"}
              px={2}
              py={1}
              borderRadius={12}
              maxWidth="65%"
            >
              <Text>{message.body}</Text>
            </Box>
          </Flex>
        </Stack>
      </Stack>
      <PopoverContent border="none">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Stack
            key={message.sender.id}
            direction="row"
            align="center"
            spacing={4}
            py={4}
            px={6}
            borderRadius={4}
          >
            <Avatar />
            <Flex justify="space-between" align="center" width="100%" gap={5}>
              <Text color="whiteAlpha.700">{message.sender.username}</Text>
              <Button
                bg="brand.100"
                _hover={{ bg: "brand.100" }}
                isDisabled={message.sender.friendshipStatus !== "SENDABLE"}
                onClick={() => {
                  sendRequest(message.sender.id);
                }}
              >
                {message.sender.friendshipStatus == "SENDABLE" && "+ Add"}
                {message.sender.friendshipStatus == "ACCEPTED" && "Friends"}
                {message.sender.friendshipStatus == "DECLINED" &&
                  "Already Sent"}
                {message.sender.friendshipStatus == "PENDING" && "Already Sent"}
              </Button>
            </Flex>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default MessageItem;
