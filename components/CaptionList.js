"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Edit,
  Trash2,
  Play,
  Clock,
  Type,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { formatTime } from "../utils/timeUtils";

const CaptionList = ({ captions, currentTime, onEdit, onDelete, onSeek }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  // Filter and sort captions
  const filteredAndSortedCaptions = captions
    .filter((caption) =>
      caption.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      return (a.startTime - b.startTime) * order;
    });

  const isCurrentCaption = (caption) => {
    return currentTime >= caption.startTime && currentTime <= caption.endTime;
  };

  const getCaptionStatus = (caption) => {
    if (currentTime < caption.startTime) {
      return "upcoming";
    } else if (
      currentTime >= caption.startTime &&
      currentTime <= caption.endTime
    ) {
      return "active";
    } else {
      return "past";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "past":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  if (captions.length === 0) {
    return (
      <Card className="p-4 lg:p-6 bg-white/5 backdrop-blur-sm border-white/10">
        <div className="text-center text-slate-400">
          <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No captions yet</p>
          <p className="text-sm">Start by adding your first caption</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 lg:p-6 bg-white/5 backdrop-blur-sm border-white/10">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-white">
            Captions ({filteredAndSortedCaptions.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 self-start sm:self-auto"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search captions..."
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
          />
        </div>

        {/* Caption List */}
        <ScrollArea className="h-80 lg:h-96">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredAndSortedCaptions.map((caption, index) => {
                const status = getCaptionStatus(caption);
                const isActive = isCurrentCaption(caption);

                return (
                  <motion.div
                    key={caption.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 lg:p-4 rounded-lg border transition-all duration-200 ${
                      isActive
                        ? "bg-green-500/20 border-green-500/50 shadow-lg"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {/* Caption Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(
                            status
                          )} self-start`}
                        >
                          {status}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {formatTime(caption.startTime)} -{" "}
                          {formatTime(caption.endTime)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-start sm:self-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSeek(caption.startTime)}
                          className="text-blue-400 hover:bg-blue-500/20 h-8 w-8 p-0"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(caption)}
                          className="text-yellow-400 hover:bg-yellow-500/20 h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(caption.id)}
                          className="text-red-400 hover:bg-red-500/20 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Caption Text */}
                    <div className="text-sm text-white leading-relaxed break-words">
                      {caption.text}
                    </div>

                    {/* Style Preview */}
                    {caption.style && (
                      <div className="mt-2 text-xs text-slate-400 break-words">
                        Style: {caption.style.fontSize} •{" "}
                        {caption.style.fontWeight} • {caption.style.color}
                      </div>
                    )}

                    {/* Progress Bar for Active Caption */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3"
                      >
                        <div className="w-full bg-white/10 rounded-full h-1">
                          <motion.div
                            className="bg-green-500 h-1 rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                ((currentTime - caption.startTime) /
                                  (caption.endTime - caption.startTime)) *
                                100
                              }%`,
                            }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {filteredAndSortedCaptions.length === 0 && searchTerm && (
          <div className="text-center py-8 text-slate-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No captions found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CaptionList;
