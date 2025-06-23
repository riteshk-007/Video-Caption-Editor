export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00:00";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [hours, minutes, secs]
    .map((unit) => unit.toString().padStart(2, "0"))
    .join(":");
};

export const parseTime = (timeString) => {
  if (!timeString || typeof timeString !== "string") {
    return 0;
  }

  timeString = timeString.trim();

  const parts = timeString.split(":").map((part) => parseInt(part, 10));

  if (parts.some((part) => isNaN(part) || part < 0)) {
    return NaN;
  }

  let seconds = 0;

  if (parts.length === 1) {
    seconds = parts[0];
  } else if (parts.length === 2) {
    const [minutes, secs] = parts;
    if (secs >= 60) return NaN;
    seconds = minutes * 60 + secs;
  } else if (parts.length === 3) {
    const [hours, minutes, secs] = parts;
    if (minutes >= 60 || secs >= 60) return NaN;
    seconds = hours * 3600 + minutes * 60 + secs;
  } else {
    return NaN;
  }

  return seconds;
};

export const validateTimestamp = (startTime, endTime, duration) => {
  if (isNaN(startTime) || isNaN(endTime) || isNaN(duration)) {
    return false;
  }

  if (startTime < 0) {
    return false;
  }

  if (endTime <= startTime) {
    return false;
  }

  if (startTime > duration || endTime > duration) {
    return false;
  }

  return true;
};

export const getDuration = (startTime, endTime) => {
  if (isNaN(startTime) || isNaN(endTime) || endTime <= startTime) {
    return 0;
  }
  return endTime - startTime;
};

export const timeRangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

export const formatDuration = (seconds) => {
  if (isNaN(seconds) || seconds < 0) {
    return "0 seconds";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} second${secs !== 1 ? "s" : ""}`);
  }

  return parts.join(" ");
};

export const secondsToMilliseconds = (seconds) => {
  return Math.round(seconds * 1000);
};

export const millisecondsToSeconds = (milliseconds) => {
  return milliseconds / 1000;
};

export const roundTime = (seconds) => {
  return Math.round(seconds);
};

export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};
