import type { VideoItem } from "@/lib/types";
import { VideoCard } from "./VideoCard";

interface VideoGridProps {
  videos: VideoItem[];
  accent?: string;
  emptyMessage?: string;
}

export function VideoGrid({
  videos,
  accent,
  emptyMessage = "No videos ≥ 8 min found — add your API keys and refresh.",
}: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-sm text-white/40">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video, i) => (
        <VideoCard key={video.id} video={video} index={i} accent={accent} />
      ))}
    </div>
  );
}