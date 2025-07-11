import Image from 'next/image';
import { cn } from '@/lib/utils';
import { EditableText } from './editable-text';

type PolaroidProps = {
  src: string;
  caption: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  dataAiHint?: string;
  isEditable?: boolean;
  onCaptionSave?: (newCaption: string) => void;
};

export function Polaroid({ src, caption, className, style, children, dataAiHint, isEditable = false, onCaptionSave }: PolaroidProps) {
  return (
    <div
      className={cn(
        'bg-white p-4 pb-16 shadow-lg w-[280px] relative rounded-md border',
        className
      )}
      style={style}
    >
      <div className="bg-gray-100 aspect-square">
          {src ? (
            <Image
                src={src}
                alt={caption}
                width={248}
                height={248}
                className="w-full h-auto object-cover aspect-square"
                data-ai-hint={dataAiHint}
            />
          ) : (
            children
          )}
      </div>
       <div className="h-10 flex items-center justify-center absolute bottom-5 left-0 right-0 px-4">
          {isEditable && onCaptionSave ? (
            <EditableText 
              initialValue={caption}
              onSave={onCaptionSave}
              className="font-caption text-center text-xl text-accent w-full"
              inputClassName="font-caption text-xl text-center text-accent"
            />
          ) : (
            <p className="font-caption text-center text-xl text-accent truncate">
                {caption}
            </p>
          )}
      </div>
    </div>
  );
}
