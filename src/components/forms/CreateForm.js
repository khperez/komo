import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import { Link } from 'react-router-dom';

export default function CreateForm(props) {
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
            Create Game
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onChange={props.onChange}>
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
          <Button onClick={props.onSubmit}>
            <Link to="/lobby">
              Submit
            </Link>
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}