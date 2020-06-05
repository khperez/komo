import React from "react";

export default function LobbyView({players, roomCode}) {
  const playerList = players.map((player, i) =>
    <li key={i} className="player">{player}</li>
  );
  return (
    <div>
      <div className="Room-code-main">
        Room Code:
        <span className="Room-code-id">
          {roomCode}
        </span>
      </div>
      <ul className="playerList">
        {playerList}
      </ul>
    </div>
  )
}