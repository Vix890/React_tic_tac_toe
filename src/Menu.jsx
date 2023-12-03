import React from 'react';
import { useState } from "react";
import { resetGameStorage } from "./logic/storage/index.js";
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
        resetGameStorage();
    };

    window.addEventListener("load", () => resetGameStorage());
    window.addEventListener("beforeunload", () => resetGameStorage());
    window.addEventListener("unload", () => resetGameStorage());

    const renderSelectedComponent = () => {
        switch (mode) {
            case "pvp":
                return <Pvp />;

            case "ia":
                return <Easy />;

            default:
                return <Pvp />;
        }
    };

    return (
        <section>
            <article>
                <h1>Tic tac toe</h1>
                <label htmlFor="mode-select">Choose a mode: </label>

                <select
                id="mode-select"
                onChange={(e) => handleMenuItemChange(e.target.value)}
                >
                    <option value="pvp">PvP</option>
                    <option value="ia">IA</option>
                </select>
            </article>

            {renderSelectedComponent()}
        </section>
    );
}

export default Menu;