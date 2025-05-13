"use client";

import { useState, useEffect } from "react";
import FoodItem from "./food-item";
import { generateRandomFoods } from "@/lib/game-utils";
import type { Food } from "@/lib/types";
import { NeonGradientCard } from "./magicui/neon-gradient-card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function GameBoard() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [isEating, setIsEating] = useState(false);

  // 开始游戏，生成随机食物
  const startGame = () => {
    const randomFoods = generateRandomFoods(10);
    setFoods(randomFoods);
    setIsGameStarted(true);
    setScore(0);
  };

  // 处理食物被点击
  const handleFoodClick = (id: number) => {
    // 标记食物为正在被吃
    setFoods((prevFoods) =>
      prevFoods.map((food) =>
        food.id === id ? { ...food, isBeingEaten: true } : food
      )
    );

    setIsEating(true);

    // 等待蟑螂动画完成后移除食物
    setTimeout(() => {
      setFoods((prevFoods) => prevFoods.filter((food) => food.id !== id));
      setScore((prevScore) => prevScore + 1);
      setIsEating(false);
    }, 1500);
  };

  // 检查游戏是否结束
  useEffect(() => {
    if (isGameStarted && foods.length === 0) {
      // 所有食物都被清理完毕
      // alert(`Your pet ate up all the useless tokens！Your growth：${score}`);
      toast.success(
        `Your pet ate up all the useless tokens！Your growth：${score}`
      );
      setIsGameStarted(false);
    }
  }, [foods, isGameStarted, score]);

  return (
    <NeonGradientCard className="max-w-6xl" borderSize={10}>
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
        {/* 餐桌背景 */}

        <div
          className="absolute inset-0 bg-cover bg-center bg-[url(/bg.jpg)]"
          // style={{ backgroundImage: "url('/bg.png')" }}
        >
          {/* 游戏开始前的界面 */}
          {!isGameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <button onClick={startGame} className="pixel font-press">
                START
              </button>
            </div>
          )}

          {/* 食物项目 */}
          {foods.map((food) => (
            <FoodItem
              key={food.id}
              food={food}
              onClick={() => handleFoodClick(food.id)}
            />
          ))}

          {/* 分数显示 */}
          {isGameStarted && (
            <div className="absolute top-4 right-4 btn">growth: {score}</div>
          )}

          <Image
            src="/zl.png"
            alt="蟑螂"
            width={100}
            height={100}
            className={cn(
              "absolute top-24 right-4 animate-bounce",
              isGameStarted ? "block" : "hidden",
              isEating && "hidden"
            )}
          />
        </div>
      </div>
    </NeonGradientCard>
  );
}
