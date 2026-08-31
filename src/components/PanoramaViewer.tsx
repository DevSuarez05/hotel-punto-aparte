"use client";

import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import "@photo-sphere-viewer/core/index.css";

interface PanoramaViewerProps {
  src: string;
  caption?: string;
  height?: string;
}

export default function PanoramaViewer({
  src,
  caption = "Vista 360° Tour Interactivo",
  height = "460px",
}: PanoramaViewerProps) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-card border border-gold-500/40 shadow-2xl">
      {/* 360 WebGL Viewer Container */}
      <ReactPhotoSphereViewer
        src={src}
        height={height}
        width="100%"
        container=""
        navbar={["zoom", "caption", "fullscreen"]}
        plugins={[[AutorotatePlugin, { autorotateSpeed: "1rpm" }]]}
        caption={caption}
        defaultZoomLvl={30}
      />
    </div>
  );
}
