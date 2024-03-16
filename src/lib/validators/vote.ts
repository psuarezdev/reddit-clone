import { z } from 'zod';

export const PostVoteValidator = z.object({
  postId: z.string(),
  voteType: z.enum(['UP', 'DOWN'])
});

export type PostVoteReq = z.infer<typeof PostVoteValidator>;

export const CommentVoteValidator = z.object({
  commentId: z.string(),
  voteType: z.enum(['UP', 'DOWN'])
});

export type CommentVoteReq = z.infer<typeof CommentVoteValidator>;