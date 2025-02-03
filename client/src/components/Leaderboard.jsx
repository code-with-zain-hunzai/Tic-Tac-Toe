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
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
      <div className="bg-white p-4 rounded-lg">
        {leaderboard.length === 0 ? (
          <p className="text-gray-600 text-center">No leaderboard data available.</p>
        ) : (
          leaderboard.map((user, index) => (
            <div key={user.id || index} className="flex justify-between items-center mb-2">
              <span>{`${index + 1}. ${user.icon} ${user.name}`}</span>
              <span>Level: {user.level}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;