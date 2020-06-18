import React from 'react';
import Form from 'react-bootstrap/Form';

export default function GameView({categories, onChange, onSubmit}) {
  const categoryList = categories.map((category) =>
    <Form
      onChange={onChange.bind(this, category.id)}
      key={category.id}
      onSubmit={onSubmit}>
      <Form.Group>
        <Form.Label>{category.name}</Form.Label>
        <Form.Control/>
      </Form.Group>
    </Form>
  );
  return (
    <div className="Game-form">
      <div>
        {categoryList}
      </div>
    </div>
    )
  }
