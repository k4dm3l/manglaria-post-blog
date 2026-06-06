"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PublishControlsProps {
  published: boolean;
  scheduledFor?: Date | undefined;
  isLoading?: boolean;
  onPublishedChange: (value: boolean) => void;
  onScheduledForChange: (value: Date | undefined) => void;
}

export function PublishControls({
  published,
  scheduledFor,
  isLoading = false,
  onPublishedChange,
  onScheduledForChange,
}: PublishControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={published}
          onCheckedChange={onPublishedChange}
          disabled={isLoading || !!scheduledFor}
        />
        <Label htmlFor="published">Publicar inmediatamente</Label>
      </div>

      {!published && (
        <div className="space-y-2">
          <Label htmlFor="scheduled-date">Programar para más tarde</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="scheduled-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !scheduledFor && "text-muted-foreground"
                )}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduledFor ? (
                  format(scheduledFor, "PPP")
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={scheduledFor}
                onSelect={onScheduledForChange}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
