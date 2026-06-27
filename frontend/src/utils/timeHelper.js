// timeHelper.js
// Converts 24-hour time to 12-hour format
// Example: "09:00:00" → "9:00 AM"

export const formatTime = (time) => {
  if (!time) return null;
  
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};