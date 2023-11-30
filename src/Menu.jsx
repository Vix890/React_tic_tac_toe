import React from 'react';
import { useState } from "react";

import { TURNS } from "./constants.js";

import App from "./App";
import Easy from "./Easy.jsx";
import "./index.css";

function Menu() {

    const [mode, setMode] = useState(() => {
        const modeFromStorage = window.localStorage.getItem("mode");
        return modeFromStorage ?? "pvp";
    });

    // const [turn, setTurn] = useState(() => {
    //     const turnFromStorage = window.localStorage.getItem("turn");
    //     return turnFromStorage ?? TURNS.X;
    // });

    // // null es que no hay ganador, false es que hay un empate
    // const [winner, setWinner] = useState(null);

    const [commonProps, setCommonProps] = useState({
        board: useState(() => {
            const boardFromStorage = window.localStorage.getItem("board");
            if (boardFromStorage) return JSON.parse(boardFromStorage);
            return Array(9).fill(null);
        }),
        turn: useState(() => {
            const turnFromStorage = window.localStorage.getItem("turn");
            return turnFromStorage ?? TURNS.X;
        }),
        winner: useState(null),
    });

    const handleMenuItemChange = (selected) => {
        setMode(selected);
    };

    const renderSelectedComponent = () => {
        switch (mode) {
            case "app":
                return <App appProps={{ ...commonProps, setCommonProps }} />;
            case "easy":
                return <Easy easyProps={{ ...commonProps, setCommonProps }} />;
            default:
                return null;
        }
    };

    return (
        <section>
            <h1>Tic tac toe</h1>
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

            <button >Reset del juego</button>

            {renderSelectedComponent()}
        </section>
    );
}

export default Menu;