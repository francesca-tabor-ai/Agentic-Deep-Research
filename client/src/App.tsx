import { Suspense, lazy } from 'react';
import { Switch, Route } from 'wouter';
import ScrollToTop from '@/components/ScrollToTop';

const Landing = lazy(() => import('@/pages/Landing'));
const Research = lazy(() => import('@/pages/Research'));
const Vault = lazy(() => import('@/pages/Vault'));
const Metrics = lazy(() => import('@/pages/Metrics'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const CaseStudies = lazy(() => import('@/pages/CaseStudies'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const PlatformChat = lazy(() => import('@/components/PlatformChat'));

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-sm text-muted-foreground">Loading…</span>
    </div>
  </div>
);

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/research" component={Research} />
          <Route path="/vault" component={Vault} />
          <Route path="/metrics" component={Metrics} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/case-studies" component={CaseStudies} />
          <Route component={NotFound} />
        </Switch>
        <PlatformChat />
      </Suspense>
    </>
  );
}

export default App;
