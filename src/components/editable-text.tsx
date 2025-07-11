'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

type EditableTextProps = {
  initialValue: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
  isTextarea?: boolean;
};

export function EditableText({ initialValue, onSave, className, inputClassName, isTextarea = false }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing) {
      if (isTextarea) {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      } else {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
  }, [isEditing, isTextarea]);

  const handleSave = () => {
    if (value.trim()) {
      onSave(value);
    } else {
      setValue(initialValue); // Revert if empty
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isTextarea) {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  }

  if (isEditing) {
    if (isTextarea) {
       return (
        <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={cn("h-auto p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent", inputClassName)}
            rows={3}
        />
       )
    }
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("h-auto p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent", inputClassName)}
      />
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className={cn("cursor-text hover:bg-white/50 rounded-md p-1 min-h-[2.5rem] whitespace-pre-wrap", className)}>
      {value}
    </div>
  );
}
