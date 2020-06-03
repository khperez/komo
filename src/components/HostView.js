import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Form from "react-bootstrap/Form";

function NumCategoriesForm({changeHandler, submitHandler}) {
  return (
      <div className="hostView">
        <form onSubmit={submitHandler}
          autoComplete="off">
          {/* <div>
          <InputLabel id="demo-simple-select-label">Age</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={age}
            onChange={handleChange}
          >
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
          </div> */}
          <Form.Group className="Host-form">
            <Form.Control
            placeholder="number of categories"
            name="numCategories" />
            <Form.Control
            placeholder="timer in seconds"
            name="timeRemaining" />
          </Form.Group>
          <p>
          <Button type="submit" label="login" variant="contained">
            Start Game
          </Button>
          </p>
        </form>
      </div>
  );
}

export default function HostView (
  {
    changeHandler,
    submitHandler 
  }) {
  return (
    <div>
      <div className="Room-code-host">You are the host</div>
      <h1>Game Settings</h1>
      <NumCategoriesForm
        changeHandler={changeHandler}
        submitHandler={submitHandler}/>
    </div>
  );
}
