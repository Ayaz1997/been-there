"use client";

import { useState, useTransition } from 'react';
import { suggestHashtags } from '@/ai/flows/suggest-hashtags';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from './ui/skeleton';

type HashtagGeneratorProps = {
  imageDescriptions: string[];
};

export function HashtagGenerator({ imageDescriptions }: HashtagGeneratorProps) {
  const [isPending, startTransition] = useTransition();
  const [hashtags, setHashtags] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerateHashtags = () => {
    if (imageDescriptions.length === 0) {
      toast({
        title: "No images yet!",
        description: "Please add some images before generating hashtags.",
        variant: "destructive"
      });
      return;
    }
    
    startTransition(async () => {
      try {
        const result = await suggestHashtags({ imageDescriptions });
        if (result && result.hashtags) {
          setHashtags(result.hashtags);
        } else {
          throw new Error("Invalid response from AI");
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not generate hashtags. Please try again.",
          variant: "destructive"
        });
      }
    });
  };
  
  const copyToClipboard = (text: string, singleTag: boolean = false) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: singleTag ? `"${text}" copied.` : `${hashtags.length} hashtags copied.`
    });
  };

  return (
    <div className="text-center flex flex-col items-center">
        <h2 className="font-headline text-3xl md:text-4xl text-primary mb-4">Get Inspired</h2>
        <p className="text-muted-foreground mb-6 max-w-xl">
            Let our AI suggest relevant hashtags for your travel story based on your captions.
        </p>
      <Button onClick={handleGenerateHashtags} disabled={isPending || imageDescriptions.length === 0}>
        <Wand2 className="mr-2 h-4 w-4" />
        {isPending ? 'Generating...' : 'Suggest Hashtags'}
      </Button>
      
      <div className="mt-8 w-full">
        {isPending && (
          <div className="flex flex-wrap justify-center gap-2">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
          </div>
        )}
        {hashtags.length > 0 && !isPending && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              {hashtags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-base py-1 px-3 group cursor-pointer transition-transform hover:scale-105" 
                  onClick={() => copyToClipboard(tag, true)}
                  role="button"
                  aria-label={`Copy hashtag ${tag}`}
                >
                  {tag}
                  <Copy className="ml-2 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Badge>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-4 text-primary hover:text-primary" onClick={() => copyToClipboard(hashtags.join(' '))}>
                <Copy className="mr-2 h-4 w-4" />
                Copy all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
