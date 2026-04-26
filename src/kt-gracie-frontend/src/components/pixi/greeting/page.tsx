import { Container, Graphics, Stage } from "@pixi/react";
import { useGreetingBubbles } from "./hooks/useGreetingBubbles";

export default function GreetingPixiPage() {
  const { bubbles, viewport } = useGreetingBubbles();

  return (
    <Stage
      width={viewport.width}
      height={viewport.height}
      options={{
        backgroundAlpha: 0,
        antialias: true,
      }}
    >
      <Container>
        {bubbles.map((bubble) => (
          <Graphics
            key={bubble.id}
            draw={(graphics) => {
              graphics.clear();
              graphics.beginFill(0x68d8ff, bubble.alpha);
              graphics.drawCircle(bubble.x, bubble.y, bubble.radius);
              graphics.endFill();
            }}
          />
        ))}
      </Container>
    </Stage>
  );
}