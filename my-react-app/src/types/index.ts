export interface Subject {
  id: string;
  name: string;
  rating: number;
  votes: number;
  image?: string; // Emoji or icon for the subject
  description?: string; // Brief description of the subject
}

export interface UserVote {
  subjectId: string;
  rating: number;
  timestamp?: string; // When the vote was cast
}

export interface VotingSession {
  sessionId: string;
  startTime: string;
  lastActivity: string;
  subjects: Subject[];
  userVotes: UserVote[];
}