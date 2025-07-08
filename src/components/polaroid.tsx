import Image from 'next/image';
import { cn } from '@/lib/utils';

type PolaroidProps = {
  src: string;
  caption: string;
  dataAiHint?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function Polaroid({ src, caption, dataAiHint, className, style }: PolaroidProps) {
  return (
    <div
      className={cn(
        'bg-white p-4 pb-16 shadow-lg w-[280px] relative rounded-md border',
        className
      )}
      style={style}
    >
      <div className="bg-gray-100">
        <Image
          src={src}
          alt={caption}
          width={248}
          height={248}
          className="w-full h-auto object-cover aspect-square"
          data-ai-hint={dataAiHint}
        />
      </div>
      <p className="font-headline text-center text-2xl text-accent absolute bottom-5 left-0 right-0 px-4">
        {caption}
      </p>
    </div>
  );
}
