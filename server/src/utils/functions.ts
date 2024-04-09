import { participantPopulated } from "./types";

export const userIsConversationParticipant = (
  participants: Array<participantPopulated>,
  userId: string
): boolean => {
  return !!participants.find((p) => p.userId === userId);
};
