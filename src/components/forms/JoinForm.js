import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import { useState } from 'react';

export default function JoinForm(props) {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
  };

  return (
    <div>
      <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Join Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <FormGroup>
              <Form.Label>Room Code</Form.Label>
              <Form.Control
                required
                type="text"
                minLength="4"
                maxLength="4"
                placeholder="Enter room code"
                name="roomCode"
                onChange={props.onChange}
              />
            </FormGroup>
            <FormGroup>
              <Form.Label>Username</Form.Label>
              <Form.Control
                required
                type="text"
                minLength="1"
                maxLength="10"
                placeholder="Enter username"
                name="username"
                onChange={props.onChange}
              />
            </FormGroup>
            <Button type="submit">Submit</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
