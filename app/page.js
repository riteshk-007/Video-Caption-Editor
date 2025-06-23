"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import CaptionEditor from "../components/CaptionEditor";
import CaptionList from "../components/CaptionList";
import VideoUrlInput from "../components/VideoUrlInput";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Download, Upload, Play, Pause, RotateCcw } from "lucide-react";
import { formatTime, parseTime, validateTimestamp } from "../utils/timeUtils";
import VideoPlayer from "../components/VideoPlayer";

export default function Home() {
  // Core state management
  const [videoUrl, setVideoUrl] = useState("");
  const [captions, setCaptions] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (captions.length > 0) {
        localStorage.setItem(
          "video-captions",
          JSON.stringify({
            videoUrl,
            captions,
            lastModified: new Date().toISOString(),
          })
        );
      }
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [captions, videoUrl]);

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem("video-captions");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.captions && data.captions.length > 0) {
          setCaptions(data.captions);
          if (data.videoUrl) {
            setVideoUrl(data.videoUrl);
          }
          toast.success("Previous session restored");
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentTime((prev) => Math.max(0, prev - 5));
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentTime((prev) => Math.min(duration, prev + 5));
          break;
        case "Escape":
          setSelectedCaption(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [duration]);

  // Caption management functions
  const addCaption = useCallback(
    (captionData) => {
      const newCaption = {
        id: Date.now().toString(),
        startTime: parseTime(captionData.startTime),
        endTime: parseTime(captionData.endTime),
        text: captionData.text,
        style: captionData.style || {},
      };

      // Validate timestamp logic
      if (
        !validateTimestamp(newCaption.startTime, newCaption.endTime, duration)
      ) {
        toast.error(
          "Invalid timestamp: End time must be after start time and within video duration"
        );
        return;
      }

      // Check for overlapping captions
      const hasOverlap = captions.some(
        (caption) =>
          newCaption.startTime < caption.endTime &&
          newCaption.endTime > caption.startTime
      );

      if (hasOverlap) {
        toast.warning("Caption overlaps with existing caption");
      }

      setCaptions((prev) =>
        [...prev, newCaption].sort((a, b) => a.startTime - b.startTime)
      );
      toast.success("Caption added successfully");
    },
    [captions, duration]
  );

  const updateCaption = useCallback((id, updates) => {
    setCaptions((prev) =>
      prev.map((caption) =>
        caption.id === id ? { ...caption, ...updates } : caption
      )
    );
    toast.success("Caption updated");
  }, []);

  const deleteCaption = useCallback((id) => {
    setCaptions((prev) => prev.filter((caption) => caption.id !== id));
    setSelectedCaption(null);
    toast.success("Caption deleted");
  }, []);

  const seekToCaption = useCallback((startTime) => {
    setCurrentTime(startTime);
    setIsPlaying(true);
  }, []);

  // Export/Import functionality
  const exportCaptions = useCallback(() => {
    if (captions.length === 0) {
      toast.error("No captions to export");
      return;
    }

    const data = {
      videoUrl,
      captions: captions.map((cap) => ({
        startTime: formatTime(cap.startTime),
        endTime: formatTime(cap.endTime),
        text: cap.text,
        style: cap.style,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `captions-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Captions exported successfully");
  }, [captions, videoUrl]);

  const importCaptions = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.captions && Array.isArray(data.captions)) {
          const importedCaptions = data.captions.map((cap, index) => ({
            id: `imported-${Date.now()}-${index}`,
            startTime: parseTime(cap.startTime),
            endTime: parseTime(cap.endTime),
            text: cap.text,
            style: cap.style || {},
          }));

          setCaptions(importedCaptions);
          if (data.videoUrl) {
            setVideoUrl(data.videoUrl);
          }
          toast.success(`Imported ${importedCaptions.length} captions`);
        } else {
          toast.error("Invalid caption file format");
        }
      } catch (error) {
        toast.error("Error reading caption file");
      }
    };
    reader.readAsText(file);
  }, []);

  const resetAll = useCallback(() => {
    setCaptions([]);
    setVideoUrl("");
    setCurrentTime(0);
    setSelectedCaption(null);
    setIsPlaying(false);
    localStorage.removeItem("video-captions");
    toast.success("All data cleared");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 lg:mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            Video Caption Editor
          </h1>
          <p className="text-slate-400 text-sm lg:text-base">
            Professional video captioning and subtitle editing tool
          </p>
        </motion.div>

        {/* Video URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 lg:mb-8"
        >
          <VideoUrlInput
            value={videoUrl}
            onChange={setVideoUrl}
            onValidUrl={() => setIsVideoReady(true)}
          />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
          {/* Video Player Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-2 order-1"
          >
            <Card className="p-4 lg:p-6 bg-white/5 backdrop-blur-sm border-white/10">
              <VideoPlayer
                url={videoUrl}
                currentTime={currentTime}
                isPlaying={isPlaying}
                captions={captions}
                onTimeUpdate={setCurrentTime}
                onDurationChange={setDuration}
                onPlayPause={setIsPlaying}
                onReady={() => setIsVideoReady(true)}
              />

              {/* Video Controls */}
              {isVideoReady && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 space-y-4"
                >
                  {/* Playback Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <div className="text-sm text-slate-400">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportCaptions}
                      disabled={captions.length === 0}
                      className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importCaptions}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetAll}
                      className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Caption Management Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-1 order-2"
          >
            <Card className="p-4 lg:p-6 bg-white/5 backdrop-blur-sm border-white/10 h-fit">
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 lg:mb-6 bg-white/10">
                  <TabsTrigger
                    value="editor"
                    className="data-[state=active]:bg-blue-500/30 text-xs sm:text-sm"
                  >
                    Editor
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    className="data-[state=active]:bg-blue-500/30 text-xs sm:text-sm"
                  >
                    Captions ({captions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="space-y-4">
                  <CaptionEditor
                    onAddCaption={addCaption}
                    currentTime={currentTime}
                    duration={duration}
                    selectedCaption={selectedCaption}
                    onUpdateCaption={updateCaption}
                    disabled={!isVideoReady}
                  />
                </TabsContent>

                <TabsContent value="list" className="space-y-4">
                  <CaptionList
                    captions={captions}
                    currentTime={currentTime}
                    onEdit={setSelectedCaption}
                    onDelete={deleteCaption}
                    onSeek={seekToCaption}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 lg:mt-8"
        >
          <Card className="p-3 lg:p-4 bg-white/5 backdrop-blur-sm border-white/10">
            <div className="text-center text-xs lg:text-sm text-slate-400">
              <strong className="text-white">Keyboard Shortcuts:</strong>
              <div className="flex flex-wrap justify-center gap-2 lg:gap-4 mt-2 lg:mt-0 lg:inline">
                <span className="flex items-center gap-1">
                  <span className="hidden lg:inline mx-2">•</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs">
                    Space
                  </kbd>
                  <span className="text-xs lg:text-sm">Play/Pause</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="hidden lg:inline mx-2">•</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs">
                    ←/→
                  </kbd>
                  <span className="text-xs lg:text-sm">Seek ±5s</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="hidden lg:inline mx-2">•</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs">
                    Esc
                  </kbd>
                  <span className="text-xs lg:text-sm">Deselect</span>
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
