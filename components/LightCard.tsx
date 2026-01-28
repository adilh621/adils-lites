"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Light {
  id: string;
  label: string;
  power: string;
  brightness: number;
  color?: {
    hue: number;
    saturation: number;
    kelvin: number;
    hex?: string;
  };
  group?: {
    name: string;
  };
  location?: {
    name: string;
  };
  connected: boolean;
}

interface LightCardProps {
  light: Light;
  onUpdate: () => void;
}

export default function LightCard({ light, onUpdate }: LightCardProps) {
  const [localBrightness, setLocalBrightness] = useState(light.brightness);
  const [localPower, setLocalPower] = useState(light.power);
  const [isUpdatingBrightness, setIsUpdatingBrightness] = useState(false);
  const [isTogglingPower, setIsTogglingPower] = useState(false);
  const brightnessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local brightness when light prop changes
  useEffect(() => {
    setLocalBrightness(light.brightness);
  }, [light.brightness]);

  // Update local power when light prop changes
  useEffect(() => {
    setLocalPower(light.power);
  }, [light.power]);

  const handlePowerToggle = async (checked: boolean) => {
    const nextPower = checked ? "on" : "off";
    const selector = `id:${light.id}`;
    
    // Optimistically update local state immediately
    setLocalPower(nextPower);
    setIsTogglingPower(true);
    
    try {
      await fetch(`/api/lifx/lights/${encodeURIComponent(selector)}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          power: nextPower, 
          duration: 0.3 
        }),
      });
      setTimeout(onUpdate, 500);
    } catch (error) {
      console.error("Failed to toggle power:", error);
      // Revert on error
      setLocalPower(light.power);
    } finally {
      setIsTogglingPower(false);
    }
  };

  const handleBrightnessChange = (value: number[]) => {
    const newBrightness = value[0] / 100; // Convert to 0-1 range
    setLocalBrightness(newBrightness);

    // Clear existing timeout
    if (brightnessTimeoutRef.current) {
      clearTimeout(brightnessTimeoutRef.current);
    }

    // Set new timeout for debounced API call
    brightnessTimeoutRef.current = setTimeout(async () => {
      const selector = `id:${light.id}`;
      setIsUpdatingBrightness(true);
      try {
        await fetch(`/api/lifx/lights/${encodeURIComponent(selector)}/state`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brightness: newBrightness,
            duration: 0.3,
          }),
        });
        setTimeout(onUpdate, 500);
      } catch (error) {
        console.error("Failed to update brightness:", error);
      } finally {
        setIsUpdatingBrightness(false);
      }
    }, 400);
  };

  // Convert LIFX hue (0-360) to hex color for display
  const getColorHex = () => {
    // Check if hex is already provided
    if (light.color?.hex) return light.color.hex;
    
    if (!light.color) return "#ffffff";
    const h = light.color.hue;
    const s = light.color.saturation;
    const l = 0.5;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  return (
    <Card className="border-slate-700 bg-slate-900/70 backdrop-blur-sm shadow-lg rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <span className="text-lg">{light.label}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-4 h-4 transition-colors ${localPower === "on" ? "text-green-400" : "text-slate-500"}`}
              >
                <path d="M12 2v10" />
                <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
              </svg>
              <span className="text-xs text-slate-400">Power</span>
            </div>
            <Switch
              checked={localPower === "on"}
              onCheckedChange={handlePowerToggle}
              disabled={!light.connected || isTogglingPower}
            />
          </div>
        </CardTitle>
        {(light.group || light.location) && (
          <p className="text-xs text-slate-400">
            {light.group?.name || light.location?.name}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Status:</span>
          <span className={light.connected ? "text-green-400" : "text-red-400"}>
            {light.connected ? "Online" : "Offline"}
          </span>
        </div>

        {/* Brightness Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label className="text-slate-400">Brightness</Label>
            <span className="text-slate-300">
              {Math.round(localBrightness * 100)}%
            </span>
          </div>
          <Slider
            value={[localBrightness * 100]}
            onValueChange={handleBrightnessChange}
            max={100}
            step={1}
            disabled={!light.connected}
            className="cursor-pointer"
          />
          {isUpdatingBrightness && (
            <p className="text-[10px] text-slate-500">Updating brightness...</p>
          )}
        </div>

        {/* Color Display */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-400">Color</Label>
          <div className="flex items-center gap-2">
            <div
              className="h-10 w-10 rounded-md border-2 border-slate-600 shadow-inner"
              style={{ backgroundColor: getColorHex() }}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!light.connected}
              className="border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600"
            >
              Change Color
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
