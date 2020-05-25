import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';

export default function JoinForm(props) {
  return (
    <div>
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
              {props.host==="true" ?  "Create Game" : "Join Game"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onChange={props.onChange}>
              {props.host==="false" &&
              <FormGroup>
                <Form.Label>Room Code</Form.Label>
                <Form.Control
                  placeholder="Enter room code"
                  name="roomCode"
                />
              </FormGroup>
              }
              <FormGroup>
                <Form.Label>Username</Form.Label>
                <Form.Control
                  placeholder="Enter username"
                  name="username"
                />
              </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onSubmit}>Submit</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}