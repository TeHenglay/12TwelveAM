'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';

interface ImageMagnifierProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  magnifierHeight: number;
  magnifierWidth: number;
  zoomLevel: number;
}

export default function ImageMagnifier({
  src,
  alt,
  width,
  height,
  magnifierHeight = 150,
  magnifierWidth = 150,
  zoomLevel = 2.5
}: ImageMagnifierProps) {
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const [showMagnifier, setShowMagnifier] = useState(false);

  return (
    <div className="relative">
      <div
        style={{
          position: "relative",
          height: height,
          width: width
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded-lg"
          onMouseEnter={(e) => {
            // Update image size and turn on magnifier
            const elem = e.currentTarget;
            const { width, height } = elem.getBoundingClientRect();
            setSize([width, height]);
            setShowMagnifier(true);
          }}
          onMouseMove={(e) => {
            // Update cursor position
            const elem = e.currentTarget;
            const { top, left } = elem.getBoundingClientRect();
            const x = e.pageX - left - window.scrollX;
            const y = e.pageY - top - window.scrollY;
            setXY([x, y]);
          }}
          onMouseLeave={() => {
            setShowMagnifier(false);
          }}
        />

        {showMagnifier && (
          <div
            style={{
              display: showMagnifier ? "" : "none",
              position: "absolute",
              // prevent magnifier from being positioned outside the image
              left: Math.min(
                x - magnifierWidth / 2,
                imgWidth - magnifierWidth
              ),
              top: Math.min(
                y - magnifierHeight / 2,
                imgHeight - magnifierHeight
              ),
              pointerEvents: "none",
              height: `${magnifierHeight}px`,
              width: `${magnifierWidth}px`,
              opacity: "1",
              border: "1px solid lightgray",
              backgroundColor: "white",
              backgroundImage: `url('${src}')`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${imgWidth * zoomLevel}px ${
                imgHeight * zoomLevel
              }px`,
              backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
              backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
              zIndex: 50,
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
            }}
          />
        )}
      </div>
    </div>
  );
}
