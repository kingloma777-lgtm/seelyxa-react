import { createStart } from '@tanstack/react-start';
import { twilightMiddleware, earlyHintsMiddleware } from '@salla.sa/twilight-theme-engine/tanstack';
import { quietEngineDevLogs } from './lib/quietEngineDevLogs';

// Module scope: `start.ts` is evaluated by both the worker and the browser entry
// before anything renders, which is where the engine's per-block render log has
// to be silenced. No-op outside dev.
quietEngineDevLogs();

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [twilightMiddleware(), earlyHintsMiddleware()],
  };
});
