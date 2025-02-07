"use client";

import { DndProvider } from "react-dnd-multi-backend";
import { MultiBackend } from "react-dnd-multi-backend";
import { HTML5toTouch } from "./utils/dndPipeline"; // path to your pipeline file

export default function Providers({ children }) {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      {children}
    </DndProvider>
  );
}
