import { ParticipantPopulated, participantPopulated } from "./types";

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
  participants: Array<participantPopulated>,
  userId: string
): boolean => {
  return !!participants.find((p) => p.userId === userId);
};
