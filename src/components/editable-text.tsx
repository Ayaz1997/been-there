'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';

type EditableTextProps = {
  initialValue: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
};

export function EditableText({ initialValue, onSave, className, inputClassName }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (value.trim()) {
      onSave(value);
    } else {
      setValue(initialValue); // Revert if empty
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("h-auto p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-center", inputClassName)}
      />
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className={cn("cursor-text hover:bg-white/50 rounded-md p-1", className)}>
      {value}
    </div>
  );
}
