import { participantPopulated } from "./types";

export const userIsConversationParticipant = (
  participants: Array<participantPopulated>,
  userId: string
): boolean => {
  console.log("isParticipant", participants, userId);
  return !!participants.find((p) => p.userId === userId);
};
