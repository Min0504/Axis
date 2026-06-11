"use client";

import { useEffect } from "react";

type Props = {
  slug: string;
  region?: string;
};

export default function PageViewTracker({ slug, region }: Props) {
  useEffect(() => {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "compare_view", slug, region: region ?? "KR" }),
    }).catch(() => null);
  }, [slug, region]);

  return null;
}
