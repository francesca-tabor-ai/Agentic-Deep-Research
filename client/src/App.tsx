import { Suspense, lazy } from 'react';
import { Switch, Route } from 'wouter';
import Landing from '@/pages/Landing';
import Research from '@/pages/Research';
import Vault from '@/pages/Vault';
import NotFound from '@/pages/NotFound';

const Metrics = lazy(() => import('@/pages/Metrics'));

function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/research" component={Research} />
      <Route path="/vault" component={Vault} />
      <Route path="/metrics">
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading…</div>}>
          <Metrics />
        </Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
