import React from "react";
import Button from "@material-ui/core/Button";

function StartButton({onClick}) {
  return (
    <Button variant="contained" color="secondary" onClick={onClick}>
      Start Game!
    </Button>
  );
}

function RoomCode({ code, onClick }) {
  return (
    <div className="Room-code-main">
      <div className="Room-code-host">You are the host</div>
      <div className="Room-code-content">
        <span className="Room-code-title">Room Code: </span>
        <span className="Room-code-id">{code}</span>
      </div>
      <div>
        <StartButton onClick={onClick}/>
      </div>
    </div>
  );
}

export default function HostView({ code , onClick }) {
  return (
    <div>
      <RoomCode code={code} 
                onClick={onClick}/>
    </div>
  );
}
