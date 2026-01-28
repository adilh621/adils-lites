"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import LightCard from "@/components/LightCard";
import GlobalControls from "@/components/GlobalControls";
import EffectsAndScenes from "@/components/EffectsAndScenes";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [globalHex, setGlobalHex] = useState("#a01889");
  
  // Fetch lights with auto-refresh every 5 seconds
  const { data: lights, error, mutate } = useSWR("/api/lifx/lights", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    // Get user email from cookie
    const cookies = document.cookie.split(";");
    const emailCookie = cookies.find((c) => c.trim().startsWith("user_email="));
    if (emailCookie) {
      setUserEmail(emailCookie.split("=")[1]);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRefresh = () => {
    mutate();
  };

  // Calculate stats
  const lightsArray = Array.isArray(lights) ? lights : [];
  const onlineCount = lightsArray.filter((l: any) => l.connected).length;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            Adil&apos;s Lites
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {userEmail && (
              <span className="text-sm text-slate-400">{userEmail}</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              Logout
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-5xl space-y-6">
          {/* Header with Refresh Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-xl font-semibold text-white">
              Your Lights
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!lights}
              className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              Refresh
            </Button>
          </motion.div>

          {/* Loading State */}
          {!lights && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-slate-400">Loading lights...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-red-400">
                Failed to load lights. Please check your LIFX configuration.
              </p>
            </motion.div>
          )}

          {/* Global Controls */}
          {lightsArray.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlobalControls
                lightsCount={lightsArray.length}
                onlineCount={onlineCount}
                onUpdate={handleRefresh}
                globalColor={globalHex}
                setGlobalColor={setGlobalHex}
              />
            </motion.div>
          )}

          {/* Effects & Scenes */}
          {lightsArray.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <EffectsAndScenes 
                globalColor={globalHex} 
                onUpdate={handleRefresh}
              />
            </motion.div>
          )}

          {/* Individual Light Cards */}
          {lightsArray.length > 0 && (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {lightsArray.map((light: any, index: number) => (
                <motion.div
                  key={light.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <LightCard light={light} onUpdate={handleRefresh} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {lightsArray.length === 0 && !error && lights && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-slate-400">
                No lights found. Make sure your LIFX lights are connected.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
