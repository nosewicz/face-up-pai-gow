"use client";

import { useEffect, useState } from "react";

export default function Providers({ children }) {
  const [dnd, setDnd] = useState(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      import("react-dnd-multi-backend"),
      import("./utils/dndPipeline"),
    ]).then(([multiBackend, pipeline]) => {
      if (!mounted) return;

      setDnd({
        DndProvider: multiBackend.DndProvider,
        MultiBackend: multiBackend.MultiBackend,
        HTML5toTouch: pipeline.HTML5toTouch,
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!dnd) return null;

  const { DndProvider, MultiBackend, HTML5toTouch } = dnd;

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      {children}
    </DndProvider>
  );
}
