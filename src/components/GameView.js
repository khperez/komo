import React from 'react';
import Form from 'react-bootstrap/Form';

export default function GameView({categories, onChange}) {
    const categoryList = categories.map((category) =>
        <Form.Group>
            <Form.Label>{category.name}</Form.Label>
            <Form.Control/>
        </Form.Group>
    );
    return (
        <div>
            <h1>Game View</h1>
            <Form onChange={onChange}>
                {categoryList}
            </Form>
        </div>
    )
}