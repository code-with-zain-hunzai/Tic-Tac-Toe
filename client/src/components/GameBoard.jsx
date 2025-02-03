import React from "react";

const GameBoard = ({ boxes, turnO, winner, isDraw, level, handleBoxClick }) => {
  return (
    <div>
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
    </div>
  );
};

export default GameBoard;