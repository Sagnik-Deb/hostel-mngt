export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "bg-emerald-500",
    PENDING: "bg-amber-500",
    APPROVED: "bg-emerald-500",
    REJECTED: "bg-red-500",
    ON_LEAVE: "bg-blue-500",
    CHECKED_OUT: "bg-gray-500",
    PENDING_VERIFICATION: "bg-yellow-500",
    PENDING_APPROVAL: "bg-orange-500",
    OPEN: "bg-blue-500",
    IN_PROGRESS: "bg-amber-500",
    RESOLVED: "bg-emerald-500",
    CLOSED: "bg-gray-500",
    CANCELLED: "bg-gray-400",
    EXTENSION_REQUESTED: "bg-purple-500",
    RETURN_REQUESTED: "bg-cyan-500",
    COMPLETED: "bg-emerald-500",
    REVOKED: "bg-red-600",
  };
  return colors[status] || "bg-gray-500";
}

export function getRoomColor(occupied: number, capacity: number): string {
  if (occupied >= capacity) return "room-full"; // Red
  if (occupied > 0) return "room-partial"; // Yellow
  return "room-empty"; // Green
}

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}
