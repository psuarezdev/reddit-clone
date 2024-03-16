'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import TextareaAutoSize from 'react-textarea-autosize';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import type EditorJS from '@editorjs/editorjs';
import { uploadFiles } from '@/lib/uploadthing';
import { PostCreationReq, PostValidator } from '@/lib/validators/post';
import { useToast } from '@/components/ui/use-toast';
import { usePathname, useRouter } from 'next/navigation';

interface EditorProps {
  subredditId: string;
}

export default function Editor({ subredditId }: EditorProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PostCreationReq>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      subredditId,
      title: '',
      content: null
    }
  });

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const ref = useRef<EditorJS>();
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { ref: titleRef, ...titleRest } = register('title');

  const initializeEditor = useCallback(async() => {
    const EditorJS = (await import('@editorjs/editorjs')).default;
    const Header = (await import('@editorjs/header')).default;
    const Embed = (await import('@editorjs/embed')).default;
    const Table = (await import('@editorjs/table')).default;
    const List = (await import('@editorjs/list')).default;
    const Code = (await import('@editorjs/code')).default;
    const LinkTool = (await import('@editorjs/link')).default;
    const InlineCode = (await import('@editorjs/inline-code')).default;
    const ImageTool = (await import('@editorjs/image')).default;

    if(!ref.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady: () => {
          ref.current = editor;
        },
        placeholder: 'Type here to write your post...',
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link',
            }
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const [res] = await uploadFiles('imageUploader', { files: [file] });

                  return {
                    success: 1,
                    file: { url: res.url }
                  };
                }
              }
            }
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed
        }
      });
    }
  }, []);

  const { mutate } = useMutation({
    mutationFn: async(payload: PostCreationReq) => {
      const res = await fetch('/api/subreddit/post/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return await res.json();
    },
    onError: () => {
      toast({
        title: 'Something went wrong',
        description: 'Your post could not be created',
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      const newPathname = pathname.split('/').slice(0, -1).join('/');

      router.push(newPathname);
      router.refresh();

      return toast({
        title: 'Post created',
        description: 'Your post has been created successfully',
        variant: 'success'
      });
    }
  });

  const onSubmit = async(data: PostCreationReq) => {
    const blocks = await ref.current?.save();

    const payload: PostCreationReq = {
      title: data.title,
      content: blocks,
      subredditId
    };

    mutate(payload);
  };

  useEffect(() => {
    if(typeof window !== 'undefined') {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if(Object.keys(errors).length > 0) {
      for(const [_key, value] of Object.entries(errors)) {
        toast({
          title: 'Something went wrong',
          description: (value as { message: string }).message,
          variant: 'destructive'
        });
      }
    }
  }, [errors, toast]);

  useEffect(() => {
    const init = async() => {
      if(isMounted) {
        await initializeEditor();

        setTimeout(() => {
          _titleRef.current?.focus();
        }, 0);
      }
    };

    if(isMounted) {
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form id="subreddit-post-form" className="w-fit" onSubmit={handleSubmit(onSubmit)}>
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutoSize
            ref={(e) => {
              titleRef(e);
              // @ts-ignore
              _titleRef.current = e;
            }}
            {...titleRest}
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
            placeholder="Title"
          />
          <div id="editor" className="min-h-[500px]" />
        </div>
      </form>
    </div>
  );
}
