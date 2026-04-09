"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Remote listing/brand images with graceful fallback (next/image + onError).
 */
export function NorthingRemoteImage({
  src,
  alt = "Image",
  className,
  style,
  width,
  height,
  fill,
  sizes,
  priority,
  placeholderEmoji = "🏠",
  ...rest
}) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    const base = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg,var(--primary-light),var(--primary-mid))",
      fontSize: fill ? 40 : 28,
      opacity: 0.35,
      ...style,
    };
    if (fill) {
      Object.assign(base, { position: "absolute", inset: 0, width: "100%", height: "100%" });
    } else {
      Object.assign(base, { width: width || "100%", height: height || "100%" });
    }
    return (
      <div aria-hidden className={className} style={base}>
        {placeholderEmoji}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes || "(max-width: 768px) 100vw, 400px"}
      unoptimized
      priority={priority}
      className={className}
      style={style}
      onError={() => setBroken(true)}
      {...rest}
    />
  );
}
