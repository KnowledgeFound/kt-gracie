import { useState } from "react";
import "@pixi/unsafe-eval";
import CloudLayer from "../../components/pixi/clouds/CloudLayer";
import CityHeader from "../../components/city/CityHeader";
import "./CityScene.scss";

const CITY_BG_SRC = "/assets/city/city.png";

const STATS = {
    tokens: 1250,
    health: 90,
    healthMax: 100,
    username: "Lynn",
};

/**
 * Top-level page component that composes the city background,
 * animated cloud layer, and floating header bar.
 */
export default function CityScene() {
    const [tokens] = useState(STATS.tokens);
    const [health] = useState(STATS.health);
    const [username] = useState(STATS.username);

    return (
        <div className="city-scene">
            {/* Full-page city background */}
            <img
                src={CITY_BG_SRC}
                alt="Knowledge City — isometric city view"
                className="city-scene__bg"
            />

            {/* PixiJS cloud layer (between city bg & header) */}
            <div className="city-scene__pixi-layer">
                <CloudLayer />
            </div>

            {/* Floating header bar */}
            <CityHeader health={health} tokens={tokens} username={username} />
        </div>
    );
}
