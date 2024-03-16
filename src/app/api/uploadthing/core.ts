import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getAuth } from '@/lib/auth';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .middleware(async () => {
      const session = await getAuth();

      if (!session?.user) throw new Error('Unauthorized');

      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;