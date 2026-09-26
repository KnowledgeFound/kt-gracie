import { useState, useEffect } from "react";
import { Stage } from "@pixi/react";
import DriftingCloud from "./DriftingCloud";

const CLOUD1_SRC = "/assets/city/cloud1.png";
const CLOUD2_SRC = "/assets/city/cloud2.png";

/**
 * Full-viewport PixiJS Stage that renders two drifting cloud layers.
 * Automatically resizes to fill the window.
 */
export default function CloudLayer() {
    const [dims, setDims] = useState({
        w: window.innerWidth,
        h: window.innerHeight,
    });

    useEffect(() => {
        const onResize = () =>
            setDims({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return (
        <Stage
            width={dims.w}
            height={dims.h}
            options={{ backgroundAlpha: 0 }}
        >
            <DriftingCloud
                imageSrc={CLOUD1_SRC}
                drift={-60}
                stageWidth={dims.w}
                stageHeight={dims.h}
            />
            <DriftingCloud
                imageSrc={CLOUD2_SRC}
                drift={60}
                stageWidth={dims.w}
                stageHeight={dims.h}
            />
        </Stage>
    );
}
