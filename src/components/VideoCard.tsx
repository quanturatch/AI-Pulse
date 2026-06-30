"use client";

import { motion } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";
import Image from "next/image";
import type { VideoItem } from "@/lib/types";

interface VideoCardProps {
  video: VideoItem;
  index: number;
  accent?: string;
}

export function VideoCard({ video, index, accent }: VideoCardProps) {
  const date = new Date(video.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="glow-border group flex flex-col overflow-hidden rounded-2xl glass glass-hover"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
            style={accent ? { boxShadow: `0 0 30px ${accent}66` } : undefined}
          >
            <Play className="h-6 w-6 fill-white text-white" />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white/80 backdrop-blur-sm">
          {date}
        </div>
        {video.durationLabel && (
          <div className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-cyan-200 backdrop-blur-sm">
            {video.durationLabel}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-cyan-200 transition-colors">
          {video.title}
        </h3>
        <p className="mt-2 line-clamp-1 text-xs text-white/40">
          {video.channelTitle}
        </p>
        <div className="mt-auto flex items-center gap-1 pt-3 text-xs text-white/30">
          <ExternalLink className="h-3 w-3" />
          Watch on YouTube
        </div>
      </div>
    </motion.a>
  );
}