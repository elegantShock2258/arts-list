
"use client";

import { useEffect, useState } from "react";
import { AsciiArt } from "@/assets/ascii-art";

type FlowerDecorationProps = {
  height: number;
};

export default function FlowerDecoration({
  height,
}: FlowerDecorationProps) {
  const [side, setSide] = useState<"left" | "right">("left");

  useEffect(() => {
    setSide(Math.random() < 0.5 ? "left" : "right");
  }, []);

  const flowerHeight = 180;
  const count = Math.max(1, Math.ceil(height / flowerHeight));

  return (
    <div className={`flower-background__side flower-background__side--${side}`}>
      <div className="flower-background__flowers">
        {Array.from({ length: count }, (_, index) => (
          <pre className="flower-decoration__flower" key={index}>
            {AsciiArt}
          </pre>
        ))}
      </div>
    </div>
  );
}
