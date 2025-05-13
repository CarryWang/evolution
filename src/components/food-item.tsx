"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Cockroach from "./cockroach"
import type { Food, TokenFood } from "@/lib/types"
import { getTokenIcon } from "@/lib/token-utils"

interface FoodItemProps {
  food: Food
  onClick: () => void
}

export default function FoodItem({ food, onClick }: FoodItemProps) {
  const [imgSrc, setImgSrc] = useState(food.image)
  const [imgError, setImgError] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  useEffect(() => {
    // 使用 getTokenIcon 处理可能的 IPFS 或其他特殊链接格式
    if (food.image && 'tokenImage' in food) {
      const processedImg = getTokenIcon({
        tokenInfo: { image: food.image, name: food.name },
      } as any)
      setImgSrc(processedImg)
    }
  }, [food])

  // 图像加载失败的处理
  const handleImgError = () => {
    if (!imgError) {
      setImgError(true)
      // 设置默认图片
      setImgSrc('/fallback-token.png')
    }
  }

  const handleClick = () => {
    if (!isClicked && !food.isBeingEaten) {
      setIsClicked(true)
      onClick()
    }
  }

  const style = {
    left: `${food.x}%`,
    top: `${food.y}%`,
    width: `${food.size}px`,
    height: `${food.size}px`,
    transform: `rotate(${food.rotation}deg)`,
    zIndex: isClicked ? 10 : 1,
  }

  // 类型守卫函数：检查是否是 TokenFood 类型
  const isTokenFood = (food: Food): food is TokenFood => {
    return 'tokenName' in food;
  };

  return (
    <div
      className={`absolute cursor-pointer transition-transform hover:scale-110 ${
        food.isBeingEaten ? "pointer-events-none opacity-70" : ""
      }`}
      style={style}
      onClick={handleClick}
    >
      <img
        src={imgSrc}
        alt={food.name}
        className={`w-full h-full object-contain ${food.isBeingEaten ? "opacity-50" : ""}`}
        onError={handleImgError}
      />
      
      {/* 代币名称标签 - 使用类型守卫确保类型安全 */}
      {isTokenFood(food) && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-mono uppercase tracking-wider">
          {food.tokenName}
          {!food.isBeingEaten && <span className="ml-1 text-xs text-green-400">CLICK TO CLOSE</span>}
        </div>
      )}

      {/* 被吃时的蟑螂动画 */}
      {food.isBeingEaten && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/cockroach.png"
            alt="Eating"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  )
}
