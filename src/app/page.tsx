import GameBoard from "@/components/game-board";
import { AuroraText } from "@/components/magicui/aurora-text";
import { HyperText } from "@/components/magicui/hyper-text";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { VideoText } from "@/components/magicui/video-text";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-purple-100">
      <RetroGrid />
      {/* <div className="relative h-[200px] w-[800px] overflow-hidden">
        <VideoText src="https://cdn.magicui.design/ocean-small.webm">
          Evolution
        </VideoText>
      </div> */}

      <HyperText className="mb-6">Devour Evolve</HyperText>

      {/* <p className="mb-6 text-center max-w-md">
        点击餐桌上的食物，蟑螂会出来帮你清理它们！
      </p> */}
      <GameBoard />
    </main>
  );
}
