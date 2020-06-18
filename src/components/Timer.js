import React from "react";

export default function Timer({ timeRemaining, ...props }) {
  return (
    <div className="timer">
      {timeRemaining}
      {props.children}
    </div>
  );
}
