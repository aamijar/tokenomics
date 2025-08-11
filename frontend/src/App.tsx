import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Markets from '@/pages/Markets';
import Portfolio from '@/pages/Portfolio';
import Swap from '@/pages/Swap';
import Activity from '@/pages/Activity';
import Pools from '@/pages/Pools';
import Landing from '@/pages/Landing';
import { Header } from '@/components/Header';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <Landing />
        <div id="markets" />
        <Tabs defaultValue="markets" className="space-y-6">
          <TabsList>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="swap">Swap</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="pools">Pools</TabsTrigger>
          </TabsList>

          <TabsContent value="markets">
            <Markets />
          </TabsContent>
          <TabsContent value="portfolio">
            <Portfolio />
          </TabsContent>
          <TabsContent value="swap">
            <div id="swap" />
            <Swap />
          </TabsContent>
          <TabsContent value="activity">
            <Activity />
          </TabsContent>
          <TabsContent value="pools">
            <Pools />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App
