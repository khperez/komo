import React from "react";
import Button from "@material-ui/core/Button";
import Form from "react-bootstrap/Form";
import { useState } from 'react';

export default function HostLobbyView(props) {

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
    <div>
      <div className="Host-view-settings">Game Settings</div>
      <div className="hostView" onSubmit={props.onSubmit}>
        <Form noValidate validated={validated} onSubmit={handleSubmit} autoComplete="off">
          <Form.Group className="Host-form">
            <div className="Host-form-category-container">
              <Form.Label className="Host-form-category">Number of categories</Form.Label>
              <Form.Control
                required
                type="number"
                min={min_num_categories}
                max={max_num_categories}
                placeholder={min_num_categories + " - " + max_num_categories}
                name="numCategories"
                onChange={props.onChange}
              />
            </div>
            <div>
              <Form.Label className="Host-form-category">Timer (seconds)</Form.Label>
              <Form.Control
                required
                type="number"
                min={min_timer_in_seconds}
                max={max_timer_in_seconds}
                placeholder={min_timer_in_seconds + " - " + max_timer_in_seconds}
                name="timeRemaining"
                onChange={props.onChange}
              />
            </div>
          </Form.Group>
          <div className="Host-settings-submit">
            <Button type="submit" variant="contained">Start Game</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
