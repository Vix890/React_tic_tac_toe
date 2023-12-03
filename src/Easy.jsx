import React, { useState } from "react";
import { Square } from "./components/Square.jsx";
import { TURNS } from "./constants.js";
import { checkWinnerFrom, checkEndGame } from "./logic/board.js";
import { saveGameToStorage, resetGameStorage } from "./logic/storage/index.js";
import { WinnerModal } from "./components/WinnerModal.jsx";
import * as tf from "@tensorflow/tfjs";
const nj = require("numjs");

function Easy() {

    // ? los modelos en public, si no el servidor no los carga
    var model = null;
    let modelUrl = process.env.PUBLIC_URL + "/models/hard/model.json";

    // ? carga del modelo
    (async () => {
        model = await tf.loadLayersModel(modelUrl);
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

    // ? null es que no hay ganador, false es que hay un empate
    const [winner, setWinner] = useState(null);

    // IA
    const moveIA = () => {

        if (turn === TURNS.X || winner) return;

        const status = boardStatus();
        
        const legalMoves = legalMovesGenerator(status);

        const selectedMove = moveSelector(legalMoves);

        updateBoard(selectedMove);
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
    
    const legalMovesGenerator = (boardStatus) => {
        
        let legalMovesDict = {};
        
        for (let i = 0; i < boardStatus.length; i++) {
            
            let wrapArray = [];
            let array = [...boardStatus];
            
            if (array[i] === 2) {
                for (let j = 0; j < boardStatus.length; j++) {
                    if (array[j] === 2) {
                        array[i] = 0;
                    }
                }
            }

            wrapArray.push(array);

            // verificar si el movimiento es posible
            if (posibleMove(array, boardStatus)) {
                legalMovesDict[i] = wrapArray;
            }
        }
        
        return legalMovesDict;
    }

    const posibleMove = (array, boardStatus) => {

        if (array.length !== boardStatus.length) return false;

        for (let i = 0; i < array.length; i++) {
            if (array[i] !== boardStatus[i]) return true;
        }

        return false;
    }
    

    const moveSelector = (legalMoves) => {
    
        const tracker = {};
        for (const legal_move in legalMoves) {
            var posibleMove = nj.array(legalMoves[legal_move]).tolist()[0];

            const inputTensor = tf.tensor2d([posibleMove]);

            const score = model.predict(inputTensor);
            tracker[legal_move] = score;
        }
        const selectedMove = Object.keys(tracker).reduce((a, b) => tracker[a] > tracker[b] ? a : b);

        return selectedMove;    
    }
    
    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setTurn(TURNS.X);
        setWinner(null);

        resetGameStorage();
    };

    const updateBoard = (index) => {

      // ? no actualizamos esta posición si ya tiene algo
        if (board[index] || winner) return;

        // ? actualizar el tablero
        const newBoard = [...board];
        newBoard[index] = turn;
        setBoard(newBoard);

        console.log(board);
        console.log(newBoard);

        // ? cambiar el turno
        const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X;
        setTurn(newTurn);

        // ? guardar aqui partida
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

    const handleMove = (index) => {
        updateBoard(index);
        console.log(board);
        console.log(turn);
        moveIA(turn);
    };

    return (
        <article className="board">
            <h2>Player vs IA</h2>

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