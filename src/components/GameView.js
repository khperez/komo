import React from 'react';
import Form from 'react-bootstrap/Form';

export default function GameView({ categories, onChange, onSubmit }) {
  const categoryList = categories.map((category, index) => (
    <Form onChange={onChange.bind(this, category.id)} key={category.id} onSubmit={onSubmit}>
      <Form.Group>
        <Form.Label className="Game-form-label">
          <span className="Game-form-input-index">{index + 1}</span> {category.name}
        </Form.Label>
        <Form.Control className="Game-form-input-answer" />
      </Form.Group>
    </Form>
  ));
  return (
    <div className="Game-form-container">
      <div className="Game-form-input">{categoryList}</div>
    </div>
  );
}
