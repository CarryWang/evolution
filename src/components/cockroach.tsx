"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface CockroachProps {
  foodSize: number;
}

export default function Cockroach({ foodSize }: CockroachProps) {
  const [position, setPosition] = useState({ x: -50, y: 0 });
  const [rotation, setRotation] = useState(0);
  const cockroachSize = Math.max(40, foodSize * 0.6);

  // 蟑螂动画
  useEffect(() => {
    // 随机旋转角度
    setRotation(Math.random() * 360);

    // 蟑螂从屏幕边缘爬到食物位置
    const animateRoach = () => {
      setPosition({ x: 0, y: 0 });
    };

    // 短暂延迟后开始动画
    const timer = setTimeout(animateRoach, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="absolute transition-all duration-1000 ease-in-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
        zIndex: 20,
      }}
    >
      <Image
        src="/zl.png"
        alt="蟑螂"
        width={cockroachSize}
        height={cockroachSize}
        className="select-none"
      />
    </div>
  );
}
