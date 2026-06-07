export function formatChatTime(isoDate: any) {
  const date = new Date(isoDate);
  const now:any= new Date();

  const isToday = date.toDateString() === now.toDateString();

  const isYesterday =
    new Date(now - 86400000).toDateString() === date.toDateString();

  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;

  return date.toLocaleDateString("en-IN");
}
