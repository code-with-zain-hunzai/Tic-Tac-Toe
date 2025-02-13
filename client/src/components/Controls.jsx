import React from "react";

const Controls = ({ winner, isDraw, nextLevel, retryGame, resetGame, startNewGame }) => {
  return (
    <div className="mt-6 space-x-4">
      {winner === "O" && (
        <button
          onClick={nextLevel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700"
        >
          Next Level
        </button>
      )}
      {(isDraw || winner === "X") && (
        <button
          onClick={retryGame}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg shadow-lg hover:bg-yellow-500"
        >
          Retry
        </button>
      )}
      <button
        onClick={resetGame}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700"
      >
        Reset Game
      </button>
      <button
        onClick={startNewGame}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-500"
      >
        New Game
      </button>
    </div>
  );
};

export default Controls;