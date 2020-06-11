import React from "react";

export default function LobbyView({players, roomCode}) {
  const playerList = players.map((player, i) =>
    <li key={i} className="player">{player}</li>
  );
  return (
    <div className="Lobby-container">
      <div className="Room-code-main">
        <div className="Room-code-title">
          Room Code
        </div>
        <div className="Room-code-id">
          {roomCode}
        </div>
      </div>
      <div className="Lobby-players-connected">
        Players: {players.length} 
      </div>
      <ul className="playerList">
        {playerList}
      </ul>
    </div>
  )
}