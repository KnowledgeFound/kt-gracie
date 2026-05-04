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
    username: "Lynn",
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
                    {/* Health Badge — blue heart + progress bar */}
                    <div style={styles.healthBadge}>
                        {/* Blue circle heart icon */}
                        <div style={styles.heartCircle}>
                            <svg width="22" height="20" viewBox="0 0 24 22" fill="none">
                                <path
                                    d="M12 21s-9-5.5-9-12.5C3 4.5 5.5 2 8.5 2c1.74 0 3.41.81 4.5 2.09A6.04 6.04 0 0 1 17.5 2C20.5 2 23 4.5 23 8.5 23 15.5 12 21 12 21z"
                                    fill="#6ec6f0"
                                />
                            </svg>
                        </div>
                        <div style={styles.healthContent}>
                            <span style={styles.healthLabel}>CITY HEALTH: {health}%</span>
                            <div style={styles.progressTrack}>
                                <div
                                    style={{
                                        ...styles.progressFill,
                                        width: `${health}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tokens Badge — KT coin */}
                    <div style={styles.badge}>
                        <div style={styles.ktCoin}>
                            <div style={styles.ktCoinInner}>
                                <span style={styles.ktCoinText}>KT</span>
                            </div>
                        </div>
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

    /* ── Health badge with progress bar ── */
    healthBadge: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "rgba(235, 245, 255, 0.92)",
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

    heartCircle: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #d0eaff 0%, #eef7ff 100%)",
        border: "2px solid rgba(110, 198, 240, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    healthContent: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },

    healthLabel: {
        fontSize: "11px",
        fontWeight: 700,
        color: "#3a6d8c",
        letterSpacing: "0.6px",
    },

    progressTrack: {
        width: "140px",
        height: "14px",
        background: "#c8dce8",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid rgba(56, 152, 216, 0.25)",
    },

    progressFill: {
        height: "100%",
        background: "linear-gradient(90deg, #5cb8e8 0%, #3a9ad9 100%)",
        borderRadius: "8px",
        transition: "width 0.6s ease-in-out",
        backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.25) 8px, rgba(255,255,255,0.25) 10px)",
    },

    /* ── KT Coin icon ── */
    ktCoin: {
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #b8d8f0 0%, #6aafe0 50%, #4a98d4 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
            "0 2px 8px rgba(74, 152, 212, 0.35), inset 0 1px 2px rgba(255,255,255,0.4)",
        flexShrink: 0,
    },

    ktCoinInner: {
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        border: "2px solid rgba(255, 255, 255, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
    },

    ktCoinText: {
        fontSize: "12px",
        fontWeight: 800,
        color: "#ffffff",
        letterSpacing: "1px",
        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
    },
};
