import { createTRPCRouter } from "./trpc";
import { gameRouter } from "./routers/game";
import { aiRouter } from "./routers/ai";

export const appRouter = createTRPCRouter({
  game: gameRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;

