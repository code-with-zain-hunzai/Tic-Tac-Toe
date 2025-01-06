import React, { useState, useEffect } from "react";
import moveSoundFile from "./assets/sound/move.mp3";
import winSoundFile from "./assets/sound/winSound.wav";
import drawSoundFile from "./assets/sound/matchDraw.mp3";

const App = () => {
  const [boxes, setBoxes] = useState(Array(9).fill(""));
  const [turnO, setTurnO] = useState(true);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [level, setLevel] = useState(1);

  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const moveSound = new Audio(moveSoundFile);
  const winSound = new Audio(winSoundFile);
  const drawSound = new Audio(drawSoundFile);

  // Save game state to localStorage
  const saveGameState = () => {
    const gameState = {
      boxes,
      turnO,
      winner,
      isDraw,
      level,
    };
    localStorage.setItem("ticTacToeGameState", JSON.stringify(gameState));
  };

  // Load game state from localStorage
  const loadGameState = () => {
    const savedState = localStorage.getItem("ticTacToeGameState");
    if (savedState) {
      const { boxes, turnO, winner, isDraw, level } = JSON.parse(savedState);
      setBoxes(boxes);
      setTurnO(turnO);
      setWinner(winner);
      setIsDraw(isDraw);
      setLevel(level);
    }
  };

  useEffect(() => {
    loadGameState();
  }, []);

  useEffect(() => {
    saveGameState();
  }, [boxes, turnO, winner, isDraw, level]);

  const resetGame = () => {
    setBoxes(Array(9).fill(""));
    setTurnO(true);
    setWinner(null);
    setIsDraw(false);
    setLevel(1);
    localStorage.removeItem("ticTacToeGameState");
  };

  const nextLevel = () => {
    setLevel(level + 1);
    setBoxes(Array(9).fill(""));
    setTurnO(true);
    setWinner(null);
    setIsDraw(false);
  };

  const handleBoxClick = (index) => {
    // Prevent move if box is already filled, there's a winner, or it's not player O's turn
    if (boxes[index] || winner || !turnO) return;

    const newBoxes = [...boxes];
    newBoxes[index] = "O";
    setBoxes(newBoxes);
    moveSound.play();
    checkWinner(newBoxes);
    setTurnO(false);

    // Allow AI move only if no winner or draw yet
    if (!winner && !isDraw) {
      setTimeout(() => makeAIMove(newBoxes), 1000);
    }
  };

  const makeAIMove = (newBoxes) => {
    if (winner || isDraw) return; // Prevent AI move if game is over

    const aiMove = randomMove(newBoxes);
    newBoxes[aiMove] = "X";
    setBoxes(newBoxes);
    moveSound.play();
    checkWinner(newBoxes);
    setTurnO(true);
  };

  const randomMove = (newBoxes) => {
    const availableBoxes = newBoxes
      .map((box, idx) => (box === "" ? idx : null))
      .filter((idx) => idx !== null);
    return availableBoxes[Math.floor(Math.random() * availableBoxes.length)];
  };

  const checkWinner = (newBoxes) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        newBoxes[a] &&
        newBoxes[a] === newBoxes[b] &&
        newBoxes[a] === newBoxes[c]
      ) {
        setWinner(newBoxes[a]);
        winSound.play();
        return;
      }
    }

    if (newBoxes.every((box) => box)) {
      setIsDraw(true);
      drawSound.play();
    }
  };

  return (
    <div className="min-h-screen bg-teal-500 flex flex-col justify-center items-center text-center">
      <h1 className="text-4xl font-bold text-white mb-6">Tic Tac Toe</h1>
      <div className="text-lg text-white mb-4">
        {winner ? (
          <span className="text-2xl">
            🎉 {winner === "O" ? "You Win!" : "AI Wins!"} 🎉
          </span>
        ) : isDraw ? (
          <span className="text-2xl">🤝 Oops, the match is a draw! 🤝</span>
        ) : (
          <span className="text-xl">{`Level ${level}: Player ${
            turnO ? "O" : "X"
          }'s turn`}</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 w-72">
        {boxes.map((box, index) => (
          <button
            key={index}
            className={`w-20 h-20 bg-yellow-300 text-4xl font-bold rounded-lg shadow-lg ${
              box === "O" ? "text-purple-600" : "text-red-600"
            }`}
            onClick={() => handleBoxClick(index)}
          >
            {box}
          </button>
        ))}
      </div>
      <div className="mt-6 space-x-4">
        {winner === "O" && (
          <button
            onClick={nextLevel}
            className="px-4 py-2 bg-green-800 text-white rounded-lg shadow-lg hover:bg-green-700"
          >
            Next Level
          </button>
        )}
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default App;
