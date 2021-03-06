import React from 'react';

export default function AwaitResultsView({ players }) {
  const playerList = players.map((player, i) => <li key={i}>{player}</li>);
  return (
    <div>
      <h1>Awaiting Results</h1>
      <h3>Players who have submitted:</h3>
      <ul>{playerList}</ul>
    </div>
  );
}
