import React from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

export default function LobbyView({players, roomCode}) {
  const playerList = players.map((player, i) => 
    <li key={i}>{player}</li>
  );
  return (
    <div>
      <h1>Lobby</h1>
      <h2>Room Code: {roomCode}</h2>
      <ul>
        {playerList}
      </ul>
    </div>
  )
}