"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Scene {
  uuid: string;
  name: string;
}

interface EffectsAndScenesProps {
  globalColor: string;
  onUpdate?: () => void;
}

export default function EffectsAndScenes({ globalColor, onUpdate }: EffectsAndScenesProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedScene, setSelectedScene] = useState<string>("");
  const [isLoadingScenes, setIsLoadingScenes] = useState(true);
  const [isApplyingEffect, setIsApplyingEffect] = useState<string | null>(null);
  const [isActivatingScene, setIsActivatingScene] = useState(false);

  useEffect(() => {
    fetchScenes();
  }, []);

  const fetchScenes = async () => {
    try {
      setIsLoadingScenes(true);
      const response = await fetch("/api/lifx/scenes");
      if (response.ok) {
        const data = await response.json();
        setScenes(data);
      }
    } catch (error) {
      console.error("Failed to fetch scenes:", error);
    } finally {
      setIsLoadingScenes(false);
    }
  };

  const applyBreatheEffect = async () => {
    setIsApplyingEffect("breathe");
    try {
      await fetch("/api/lifx/lights/all/effects/breathe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          color: globalColor,
          period: 1,
          cycles: 3,
          power_on: true,
          persist: false,
          peak: 0.5,
        }),
      });
      setTimeout(() => onUpdate?.(), 500);
    } catch (error) {
      console.error("Failed to apply breathe effect:", error);
    } finally {
      setIsApplyingEffect(null);
    }
  };

  const applyMorphEffect = async () => {
    setIsApplyingEffect("morph");
    try {
      await fetch("/api/lifx/lights/all/effects/morph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: 5,
          duration: null,
          palette: ["red", "orange", "yellow", "green", "blue", "purple"],
          power_on: true,
          fast: false,
        }),
      });
      setTimeout(() => onUpdate?.(), 500);
    } catch (error) {
      console.error("Failed to apply morph effect:", error);
    } finally {
      setIsApplyingEffect(null);
    }
  };

  const applyMoveEffect = async () => {
    setIsApplyingEffect("move");
    try {
      await fetch("/api/lifx/lights/all/effects/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: "forward",
          period: 1,
          cycles: null,
          power_on: true,
          fast: false,
        }),
      });
      setTimeout(() => onUpdate?.(), 500);
    } catch (error) {
      console.error("Failed to apply move effect:", error);
    } finally {
      setIsApplyingEffect(null);
    }
  };

  const stopEffects = async () => {
    setIsApplyingEffect("stop");
    try {
      await fetch("/api/lifx/lights/all/effects/off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          power_off: false,
        }),
      });
      setTimeout(() => onUpdate?.(), 500);
    } catch (error) {
      console.error("Failed to stop effects:", error);
    } finally {
      setIsApplyingEffect(null);
    }
  };

  const activateScene = async () => {
    if (!selectedScene) return;
    
    setIsActivatingScene(true);
    try {
      await fetch(`/api/lifx/scenes/${selectedScene}/activate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: 1,
          fast: false,
        }),
      });
      setTimeout(() => onUpdate?.(), 1000);
    } catch (error) {
      console.error("Failed to activate scene:", error);
    } finally {
      setIsActivatingScene(false);
    }
  };

  return (
    <Card className="border-slate-700 bg-slate-900/70 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Effects &amp; Scenes</CardTitle>
        <p className="text-xs text-slate-400">
          Apply dynamic effects or activate saved scenes
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick Effects */}
          <div className="space-y-3">
            <Label className="text-sm text-slate-300">Quick Effects</Label>
            <div className="flex flex-col gap-2">
              <Button
                onClick={applyBreatheEffect}
                disabled={isApplyingEffect !== null}
                variant="outline"
                size="sm"
                className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                {isApplyingEffect === "breathe" ? "Applying..." : "Breathe"}
              </Button>
              <Button
                onClick={applyMorphEffect}
                disabled={isApplyingEffect !== null}
                variant="outline"
                size="sm"
                className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                {isApplyingEffect === "morph" ? "Applying..." : "Morph"}
              </Button>
              <Button
                onClick={applyMoveEffect}
                disabled={isApplyingEffect !== null}
                variant="outline"
                size="sm"
                className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                {isApplyingEffect === "move" ? "Applying..." : "Move (Zones)"}
              </Button>
              <Button
                onClick={stopEffects}
                disabled={isApplyingEffect !== null}
                variant="outline"
                size="sm"
                className="border-red-600 bg-red-900/30 text-red-400 hover:bg-red-900/50 hover:text-red-300"
              >
                {isApplyingEffect === "stop" ? "Stopping..." : "Stop Effects"}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">
              Note: Some effects only work on strips/tiles. Effects target your current light selection.
            </p>
          </div>

          {/* Scenes */}
          <div className="space-y-3">
            <Label className="text-sm text-slate-300">Activate Scene</Label>
            <div className="space-y-2">
              <select
                value={selectedScene}
                onChange={(e) => setSelectedScene(e.target.value)}
                disabled={isLoadingScenes || scenes.length === 0}
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">
                  {isLoadingScenes ? "Loading..." : scenes.length === 0 ? "No scenes available" : "Select a scene"}
                </option>
                {scenes.map((scene) => (
                  <option key={scene.uuid} value={scene.uuid}>
                    {scene.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={activateScene}
                disabled={!selectedScene || isActivatingScene}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isActivatingScene ? "Activating..." : "Activate"}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">
              Scenes are pulled from your LIFX account.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
