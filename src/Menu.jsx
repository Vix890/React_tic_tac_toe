import React from 'react';
import { useState } from "react";

import { TURNS } from "./constants.js";

import Pvp from "./Pvp.jsx";
import Easy from "./Easy.jsx";
import "./index.css";

function Menu() {

    const [mode, setMode] = useState(() => {
        const modeFromStorage = window.localStorage.getItem("mode");
        return modeFromStorage ?? "pvp";
    });

    const handleMenuItemChange = (selected) => {
        setMode(selected);
    };

    const renderSelectedComponent = () => {
        switch (mode) {
            case "pvp":
                return <Pvp />;
            case "easy":
                return <Easy />;
            default:
                return null;
        }
    };

    return (
        <section>

            <article>
                <h1>Tic tac toe</h1>
                <h2>Player vs Player</h2>
                <label htmlFor="mode-select">Choose a mode: </label>

                <select
                id="mode-select"
                onChange={(e) => handleMenuItemChange(e.target.value)}
                >
                <option value="pvp">PvP</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                </select>
            </article>

            {renderSelectedComponent()}
        </section>
    );
}

export default Menu;