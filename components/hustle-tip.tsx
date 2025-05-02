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
    <Card className={cn("relative border border-white bg-black card-sharp shadow-lg w-full")}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-white hover:text-white"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss tip</span>
      </Button>
      <CardContent className="p-4 pr-10">
        <div className="flex flex-col gap-1">
          <h4 className="font-medium text-white gangster-font text-lg border-l-4 border-red-600 pl-2">{title}</h4>
          <div className="text-sm text-white/80 ml-2">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}
