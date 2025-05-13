import { RetroGrid } from "@/components/magicui/retro-grid";
import { HyperText } from "@/components/magicui/hyper-text";
import WalletGameWrapper from "@/components/wallet-game-wrapper";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-purple-100">
      <RetroGrid />
      <HyperText className="mb-6">Devour Evolve</HyperText>
      <WalletGameWrapper />
    </main>
  );
}
