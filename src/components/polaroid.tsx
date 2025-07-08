import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

type PolaroidProps = {
  src: string;
  caption: string;
  dataAiHint?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
};

export function Polaroid({ src, caption, dataAiHint, className, style, loading }: PolaroidProps) {
  return (
    <div
      className={cn(
        'bg-white p-4 pb-16 shadow-lg w-[280px] relative rounded-md border',
        className
      )}
      style={style}
    >
      <div className="bg-gray-100">
        {loading ? (
            <Skeleton className="w-full h-[248px]" />
        ) : (
            <Image
              src={src}
              alt={caption}
              width={248}
              height={248}
              className="w-full h-auto object-cover aspect-square"
              data-ai-hint={dataAiHint}
            />
        )}
      </div>
       <div className="h-10 flex items-center justify-center absolute bottom-5 left-0 right-0 px-4">
        {loading ? (
            <Skeleton className="h-4 w-3/4" />
        ) : (
            <p className="font-headline text-center text-2xl text-accent truncate">
                {caption}
            </p>
        )}
      </div>
    </div>
  );
}
