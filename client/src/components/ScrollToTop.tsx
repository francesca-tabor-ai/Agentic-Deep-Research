import { useEffect } from 'react';
import { useLocation } from 'wouter';

/** Scrolls the window to top whenever the route changes. */
export default function ScrollToTop() {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
