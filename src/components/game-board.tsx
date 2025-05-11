"use client";

import { useState, useEffect } from "react";
import FoodItem from "./food-item";
import { generateRandomFoods } from "@/lib/game-utils";
import type { Food } from "@/lib/types";

export default function GameBoard() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [score, setScore] = useState(0);

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

    // 等待蟑螂动画完成后移除食物
    setTimeout(() => {
      setFoods((prevFoods) => prevFoods.filter((food) => food.id !== id));
      setScore((prevScore) => prevScore + 1);
    }, 1500);
  };

  // 检查游戏是否结束
  useEffect(() => {
    if (isGameStarted && foods.length === 0) {
      // 所有食物都被清理完毕
      alert(`游戏结束！你的得分：${score}`);
      setIsGameStarted(false);
    }
  }, [foods, isGameStarted, score]);

  return (
    <div className="relative w-full max-w-5xl aspect-[16/9] overflow-hidden rounded-lg shadow-lg border border-amber-400">
      {/* 餐桌背景 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-amber-100"
        // style={{ backgroundImage: "url('/bg.png')" }}
      >
        {/* 游戏开始前的界面 */}
        {!isGameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <button
              onClick={startGame}
              className="px-6 py-3 text-lg font-bold text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors"
            >
              开始游戏
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
          <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full">
            得分: {score}
          </div>
        )}
      </div>
    </div>
  );
}
