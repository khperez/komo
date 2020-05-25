import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default function GameView({categories, categoryLetter, onChange, onSubmit}) {
    const categoryList = categories.map((category) =>
        <Form onChange={onChange.bind(this, category.id)} key={category.id}>
            <Form.Group>
                <Form.Label>{category.name}</Form.Label>
                <Form.Control/>
            </Form.Group>
        </Form>
    );
    return (
        <div>
            <h1>Game View</h1>
            <h2>Letter: {categoryLetter}</h2>
            {categoryList}
            <Button onClick={onSubmit}>Submit</Button>
        </div>
    )
}
