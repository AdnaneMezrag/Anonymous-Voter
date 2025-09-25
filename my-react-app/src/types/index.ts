export interface Subject {
  id: string;
  name: string;
  rating: number;
  votes: number;
}

export interface UserVote {
  subjectId: string;
  rating: number;
}