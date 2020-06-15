import React from "react";
import Button from "@material-ui/core/Button";
import Form from "react-bootstrap/Form";
import { useState } from 'react';

function NumCategoriesForm({changeHandler, submitHandler}) {

  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
  };

  const min_num_categories = "1";
  const max_num_categories = "20";

  const min_timer_in_seconds = "1";
  const max_timer_in_seconds = "999";

  return (
      <div className="hostView">
        <Form noValidate validated={validated} onSubmit={handleSubmit} autoComplete="off">
          <Form.Group className="Host-form">
            <Form.Control
              required
              type="number"
              min={min_num_categories}
              max={max_num_categories}
              placeholder={"Number of catergories (" + min_num_categories + " - " + max_num_categories + ")"}
              name="numCategories"
              onChange={changeHandler}
            />
            <Form.Control
              required
              type="number"
              min={min_timer_in_seconds}
              max={max_timer_in_seconds}
              placeholder={"timer in seconds (" + min_timer_in_seconds + " - " + max_timer_in_seconds + ")"}
              name="timeRemaining"
              onChange={changeHandler}
            />
          </Form.Group>
          <div className="Host-settings-submit">
            <Button type="submit" variant="contained">Start Game</Button>
          </div>
        </Form>
      </div>
  );
}

export default function HostLobbyView (
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