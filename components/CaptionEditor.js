"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Plus, Edit3, Clock, Type, Palette, Save, X } from "lucide-react";
import { formatTime, parseTime, validateTimestamp } from "../utils/timeUtils";
import { toast } from "sonner";

const CaptionEditor = ({
  onAddCaption,
  currentTime,
  duration,
  selectedCaption,
  onUpdateCaption,
  disabled,
}) => {
  const [captionData, setCaptionData] = useState({
    startTime: "",
    endTime: "",
    text: "",
    style: {
      fontSize: "16px",
      color: "#ffffff",
      fontWeight: "normal",
      position: "bottom",
    },
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Font size options
  const fontSizeOptions = [
    { value: "12px", label: "Small (12px)" },
    { value: "16px", label: "Medium (16px)" },
    { value: "20px", label: "Large (20px)" },
    { value: "24px", label: "Extra Large (24px)" },
    { value: "28px", label: "Huge (28px)" },
  ];

  // Font weight options
  const fontWeightOptions = [
    { value: "normal", label: "Normal" },
    { value: "500", label: "Medium" },
    { value: "600", label: "Semi Bold" },
    { value: "bold", label: "Bold" },
  ];

  // Position options
  const positionOptions = [
    { value: "top", label: "Top" },
    { value: "center", label: "Center" },
    { value: "bottom", label: "Bottom" },
  ];

  // Sync with selected caption
  useEffect(() => {
    if (selectedCaption) {
      setCaptionData({
        startTime: formatTime(selectedCaption.startTime),
        endTime: formatTime(selectedCaption.endTime),
        text: selectedCaption.text,
        style: { ...selectedCaption.style },
      });
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [selectedCaption]);

  const resetForm = () => {
    setCaptionData({
      startTime: formatTime(currentTime),
      endTime: formatTime(Math.min(currentTime + 3, duration)),
      text: "",
      style: {
        fontSize: "16px",
        color: "#ffffff",
        fontWeight: "normal",
        position: "bottom",
      },
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate text
    if (!captionData.text.trim()) {
      newErrors.text = "Caption text is required";
    }

    // Validate timestamps
    const startTime = parseTime(captionData.startTime);
    const endTime = parseTime(captionData.endTime);

    if (isNaN(startTime)) {
      newErrors.startTime = "Invalid start time format";
    }
    if (isNaN(endTime)) {
      newErrors.endTime = "Invalid end time format";
    }

    if (!newErrors.startTime && !newErrors.endTime) {
      if (!validateTimestamp(startTime, endTime, duration)) {
        if (endTime <= startTime) {
          newErrors.endTime = "End time must be after start time";
        }
        if (startTime < 0) {
          newErrors.startTime = "Start time cannot be negative";
        }
        if (endTime > duration) {
          newErrors.endTime = "End time exceeds video duration";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (isEditing && selectedCaption) {
      onUpdateCaption(selectedCaption.id, {
        startTime: parseTime(captionData.startTime),
        endTime: parseTime(captionData.endTime),
        text: captionData.text.trim(),
        style: captionData.style,
      });
      setIsEditing(false);
    } else {
      onAddCaption(captionData);
    }

    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const useCurrentTime = (field) => {
    setCaptionData((prev) => ({
      ...prev,
      [field]: formatTime(currentTime),
    }));
  };

  const handleStyleChange = (property, value) => {
    setCaptionData((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        [property]: value,
      },
    }));
  };

  return (
    <Card className="p-4 lg:p-6 space-y-4 lg:space-y-6 bg-white/5 backdrop-blur-sm border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {isEditing ? (
            <Edit3 className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          {isEditing ? "Edit Caption" : "Add Caption"}
        </h3>
        {disabled && (
          <Badge
            variant="secondary"
            className="bg-yellow-500/20 text-yellow-400 self-start sm:self-auto"
          >
            Load video first
          </Badge>
        )}
      </div>

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3"
        >
          <p className="text-blue-300 text-sm">
            Editing existing caption. Click cancel to create a new one instead.
          </p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Timing Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Timing
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-slate-300">
                Start Time
              </Label>
              <div className="flex gap-2">
                <Input
                  id="startTime"
                  value={captionData.startTime}
                  onChange={(e) =>
                    setCaptionData((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                  placeholder="00:00:00"
                  disabled={disabled}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-slate-400 ${
                    errors.startTime ? "border-red-500" : ""
                  }`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => useCurrentTime("startTime")}
                  disabled={disabled}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0"
                >
                  Now
                </Button>
              </div>
              {errors.startTime && (
                <p className="text-red-400 text-xs">{errors.startTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-slate-300">
                End Time
              </Label>
              <div className="flex gap-2">
                <Input
                  id="endTime"
                  value={captionData.endTime}
                  onChange={(e) =>
                    setCaptionData((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                  placeholder="00:00:03"
                  disabled={disabled}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-slate-400 ${
                    errors.endTime ? "border-red-500" : ""
                  }`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => useCurrentTime("endTime")}
                  disabled={disabled}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0"
                >
                  Now
                </Button>
              </div>
              {errors.endTime && (
                <p className="text-red-400 text-xs">{errors.endTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* Caption Text */}
        <div className="space-y-2">
          <Label
            htmlFor="captionText"
            className="text-slate-300 flex items-center gap-2"
          >
            <Type className="w-4 h-4" />
            Caption Text
          </Label>
          <Textarea
            id="captionText"
            value={captionData.text}
            onChange={(e) =>
              setCaptionData((prev) => ({ ...prev, text: e.target.value }))
            }
            placeholder="Enter your caption text here..."
            disabled={disabled}
            rows={3}
            className={`bg-white/10 border-white/20 text-white placeholder:text-slate-400 resize-none ${
              errors.text ? "border-red-500" : ""
            }`}
          />
          {errors.text && <p className="text-red-400 text-xs">{errors.text}</p>}
          <div className="text-xs text-slate-400">
            {captionData.text.length} characters
          </div>
        </div>

        {/* Style Options */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-blue-500/30"
            >
              Basic
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="data-[state=active]:bg-blue-500/30"
            >
              Style
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Font Size</Label>
                <Select
                  value={captionData.style.fontSize}
                  onValueChange={(value) =>
                    handleStyleChange("fontSize", value)
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {fontSizeOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Font Weight</Label>
                <Select
                  value={captionData.style.fontWeight}
                  onValueChange={(value) =>
                    handleStyleChange("fontWeight", value)
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select font weight" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {fontWeightOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Text Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={captionData.style.color}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
                    disabled={disabled}
                    className="w-12 h-10 bg-white/10 border-white/20 cursor-pointer"
                  />
                  <Input
                    value={captionData.style.color}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
                    disabled={disabled}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Position</Label>
                <Select
                  value={captionData.style.position}
                  onValueChange={(value) =>
                    handleStyleChange("position", value)
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {positionOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview */}
        {captionData.text && (
          <div className="space-y-2">
            <Label className="text-slate-300">Preview</Label>
            <div className="bg-black/50 p-4 rounded-lg text-center">
              <div
                style={{
                  fontSize: captionData.style.fontSize,
                  color: captionData.style.color,
                  fontWeight: captionData.style.fontWeight,
                }}
                className="break-words"
              >
                {captionData.text}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={disabled || !captionData.text.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Update Caption" : "Add Caption"}
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 sm:w-auto w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default CaptionEditor;
