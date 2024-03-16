'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';

const Output = dynamic(async () => (await import('editorjs-react-renderer')).default, { ssr: false });

interface EditorOutPutProps {
  content: any;
}

const style = {
  paragraph: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem'
  }
};

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer
};

export default function EditorOutPut({ content }: EditorOutPutProps) {
  return (
    <Output 
      className="text-sm" 
      renderers={renderers}
      style={style}
      data={content} 
    />
  );
}

function CustomImageRenderer({ data }: any) {
  return(
    <div className="relative w-full min-h-[15rem]">
      <Image 
        className="object-contain"
        src={data.file.url}
        alt={data.caption}
        fill
      />
    </div>
  );
}

function CustomCodeRenderer({ data }: any) {
  return (
    <pre className="bg-gray-800 rounded-md p-4">
      <code className="text-gray-100 text-sm">{data.code}</code>
    </pre>
  );
}
