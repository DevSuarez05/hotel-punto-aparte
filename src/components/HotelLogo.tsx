import React from "react";
import Image from "next/image";

interface HotelLogoProps {
  className?: string;
}

export default function HotelLogo({ className = "h-10 w-auto" }: HotelLogoProps) {
  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden select-none ${className}`}>
      {/* Cropped clean logo image without white border artifacts */}
      <Image
        src="/images/logo_card_clean.png"
        alt="Hotel Punto Aparte Logo Oficial"
        width={240}
        height={68}
        priority
        className="h-full w-auto object-contain mix-blend-lighten drop-shadow-md scale-[1.02]"
        style={{
          clipPath: "inset(2px 2px 2px 2px)",
        }}
      />
    </div>
  );
}
