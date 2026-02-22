import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TaskDetail from "@/pages/TaskDetail";
import Vault from "@/pages/Vault";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/task/:id" component={TaskDetail} />
      <Route path="/vault" component={Vault} />
      {/* Fallback routes to dashboard for now */}
      <Route path="/library" component={Vault} />
      <Route path="/settings" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
