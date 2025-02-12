import React from "react";

const Leaderboard = ({ leaderboard }) => {
  // Defensive check to ensure leaderboard is an array
  if (!Array.isArray(leaderboard)) {
    console.error("Leaderboard is not an array:", leaderboard);
    return (
      <div className="text-red-500 text-center mt-8">
        Error loading leaderboard. Please try again later.
      </div>
    );
  }

  return (
    <div className="mt-6 w-2/12">
    <h2 className="text-2xl text-white font-bold mb-4">Leaderboard</h2>
    <div className="bg-white p-4 rounded-md shadow-lg">
      {leaderboard.map((player, index) => (
        <div key={player.name} className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="mr-2">{player.icon}</span>
            <span className="font-semibold">{player.name}</span>
          </div>
          <span className="bg-teal-500 text-white px-3 py-1 rounded-full">
            Level {player.level}
          </span>
        </div>
      ))}
    </div>
  </div>
  );
};

export default Leaderboard;