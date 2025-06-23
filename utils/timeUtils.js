/**
 * Utility functions for time formatting and parsing
 */

/**
 * Format seconds to HH:MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [hours, minutes, secs]
    .map(unit => unit.toString().padStart(2, '0'))
    .join(':');
};

/**
 * Parse time string (HH:MM:SS, MM:SS, or SS) to seconds
 * @param {string} timeString - Time string to parse
 * @returns {number} Time in seconds
 */
export const parseTime = (timeString) => {
  if (!timeString || typeof timeString !== 'string') {
    return 0;
  }

  // Remove any whitespace
  timeString = timeString.trim();

  // Split by colon
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.some(part => isNaN(part) || part < 0)) {
    return NaN;
  }

  let seconds = 0;

  if (parts.length === 1) {
    // Only seconds: SS
    seconds = parts[0];
  } else if (parts.length === 2) {
    // Minutes and seconds: MM:SS
    const [minutes, secs] = parts;
    if (secs >= 60) return NaN;
    seconds = minutes * 60 + secs;
  } else if (parts.length === 3) {
    // Hours, minutes, and seconds: HH:MM:SS
    const [hours, minutes, secs] = parts;
    if (minutes >= 60 || secs >= 60) return NaN;
    seconds = hours * 3600 + minutes * 60 + secs;
  } else {
    return NaN;
  }

  return seconds;
};

/**
 * Validate if timestamps are logical and within bounds
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @param {number} duration - Video duration in seconds
 * @returns {boolean} Whether timestamps are valid
 */
export const validateTimestamp = (startTime, endTime, duration) => {
  // Check if times are valid numbers
  if (isNaN(startTime) || isNaN(endTime) || isNaN(duration)) {
    return false;
  }

  // Start time should be non-negative
  if (startTime < 0) {
    return false;
  }

  // End time should be after start time
  if (endTime <= startTime) {
    return false;
  }

  // Both times should be within video duration
  if (startTime > duration || endTime > duration) {
    return false;
  }

  return true;
};

/**
 * Calculate duration between two timestamps
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @returns {number} Duration in seconds
 */
export const getDuration = (startTime, endTime) => {
  if (isNaN(startTime) || isNaN(endTime) || endTime <= startTime) {
    return 0;
  }
  return endTime - startTime;
};

/**
 * Check if two time ranges overlap
 * @param {number} start1 - Start time of first range
 * @param {number} end1 - End time of first range
 * @param {number} start2 - Start time of second range
 * @param {number} end2 - End time of second range
 * @returns {boolean} Whether ranges overlap
 */
export const timeRangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

/**
 * Format duration in a human-readable way
 * @param {number} seconds - Duration in seconds
 * @returns {string} Human-readable duration
 */
export const formatDuration = (seconds) => {
  if (isNaN(seconds) || seconds < 0) {
    return '0 seconds';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
  }

  return parts.join(' ');
};

/**
 * Convert seconds to milliseconds
 * @param {number} seconds - Time in seconds
 * @returns {number} Time in milliseconds
 */
export const secondsToMilliseconds = (seconds) => {
  return Math.round(seconds * 1000);
};

/**
 * Convert milliseconds to seconds
 * @param {number} milliseconds - Time in milliseconds
 * @returns {number} Time in seconds
 */
export const millisecondsToSeconds = (milliseconds) => {
  return milliseconds / 1000;
};

/**
 * Round time to nearest second
 * @param {number} seconds - Time in seconds
 * @returns {number} Rounded time in seconds
 */
export const roundTime = (seconds) => {
  return Math.round(seconds);
};

/**
 * Get current timestamp as formatted string
 * @returns {string} Current timestamp
 */
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};