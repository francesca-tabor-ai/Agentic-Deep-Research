import { Switch, Route } from 'wouter';
import Landing from '@/pages/Landing';
import Research from '@/pages/Research';
import Vault from '@/pages/Vault';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/research" component={Research} />
      <Route path="/vault" component={Vault} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
