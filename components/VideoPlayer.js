"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactPlayer from "react-player";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { Card } from "../components/ui/card";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { formatTime } from "../utils/timeUtils";

const VideoPlayer = ({
  url,
  currentTime,
  isPlaying,
  captions,
  onTimeUpdate,
  onDurationChange,
  onPlayPause,
  onReady,
}) => {
  const playerRef = useRef(null);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout;
    if (showControls) {
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isPlaying]);

  // Sync external currentTime with player
  useEffect(() => {
    if (playerRef.current && isReady) {
      const playerCurrentTime = playerRef.current.getCurrentTime();
      if (Math.abs(playerCurrentTime - currentTime) > 1) {
        playerRef.current.seekTo(currentTime, "seconds");
      }
    }
  }, [currentTime, isReady]);

  // Get current active caption
  const getCurrentCaption = () => {
    return captions.find(
      (caption) =>
        currentTime >= caption.startTime && currentTime <= caption.endTime
    );
  };

  const handleProgress = (state) => {
    onTimeUpdate(state.playedSeconds);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
    onDurationChange(duration);
  };

  const handleReady = () => {
    setIsReady(true);
    onReady && onReady();
  };

  const handleSeek = (value) => {
    const seekTime = (value[0] / 100) * duration;
    onTimeUpdate(seekTime);
    if (playerRef.current) {
      playerRef.current.seekTo(seekTime, "seconds");
    }
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    onTimeUpdate(newTime);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, "seconds");
    }
  };

  const currentCaption = getCurrentCaption();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!url) {
    return (
      <Card className="aspect-video bg-slate-800/50 border-slate-700 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No video loaded</p>
          <p className="text-sm">Enter a video URL to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <div
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video Player */}
      <div className="aspect-video">
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={isMuted ? 0 : volume}
          playbackRate={playbackRate}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onReady={handleReady}
          onPlay={() => onPlayPause(true)}
          onPause={() => onPlayPause(false)}
          config={{
            youtube: {
              playerVars: {
                controls: 0,
                disablekb: 1,
                modestbranding: 1,
                rel: 0,
              },
            },
            vimeo: {
              playerOptions: {
                controls: false,
                title: false,
                byline: false,
                portrait: false,
              },
            },
          }}
        />
      </div>

      {/* Caption Overlay */}
      <AnimatePresence>
        {currentCaption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div
              className="bg-black/80 text-white px-4 py-2 rounded-lg max-w-lg text-center backdrop-blur-sm"
              style={{
                fontSize: currentCaption.style?.fontSize || "16px",
                color: currentCaption.style?.color || "white",
                fontWeight: currentCaption.style?.fontWeight || "normal",
              }}
            >
              {currentCaption.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"
          >
            {/* Center Play Button */}
            {!isPlaying && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Button
                  onClick={() => onPlayPause(true)}
                  className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/30"
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </Button>
              </motion.div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <Slider
                  value={[progress]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full cursor-pointer"
                />

                {/* Caption Timeline Markers */}
                <div className="relative h-2 mt-1">
                  {captions.map((caption) => {
                    const startPercent = (caption.startTime / duration) * 100;
                    const widthPercent =
                      ((caption.endTime - caption.startTime) / duration) * 100;

                    return (
                      <div
                        key={caption.id}
                        className="absolute h-1 bg-blue-400/60 rounded"
                        style={{
                          left: `${startPercent}%`,
                          width: `${widthPercent}%`,
                          top: "2px",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onPlayPause(!isPlaying)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>

                  <Button
                    onClick={() => skip(-10)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={() => skip(10)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={toggleMute}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Time Display */}
                  <div className="text-white text-sm font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Playback Speed */}
                  <select
                    value={playbackRate}
                    onChange={(e) =>
                      setPlaybackRate(parseFloat(e.target.value))
                    }
                    className="bg-white/20 text-white text-sm rounded px-2 py-1 border-0 outline-0"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>

                  <Button
                    onClick={toggleFullscreen}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {!isReady && url && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
