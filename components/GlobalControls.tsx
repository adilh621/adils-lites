"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GlobalControlsProps {
  lightsCount: number;
  onlineCount: number;
  onUpdate: () => void;
  globalColor: string;
  setGlobalColor: (color: string) => void;
}

export default function GlobalControls({
  lightsCount,
  onlineCount,
  onUpdate,
  globalColor,
  setGlobalColor,
}: GlobalControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleColorApply = async () => {
    setIsUpdating(true);
    try {
      await fetch("/api/lifx/lights/all/state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          color: globalColor,
          power: "on",
          duration: 0.5,
        }),
      });
      setTimeout(onUpdate, 500);
    } catch (error) {
      console.error("Failed to update lights:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="border-slate-700 bg-slate-900/70 backdrop-blur-sm shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white">All Lights</CardTitle>
        <p className="text-xs text-slate-400">
          {onlineCount} of {lightsCount} lights online
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Color Picker */}
          <div className="flex-shrink-0">
            <Label className="text-sm text-slate-300 mb-2 block">Pick a Color</Label>
            <HexColorPicker 
              color={globalColor} 
              onChange={setGlobalColor} 
              className="w-full md:w-auto" 
            />
          </div>

          {/* Hex Input and Apply Button */}
          <div className="flex-1 space-y-3 w-full">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Hex Code</Label>
              <Input
                value={globalColor}
                onChange={(e) => setGlobalColor(e.target.value)}
                placeholder="#a01889"
                className="border-slate-600 bg-slate-800 text-white"
              />
            </div>
            <Button
              onClick={handleColorApply}
              disabled={isUpdating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? "Applying..." : "Apply to All Lights"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
