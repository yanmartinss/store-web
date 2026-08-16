import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// react-router doesn't reset scroll position on navigation like a
// traditional multi-page site does, so without this, navigating to a new
// route keeps whatever scroll offset the previous page was left at.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
