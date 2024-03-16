import { getAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Comment from './comment';
import CreateComment from './create-comment';

interface CommentsProps {
  postId: string;
}

export default async function Comments({ postId }: CommentsProps) {
  const session = await getAuth();

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      replyToId: undefined
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true
        }
      }
    }
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />
      <CreateComment postId={postId} />
      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter(comment => !comment.replyToId)
          .map(topLevelComment => {
            const votesAmount = topLevelComment.votes.reduce((acc, vote) => acc + (vote.type === 'UP' ? 1 : -1), 0);
            const vote = topLevelComment.votes.find(({ userId }) => userId === session?.user.id);

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <Comment
                    comment={topLevelComment}
                    votesAmount={votesAmount}
                    initialVote={vote?.type}
                    postId={postId}
                  />
                </div>
                {topLevelComment
                  .replies
                  .sort((a, b) => b.votes.length - a.votes.length)
                  .map(reply => {
                    const replyVotesAmount = reply.votes.reduce((acc, vote) => acc + (vote.type === 'UP' ? 1 : -1), 0);
                    const replyVote = reply.votes.find(({ userId }) => userId === session?.user.id);

                    return (
                      <div key={reply.id} className="ml-2 py-2 pl-4 border-l-2 border-zinc-200">
                        <Comment
                          comment={reply}
                          votesAmount={replyVotesAmount}
                          initialVote={replyVote?.type}
                          postId={postId}
                        />
                      </div>
                    );
                  })
                }
              </div>
            );
          })}
      </div>
    </div>
  );
}
