import React from "react";
import Button from "react-bootstrap/Button";

export default function AdminView({ onClick }) {
  return (
    <div>
      <h1>Admin View</h1>
      <Button onClick={onClick}>Obliterate Database</Button>
    </div>
  );
}
