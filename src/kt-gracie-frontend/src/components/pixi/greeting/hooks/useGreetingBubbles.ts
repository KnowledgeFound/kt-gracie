import { useEffect, useMemo, useState } from "react";

export interface Bubble {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
}

interface Viewport {
  width: number;
  height: number;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function createBubble(id: number, viewport: Viewport): Bubble {
  return {
    id,
    x: randomBetween(0, viewport.width),
    y: randomBetween(0, viewport.height),
    radius: randomBetween(8, 26),
    speed: randomBetween(0.4, 1.6),
    alpha: randomBetween(0.2, 0.5),
  };
}

export function useGreetingBubbles(count = 28) {
  const [viewport, setViewport] = useState<Viewport>({
    width: typeof window !== "undefined" ? window.innerWidth : 1280,
    height: typeof window !== "undefined" ? window.innerHeight : 720,
  });

  const [bubbles, setBubbles] = useState<Bubble[]>(() =>
    Array.from({ length: count }, (_, index) =>
      createBubble(index, {
        width: typeof window !== "undefined" ? window.innerWidth : 1280,
        height: typeof window !== "undefined" ? window.innerHeight : 720,
      }),
    ),
  );

  useEffect(() => {
    const onResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setBubbles((previous) =>
      previous.map((bubble) => ({
        ...bubble,
        x: Math.min(bubble.x, viewport.width),
        y: Math.min(bubble.y, viewport.height),
      })),
    );
  }, [viewport]);

  useEffect(() => {
    let rafId = 0;

    const tick = () => {
      setBubbles((previous) =>
        previous.map((bubble) => {
          const nextY = bubble.y - bubble.speed;
          if (nextY + bubble.radius < 0) {
            return {
              ...createBubble(bubble.id, viewport),
              y: viewport.height + bubble.radius,
            };
          }

          return {
            ...bubble,
            y: nextY,
          };
        }),
      );

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [viewport]);

  return useMemo(
    () => ({
      bubbles,
      viewport,
    }),
    [bubbles, viewport],
  );
}
