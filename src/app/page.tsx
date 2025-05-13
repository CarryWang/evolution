import GameBoard from "@/components/game-board";
import { RetroGrid } from "@/components/magicui/retro-grid";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-purple-100">
      <RetroGrid />

      <h1 className="font-press mb-10 text-3xl">Devour Evolve</h1>

      {/* <p className="mb-6 text-center max-w-md">
        点击餐桌上的食物，蟑螂会出来帮你清理它们！
      </p> */}
      <GameBoard />
    </main>
  );
}
