import React from "react";

const Modal = ({ userName, userIcon, setUserName, setUserIcon, handleUserSubmit, skipGame }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Enter Your Details</h2>
        <form onSubmit={handleUserSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Your Icon (e.g., 🎮)"
            value={userIcon}
            onChange={(e) => setUserIcon(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
            Start Game
          </button>
        </form>
        <button
          onClick={skipGame}
          className="w-full p-2 mt-2 bg-gray-500 text-white rounded"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default Modal;