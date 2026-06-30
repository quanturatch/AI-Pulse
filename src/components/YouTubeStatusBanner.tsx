"use client";

import { AlertTriangle, Video } from "lucide-react";

interface YouTubeStatusBannerProps {
  youtubeConfigured: boolean;
  totalVideos: number;
}

export function YouTubeStatusBanner({
  youtubeConfigured,
  totalVideos,
}: YouTubeStatusBannerProps) {
  if (youtubeConfigured && totalVideos > 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div className="text-sm">
          {!youtubeConfigured ? (
            <>
              <p className="font-semibold text-amber-200">
                YouTube API key not found
              </p>
              <p className="mt-1 text-amber-200/70">
                Create a <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">.env</code> file
                in the project root and add your{" "}
                <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">YOUTUBE_API_KEY</code>.
                Get one from{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-100"
                >
                  Google Cloud Console
                </a>{" "}
                (enable YouTube Data API v3). Then restart the dev server and click{" "}
                <strong>Refresh Now</strong>.
              </p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-2 font-semibold text-amber-200">
                <Video className="h-4 w-4" />
                No videos loaded — API key may be invalid or quota exceeded
              </p>
              <p className="mt-1 text-amber-200/70">
                Check that YouTube Data API v3 is enabled, your key is correct, and
                you have quota remaining. Click <strong>Refresh Now</strong> after fixing.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}