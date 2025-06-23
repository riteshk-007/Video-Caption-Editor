"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Link, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const VideoUrlInput = ({ value, onChange, onValidUrl }) => {
  const [inputValue, setInputValue] = useState(value);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // URL validation patterns
  const urlPatterns = {
    youtube:
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/,
    vimeo: /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+/,
    direct: /^https?:\/\/.*\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i,
  };

  const validateUrl = async (url) => {
    if (!url.trim()) {
      setIsValid(false);
      return false;
    }

    // Check if it matches any known pattern
    const isYoutube = urlPatterns.youtube.test(url);
    const isVimeo = urlPatterns.vimeo.test(url);
    const isDirect = urlPatterns.direct.test(url);

    if (isYoutube || isVimeo || isDirect) {
      setIsValid(true);
      return true;
    }

    // For other URLs, try to validate if it's a valid video URL format
    try {
      new URL(url);
      // If it's a valid URL format, consider it potentially valid
      setIsValid(true);
      return true;
    } catch {
      setIsValid(false);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsValidating(true);

    try {
      const valid = await validateUrl(inputValue);
      if (valid) {
        onChange(inputValue);
        onValidUrl && onValidUrl();
        toast.success("Video URL loaded successfully");
      } else {
        toast.error("Please enter a valid video URL");
      }
    } catch (error) {
      toast.error("Error validating video URL");
    }

    setIsValidating(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Reset validation state when input changes
    setIsValid(false);

    // Auto-validate after a short delay
    const timeoutId = setTimeout(() => {
      validateUrl(newValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const getUrlTypeIcon = () => {
    if (!inputValue) return <Link className="w-4 h-4" />;

    if (urlPatterns.youtube.test(inputValue)) {
      return (
        <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
          Y
        </div>
      );
    }
    if (urlPatterns.vimeo.test(inputValue)) {
      return (
        <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
          V
        </div>
      );
    }
    if (urlPatterns.direct.test(inputValue)) {
      return (
        <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
          D
        </div>
      );
    }

    return <Link className="w-4 h-4" />;
  };

  return (
    <Card className="p-4 lg:p-6 bg-white/5 backdrop-blur-sm border-white/10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Video URL
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              {getUrlTypeIcon()}
            </div>
            <Input
              type="url"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Paste YouTube, Vimeo, or direct video URL here..."
              className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              ) : isValid && inputValue ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : inputValue && !isValid ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={!inputValue.trim() || isValidating}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0 flex-1 sm:flex-none"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Link className="w-4 h-4 mr-2" />
                Load Video
              </>
            )}
          </Button>

          {inputValue && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setInputValue("");
                onChange("");
                setIsValid(false);
              }}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 sm:w-auto"
            >
              Clear
            </Button>
          )}
        </div>

        {/* URL Format Examples */}
        <div className="text-xs text-slate-400 space-y-1">
          <div className="font-medium text-slate-300">Supported formats:</div>
          <div className="space-y-1">
            <div>• YouTube: youtube.com/watch?v=... or youtu.be/...</div>
            <div>• Vimeo: vimeo.com/...</div>
            <div>• Direct: .mp4, .webm, .ogg, .mov files</div>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default VideoUrlInput;
