import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default function GameView({categories, categoryLetter, onChange, onSubmit}) {
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
        <Button onClick={onSubmit} type='submit'>Submit</Button>
      </div>
      <div className="letter">
        {categoryLetter}
      </div>
    </div>
    )
  }
