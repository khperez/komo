import React from 'react';
import Modal from 'react-bootstrap/Modal';
import winnerImage from '../images/winner.png';

export default function WinnerPrize(props) {
  return (
    <div>
      <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body className="Winner-body">
          <img src={winnerImage} className="yoshi" alt="beeg yoshi" />
        </Modal.Body>
      </Modal>
    </div>
  );
}
