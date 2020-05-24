import React from 'react';

export default function GameView({categories}) {
    const categoryList = categories.map((category) =>
        <li key={category.id}>{category.name}</li>
    );
    return (
        <div>
            <h1>Game View</h1>
            {categoryList}
        </div>
    )
}