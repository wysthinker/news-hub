"use client";

import { useEffect } from "react";

export function TrackView({
  channelId,
  itemUrl,
  itemTitle,
}: {
  channelId: string;
  itemUrl: string;
  itemTitle: string;
}) {
  useEffect(() => {
    // Fire-and-forget tracking beacon
    const payload = {
      channel_id: channelId,
      url: itemUrl,
      title: itemTitle,
      ts: new Date().toISOString(),
    };
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Tracking failure is non-critical
    });
  }, [channelId, itemUrl, itemTitle]);

  return null;
}
