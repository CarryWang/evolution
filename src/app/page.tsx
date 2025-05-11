import GameBoard from "@/components/game-board";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">食物清理游戏</h1>
      <p className="mb-6 text-center max-w-md">
        点击餐桌上的食物，蟑螂会出来帮你清理它们！
      </p>
      <GameBoard />
    </main>
  );
}
