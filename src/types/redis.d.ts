import { Vote } from '@prisma/client';

export interface CachedPost {
  id: string;
  title: string;
  authorName: string;
  content: string;
  currentVote: Vote['type'] | null;
  createdAt: Date;
}