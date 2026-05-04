import React, { useState, useEffect } from "react";
import { Stage, Sprite, useTick } from "@pixi/react";
import "@pixi/unsafe-eval";
import cityImage from "./city.png";
import cloud1Src from "./cloud1.png";
import cloud2Src from "./cloud2.png";

const STATS = {
    tokens: 1250,
    health: 90,
    healthMax: 100,
    username: "Agent_Unity",
};

/* ── Animated cloud sprite (must be a child of <Stage>) ── */
/* drift > 0 = oscillate right, drift < 0 = oscillate left */
function DriftingCloud({ imageSrc, drift = 60, stageWidth, stageHeight }) {
    const spriteRef = React.useRef(null);
    const timeRef = React.useRef(0);
    const SPEED = 0.008;       // controls how fast the cycle completes

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

export default function CityScene() {
    const [tokens] = useState(STATS.tokens);
    const [health] = useState(STATS.health);
    const [username] = useState(STATS.username);

    // Track viewport size so the PixiJS stage always fills the screen
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
        <div style={styles.page}>
            {/* ── Full-page City Background ── */}
            <img
                src={cityImage}
                alt="Knowledge City — isometric city view"
                style={styles.cityBg}
            />

            {/* ── PixiJS Cloud Layer (between city bg & header) ── */}
            <div style={styles.pixiLayer}>
                <Stage
                    width={dims.w}
                    height={dims.h}
                    options={{ backgroundAlpha: 0 }}
                >
                    <DriftingCloud
                        imageSrc={cloud1Src}
                        drift={-60}
                        stageWidth={dims.w}
                        stageHeight={dims.h}
                    />
                    <DriftingCloud
                        imageSrc={cloud2Src}
                        drift={60}
                        stageWidth={dims.w}
                        stageHeight={dims.h}
                    />
                </Stage>
            </div>

            {/* ── Header Bar (overlaid) ── */}
            <header style={styles.header}>
                <div style={styles.badgeGroup}>
                    {/* Health Badge */}
                    <div style={styles.badge}>
                        <span style={styles.badgeIcon}>❤️</span>
                        <div style={styles.badgeText}>
                            <span style={styles.badgeLabel}>City Health</span>
                            <span style={styles.badgeValue}>
                                {health}/{STATS.healthMax}
                            </span>
                        </div>
                    </div>

                    {/* Tokens Badge */}
                    <div style={styles.badge}>
                        <span style={styles.badgeIcon}>📘</span>
                        <div style={styles.badgeText}>
                            <span style={styles.badgeLabel}>Knowledge Tokens</span>
                            <span style={styles.badgeValue}>{tokens}</span>
                        </div>
                    </div>

                    {/* Username Badge */}
                    <div style={styles.badge}>
                        <span style={styles.badgeIcon}>👤</span>
                        <div style={styles.badgeText}>
                            <span style={styles.badgeLabel}>Username</span>
                            <span style={styles.badgeValue}>{username}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Inline stylesheet for hover / animation keyframes */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        /* subtle float-in for badges */
        @keyframes fadeSlideDown {
          0%   { opacity: 0; transform: translateY(-18px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* gentle zoom for the city */
        @keyframes cityReveal {
          0%   { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
}

/* ─────────────────────────────────────
   Inline Styles (matching city.png look)
   ───────────────────────────────────── */
const styles = {
    page: {
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
    },

    /* ── Full-page background image ── */
    cityBg: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        maxWidth: "none",
        maxHeight: "none",
        margin: 0,
        objectFit: "cover",
        objectPosition: "center",
        borderRadius: 0,
        zIndex: 0,
        animation: "cityReveal 0.8s ease-out both",
    },

    /* ── PixiJS canvas wrapper (sits above city, below header) ── */
    pixiLayer: {
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
    },

    /* ── Header (floats over the image) ── */
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
        padding: "18px 24px 12px",
        background: "linear-gradient(180deg, rgba(214,238,254,0.85) 0%, rgba(214,238,254,0) 100%)",
        animation: "fadeSlideDown 0.6s ease-out both",
    },

    badgeGroup: {
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        justifyContent: "center",
    },

    badge: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1.5px solid rgba(56, 152, 216, 0.35)",
        borderRadius: "40px",
        padding: "10px 22px",
        boxShadow:
            "0 4px 14px rgba(56, 152, 216, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
    },

    badgeIcon: {
        fontSize: "22px",
        lineHeight: 1,
    },

    badgeText: {
        display: "flex",
        flexDirection: "column",
        lineHeight: 1.25,
    },

    badgeLabel: {
        fontSize: "11px",
        fontWeight: 500,
        color: "#6b8faa",
        textTransform: "uppercase",
        letterSpacing: "0.6px",
    },

    badgeValue: {
        fontSize: "16px",
        fontWeight: 700,
        color: "#1a3d5c",
    },
};
