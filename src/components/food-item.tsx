"use client"

import { useState } from "react"
import Image from "next/image"
import Cockroach from "./cockroach"
import type { Food } from "@/lib/types"

interface FoodItemProps {
  food: Food
  onClick: () => void
}

export default function FoodItem({ food, onClick }: FoodItemProps) {
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    if (!isClicked) {
      setIsClicked(true)
      onClick()
    }
  }

  return (
    <div
      className="absolute cursor-pointer transition-transform hover:scale-105"
      style={{
        left: `${food.x}%`,
        top: `${food.y}%`,
        transform: `translate(-50%, -50%) rotate(${food.rotation}deg)`,
        zIndex: isClicked ? 10 : 1,
      }}
      onClick={handleClick}
    >
      {/* 食物图片 */}
      <div className={`relative ${isClicked ? "opacity-50" : "opacity-100"} transition-opacity`}>
        <Image
          src={food.image || "/placeholder.svg"}
          alt={food.name}
          width={food.size}
          height={food.size}
          className="select-none"
        />
      </div>

      {/* 蟑螂动画 */}
      {food.isBeingEaten && <Cockroach foodSize={food.size} />}
    </div>
  )
}
