import { ParticipantPopulated } from "./types";

export const formatUsernames = (
  participants: Array<ParticipantPopulated>,
  myUserId: string
): string => {
  const usernames = participants
    .filter((participant) => participant.user.id !== myUserId)
    .map((participant) => participant.user.username);

  return usernames.join(", ");
};

export const userIsConversationParticipant = (
  participants: Array<ParticipantPopulated>,
  userId: string
): boolean => {
  return !!participants.find((p) => p.user.id === userId);
};
