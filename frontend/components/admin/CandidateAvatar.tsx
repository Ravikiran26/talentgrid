"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Props {
  candidateId: string | number;
  hasPhoto: boolean;
  initials: string;
  color: string;
  className?: string;
  textClass?: string;
}

/** Photo when the candidate uploaded one (fetched with auth, so not a plain <img src>), initials otherwise. */
export default function CandidateAvatar({
  candidateId, hasPhoto, initials, color,
  className = "w-14 h-14",
  textClass = "font-serif text-xl font-bold text-surface",
}: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPhoto) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    api.downloadBlob(`/api/admin/candidates/${candidateId}/photo`)
      .then((blob) => { if (cancelled) return; objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); })
      .catch(() => {/* fall back to initials */});
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [candidateId, hasPhoto]);

  return (
    <div className={`${className} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden`}
      style={{ backgroundColor: color }}>
      {url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={url} alt="" className="w-full h-full object-cover" />
        : <span className={textClass}>{initials}</span>}
    </div>
  );
}
