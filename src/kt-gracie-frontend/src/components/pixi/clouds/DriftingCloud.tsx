import React, { useRef } from "react";
import { Sprite, useTick } from "@pixi/react";

interface DriftingCloudProps {
    imageSrc: string;
    drift?: number;
    stageWidth: number;
    stageHeight: number;
}

/**
 * Animated cloud sprite that oscillates horizontally.
 * Must be rendered as a child of a PixiJS <Stage>.
 *
 * @param drift  Positive = oscillate right, negative = oscillate left
 */
export default function DriftingCloud({
    imageSrc,
    drift = 60,
    stageWidth,
    stageHeight,
}: DriftingCloudProps) {
    const spriteRef = useRef<any>(null);
    const timeRef = useRef(0);
    const SPEED = 0.008;

    useTick((delta) => {
        const s = spriteRef.current;
        if (!s) return;
        timeRef.current += SPEED * delta;
        // cosine gives 1→-1→1, so (1 - cos) gives 0→2→0 → scaled to 0→drift→0
        s.x = (drift / 2) * (1 - Math.cos(timeRef.current));
    });

    return (
        <Sprite
            ref={spriteRef}
            image={imageSrc}
            x={0}
            y={0}
            width={stageWidth}
            height={stageHeight}
        />
    );
}
