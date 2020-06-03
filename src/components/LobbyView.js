import React from "react";

export default function LobbyView({players, roomCode}) {
  const playerList = players.map((player, i) => 
    <li key={i} className="player">{player}</li>
  );
  return (
    <div>
      <h1>Lobby</h1>
      <h2>Room Code: 
        <span className="Room-code-id">
          {roomCode}
        </span>
      </h2>
      <ul className="playerList">
        {playerList}
      </ul>
    </div>
  )
}