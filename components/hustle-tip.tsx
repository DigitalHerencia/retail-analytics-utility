"use client";

import type React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HustleTipProps {
  title: string;
  children: React.ReactNode;
}

export function HustleTip({ title, children }: HustleTipProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <Card className={cn("relative border-0 border-l-4 bg-smoke card-sharp max-w-xs")}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 text-white hover:text-white"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss tip</span>
      </Button>
      <CardContent className="p-3 pr-7">
        <div className="flex flex-col items-center text-center gap-2">
          <div>
            <h4 className="font-medium text-white text-sm gangster-font [text-shadow:_1px_1px_2px_rgb(0_0_0_/_50%)]">{title}</h4>
            <div className="text-xs mt-0.5 text-white line-clamp-3">{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
