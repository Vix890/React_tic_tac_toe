import { useState } from "react";
import { Square } from "./components/Square.jsx";
import { TURNS } from "./constants.js";
import { checkWinnerFrom, checkEndGame } from "./logic/board.js";
import { WinnerModal } from "./components/WinnerModal.jsx";
import { saveGameToStorage, resetGameStorage } from "./logic/storage/index.js";
import React from "react";

function App (appProp) {

  const { board, turn, winner, setBoard, setTurn, setWinner } = appProp;

  // const [board, setBoard] = useState(() => {
  //   const boardFromStorage = window.localStorage.getItem("board");
  //   if (boardFromStorage) return JSON.parse(boardFromStorage);
  //   return Array(9).fill(null);
  // });

  // const [turn, setTurn] = useState(() => {
  //   const turnFromStorage = window.localStorage.getItem("turn");
  //   return turnFromStorage ?? TURNS.X;
  // });

  // // null es que no hay ganador, false es que hay un empate
  // const [winner, setWinner] = useState(null);

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
    if (newWinner) {
      // * Resultado
      setWinner(newWinner);
    } else if (checkEndGame(newBoard)) {
      setWinner(false); // empate
    }
  };

  return (
    <article className="board">
      <article className="game">
        {board.map((square, index) => {
          return (
            <Square key={index} index={index} updateBoard={updateBoard}>
              {square}
            </Square>
          );
        })}
      </article>

      <article className="turn">
        <Square isSelected={turn === TURNS.X}>{TURNS.X}</Square>
        <Square isSelected={turn === TURNS.O}>{TURNS.O}</Square>
      </article>

      <WinnerModal resetGame={resetGame} winner={winner} />
    </article>
  );
}

export default App;
