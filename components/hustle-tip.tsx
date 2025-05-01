import type React from "react";
import { useState } from "react"; // Import useState
import { X } from "lucide-react"; // Import X icon
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Import Button

interface HustleTipProps {
  title: string;
  children: React.ReactNode;
}

export function HustleTip({ title, children }: HustleTipProps) {
  const [isVisible, setIsVisible] = useState(true); // Add state for visibility

  if (!isVisible) {
    return null; // Don't render if not visible
  }

  return (
    <Card className="relative border-0 border-l-4 border-l-gold bg-smoke card-sharp"> {/* Add relative positioning */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-white"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss tip</span>
      </Button>
      <CardContent className="p-4 pr-8"> {/* Add padding to the right to avoid overlap */}
        <div className="flex items-start gap-3">
          <div>
            <h4 className="font-medium text-gold gangster-font [text-shadow:_1px_1px_2px_rgb(0_0_0_/_50%)]">{title}</h4>
            <div className="text-sm mt-1 text-muted-foreground line-clamp-3">{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
