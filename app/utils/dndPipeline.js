"use client";

import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  MultiBackend,
  HTML5DragTransition,
  TouchTransition,
} from "react-dnd-multi-backend";

// Instead of createTransitions, we define an object with "backends" array.
export const HTML5toTouch = {
  backends: [
    {
      backend: HTML5Backend,
      transition: HTML5DragTransition,
    },
    {
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      transition: TouchTransition,
    },
  ],
};

