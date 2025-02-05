"use client";

// We must do this client-side so it runs on the browser, not server.
import { useEffect } from "react";
import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';

// This CSS includes some default styles for the polyfill
import "mobile-drag-drop/default.css";

export default function PolyfillProvider({ children }) {
  useEffect(() => {
    // Initialize the polyfill once on mount
    polyfill({
      dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
    });

    // If you want to disable scrolling while drag (to emulate desktop)
    // you can also do:
    // import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';
    // polyfill({ dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride });
  }, []);

  return <>{children}</>;
}
