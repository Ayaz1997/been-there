import Image from 'next/image';
import { cn } from '@/lib/utils';

type PolaroidProps = {
  src: string;
  caption: string;
  className?: string;
  style?: React.CSSProperties;
};

export function Polaroid({ src, caption, className, style }: PolaroidProps) {
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
          />
      </div>
       <div className="h-10 flex items-center justify-center absolute bottom-5 left-0 right-0 px-4">
          <p className="font-caption text-center text-3xl text-accent truncate">
              {caption}
          </p>
      </div>
    </div>
  );
}
