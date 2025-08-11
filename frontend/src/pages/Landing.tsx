import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-purple-600/20 via-indigo-600/10 to-blue-600/20 p-8 md:p-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(124,58,237,0.25),rgba(255,255,255,0))]" />
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs backdrop-blur">
          <span>AI Tokens Marketplace</span>
          <span className="opacity-70">Uniswap-level UX</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Trade AI tokens with beautiful charts, quotes, and analytics
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Explore markets, track your portfolio, get best-route quotes, and monitor activity across chains — all in one place.
        </p>
        <div className="flex gap-3 pt-2">
          <a href="#swap">
            <Button>Start swapping</Button>
          </a>
          <a href="#markets">
            <Button variant="outline">Browse markets</Button>
          </a>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-background/60 p-4">
          <div className="text-xs text-muted-foreground">Tracked Tokens</div>
          <div className="text-2xl font-semibold">50+</div>
        </div>
        <div className="rounded-xl border bg-background/60 p-4">
          <div className="text-xs text-muted-foreground">Chains</div>
          <div className="text-2xl font-semibold">ETH, Base</div>
        </div>
        <div className="rounded-xl border bg-background/60 p-4">
          <div className="text-xs text-muted-foreground">Quote Providers</div>
          <div className="text-2xl font-semibold">UniswapX • 1inch</div>
        </div>
        <div className="rounded-xl border bg-background/60 p-4">
          <div className="text-xs text-muted-foreground">Caching</div>
          <div className="text-2xl font-semibold">Fast</div>
        </div>
      </div>
    </section>
  );
}
