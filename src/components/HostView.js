import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

function RoomCode({ code }) {
  return (
    <div className="Room-code-main">
      <div className="Room-code-content">
        <span className="Room-code-title">Room Code: </span>
        <span className="Room-code-id">{code}</span>
      </div>
    </div>
  );
}

function NumCategoriesForm({changeHandler, submitHandler}) {
  return (
      <form onSubmit={submitHandler} autoComplete="off">
        <TextField onChange={changeHandler} 
          id="outlined-basic"
          label="number of categories"
          variant="outlined"
          name="numCategories"/>
        <TextField onChange={changeHandler} 
          id="outlined-basic"
          label="timer in seconds"
          variant="outlined"
          name="timeRemaining"/>
        <p>
        <Button type="submit" label="login" variant="contained">
          Start Game
        </Button>
        </p>
      </form>
  );
}

export default function HostView (
  { code, 
    changeHandler,
    submitHandler 
  }) {
  return (
    <div>
      <div className="Room-code-host">You are the host</div>
      <RoomCode code={code}/>
      <h1>Game Settings</h1>
      <NumCategoriesForm
        changeHandler={changeHandler}
        submitHandler={submitHandler}/>
    </div>
  );
}
