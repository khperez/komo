import React from "react";
import Button from "@material-ui/core/Button";
import Form from "react-bootstrap/Form";

function NumCategoriesForm({changeHandler, submitHandler}) {
  return (
      <div className="hostView">
        <form onSubmit={submitHandler}
          autoComplete="off">
          <Form.Group 
            className="Host-form"
            onChange={changeHandler}>
            <Form.Control
            placeholder="number of categories"
            name="numCategories" />
            <Form.Control
            placeholder="timer in seconds"
            name="timeRemaining" />
          </Form.Group>
          <div className="Host-settings-submit">
            <Button type="submit" label="login" variant="contained">
              Start Game
            </Button>
          </div>
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
      <div className="Host-view-settings">Game Settings</div>
      <NumCategoriesForm
        changeHandler={changeHandler}
        submitHandler={submitHandler}/>
    </div>
  );
}
