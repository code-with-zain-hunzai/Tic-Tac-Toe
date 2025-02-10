import React, { useState, useEffect } from "react";
import axios from "axios";
import moveSoundFile from "./assets/sound/move.mp3";
import winSoundFile from "./assets/sound/winSound.wav";
import drawSoundFile from "./assets/sound/matchDraw.mp3";
import backgroundMusicFile from "./assets/sound/bgSound.mp3";
import GameBoard from "./components/GameBoard";
import Leaderboard from "./components/Leaderboard";
import Modal from "./components/Modal";
import Controls from "./components/Controls";

const App = () => {
  const [boxes, setBoxes] = useState(Array(9).fill(""));
  const [turnO, setTurnO] = useState(true);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [level, setLevel] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [userName, setUserName] = useState("");
  const [userIcon, setUserIcon] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);

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
  const backgroundMusic = new Audio(backgroundMusicFile);

  useEffect(() => {
    if (!hasStarted) {
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.1;
      backgroundMusic.play();
    } else {
      backgroundMusic.pause();
    }
    return () => {
      backgroundMusic.pause();
    };
  }, [hasStarted]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get("/api/leaderboard");
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  const saveGameState = async () => {
    if (currentPlayer) {
      try {
        await axios.post("/api/leaderboard", {
          name: currentPlayer.name,
          icon: currentPlayer.icon,
          level: level,
        });
        fetchLeaderboard(); // Refresh leaderboard after saving
      } catch (error) {
        console.error("Failed to save game state:", error);
      }
    }
  };

  const resetGame = () => {
    setBoxes(Array(9).fill(""));
    setTurnO(true);
    setWinner(null);
    setIsDraw(false);
  };

  const startNewGame = () => {
    resetGame();
    setLevel(1);
    setHasStarted(false);
  };

  const nextLevel = () => {
    if (level < 10) {
      setLevel(level + 1);
      resetGame();
      saveGameState(); // Save updated level to the database
    }
  };

  const retryGame = () => {
    resetGame();
    setIsDraw(false);
    setWinner(null);
  };

  const checkWinner = (board) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const isBoardFull = (board) => {
    return board.every((cell) => cell !== "");
  };

  const handleBoxClick = (index) => {
    if (boxes[index] || winner || !turnO) return;

    const newBoxes = [...boxes];
    newBoxes[index] = "O";
    setBoxes(newBoxes);
    moveSound.play();

    const gameWinner = checkWinner(newBoxes);
    if (gameWinner) {
      setWinner(gameWinner);
      winSound.play();
      return;
    }

    if (isBoardFull(newBoxes)) {
      setIsDraw(true);
      drawSound.play();
      return;
    }

    setTurnO(false);
    if (!hasStarted) setHasStarted(true);

    setTimeout(() => {
      const aiMove = getBestMove(newBoxes);
      if (aiMove !== null) {
        newBoxes[aiMove] = "X";
        setBoxes(newBoxes);
        moveSound.play();

        const finalWinner = checkWinner(newBoxes);
        if (finalWinner) {
          setWinner(finalWinner);
          winSound.play();
        } else if (isBoardFull(newBoxes)) {
          setIsDraw(true);
          drawSound.play();
        }

        setTurnO(true);
      }
    }, 1000);
  };

  const getBestMove = (board) => {
    const availableMoves = board
      .map((cell, index) => (cell === "" ? index : null))
      .filter((index) => index !== null);

    let bestMove = null;
    let bestScore = -Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    const makeRandomMove = Math.random() > level / 10;

    if (makeRandomMove) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    for (let move of availableMoves) {
      board[move] = "X";
      const score = minimax(board, 0, false, alpha, beta);
      board[move] = "";

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    }

    return bestMove;
  };

  const minimax = (board, depth, isMaximizing, alpha, beta) => {
    const winner = checkWinner(board);

    if (winner === "X") return 10 - depth;
    if (winner === "O") return depth - 10;
    if (isBoardFull(board)) return 0;

    const availableMoves = board
      .map((cell, index) => (cell === "" ? index : null))
      .filter((index) => index !== null);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let move of availableMoves) {
        board[move] = "X";
        const score = minimax(board, depth + 1, false, alpha, beta);
        board[move] = "";
        bestScore = Math.max(bestScore, score);
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let move of availableMoves) {
        board[move] = "O";
        const score = minimax(board, depth + 1, true, alpha, beta);
        board[move] = "";
        bestScore = Math.min(bestScore, score);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;
      }
      return bestScore;
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
  
    if (!userName || !userIcon) {
      alert("Please enter a username and select an icon.");
      return;
    }
  
    const newUser = { name: userName, icon: userIcon, level: 1 };
  
    try {
      const response = await axios.post("/api/leaderboard", newUser);
      setCurrentPlayer(newUser);
      setShowModal(false);
      fetchLeaderboard(); // Refresh leaderboard after saving
    } catch (error) {
      console.error("Error saving user data:", error);
      if (error.response && error.response.status === 409) {
        alert("Username already exists. Please choose another one.");
      } else {
        alert("Failed to save user data. Please try again.");
      }
    }
  };

  const skipGame = () => {
    const guestUser = { name: "Guest", icon: "👤", level: 1 };
    setCurrentPlayer(guestUser);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-teal-500 flex flex-col justify-center items-center text-center">
      {showModal && (
        <Modal
          userName={userName}
          userIcon={userIcon}
          setUserName={setUserName}
          setUserIcon={setUserIcon}
          handleUserSubmit={handleUserSubmit}
          skipGame={skipGame}
        />
      )}
      <h1 className="text-4xl font-bold text-white mb-6">Tic Tac Toe</h1>
      <GameBoard
        boxes={boxes}
        turnO={turnO}
        winner={winner}
        isDraw={isDraw}
        level={level}
        handleBoxClick={handleBoxClick}
      />
      <Controls
        winner={winner}
        isDraw={isDraw}
        nextLevel={nextLevel}
        retryGame={retryGame}
        resetGame={resetGame}
        startNewGame={startNewGame}
      />
      <Leaderboard leaderboard={leaderboard} />
    </div>
  );
};

export default App;