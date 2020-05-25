import React from 'react';
import Form from 'react-bootstrap/Form';

export default function GameView({categories, onChange}) {
    const categoryList = categories.map((category) =>
        //<Form onChange={onChange.bind(category.id)}>
        <Form onChange={onChange.bind(this, category.id)}>
            <Form.Group>
                <Form.Label>{category.name}</Form.Label>
                <Form.Control/>
            </Form.Group>
        </Form>
    );
    return (
        <div>
            <h1>Game View</h1>
            {categoryList}
        </div>
    )
}
