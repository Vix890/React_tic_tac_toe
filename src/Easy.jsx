import React, { useState } from "react";
import { Square } from "./components/Square.jsx";
import { TURNS } from "./constants.js";
import { checkWinnerFrom, checkEndGame } from "./logic/board.js";
import { saveGameToStorage, resetGameStorage } from "./logic/storage/index.js";
import { WinnerModal } from "./components/WinnerModal.jsx";
const tf = require("@tensorflow/tfjs");

function Easy() {

    const model = null;
    const modelUrl = "./models/model_medium.h5";

    // TODO: añadir lógica para cambio de modelo
    (async () => {
        console.log("Cargando modelo...");
        model = await tf.loadLayersModel(modelUrl);
        console.log("Modelo cargado...");
    })();
    
    const [board, setBoard] = useState(() => {
        const boardFromStorage = window.localStorage.getItem("board");
        if (boardFromStorage) return JSON.parse(boardFromStorage);
        return Array(9).fill(null);
    });

    const [turn, setTurn] = useState(() => {
        const turnFromStorage = window.localStorage.getItem("turn");
        return turnFromStorage ?? TURNS.X;
    });


    // null es que no hay ganador, false es que hay un empate
    const [winner, setWinner] = useState(null);

    const handleMove = (index) => {
        
        if (turn === TURNS.X) {
            updateBoard(index);
        } else {
            // IA
            const status = boardStatus();
            console.log("status", status);
            const legalMoves = legalMovesGenerator(status);
            console.log("legalMoves", legalMoves);
            const selectedMove = moveSelector(legalMoves);
            console.log("selectedMove", selectedMove);
        }
        
    }

    const moveSelector = (legalMoves) => {
    
        const tracker = {};
        for (const legal_move in legalMoves) {
            const score = model.predict(legalMoves[legal_move]);
            tracker[legal_move] = score;
        }

        const selectedMove = Object.keys(tracker).reduce((a, b) => tracker[a] > tracker[b] ? a : b);

        return selectedMove;    
    }

    const legalMovesGenerator = (boardStatus) => {
    
        let legalMovesDict = {};
        
        for (let i = 0; i < boardStatus.length; i++) {
            
            let array = [...boardStatus];
            legalMovesDict[i] = array;

            if (array[i] === 2) {
                for (let j = 0; j < boardStatus.length; j++) {
                    if (array[j] === 2) {
                        array[i] = 0;
                    }
                }
            }
        }
        return legalMovesDict;
    }

    const boardStatus = () => {
        
        let array = [];

        for (let j = 0; j < board.length; j++) {
            if (board[j] === null) {
                array.push(2);
            }
            if (board[j] === TURNS.X) {
                array.push(1);
            }
            if (board[j] === TURNS.O) {
                array.push(0);
            }
        }            
        
        return array;
    }

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setTurn(TURNS.X);
        setWinner(null);

        resetGameStorage();
    };

    const updateBoard = (index) => {

      // no actualizamos esta posición
      // si ya tiene algo
        if (board[index] || winner) return;

        // actualizar el tablero
        const newBoard = [...board];
        newBoard[index] = turn;
        setBoard(newBoard);

        // cambiar el turno
        const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X;

        setTurn(newTurn);
        // guardar aqui partida
        saveGameToStorage({
            board: newBoard,
            turn: newTurn,
        });

        // revisar si hay ganador
        const newWinner = checkWinnerFrom(newBoard);

        // * Resultado
        if (newWinner) {
            setWinner(newWinner);
        } else if (checkEndGame(newBoard)) {
            setWinner(false); // empate
        }
    };

    return (
        <article className="board">
            <button onClick={resetGame}>Reset del juego</button>

            <div className="game">
            {board.map((square, index) => {
                return (
                <Square key={index} index={index} updateBoard={handleMove}>
                    {square}
                </Square>
                );
            })}
            </div>

            <div className="turn">
                <Square isSelected={turn === TURNS.X}>{TURNS.X}</Square>
                <Square isSelected={turn === TURNS.O}>{TURNS.O}</Square>
            </div>

            <WinnerModal resetGame={resetGame} winner={winner} />
        </article>
    );
}

export default Easy;