import React from 'react';

export default function ResultView({ scores }) {

    // Stupid way to check whether scores is empty or not, should be fixed
    // later on!
    const keys = Reflect.ownKeys(scores)
    if (keys.length === 0) {
        return (
            <div>
                <h1>Result View</h1>
            </div>
        )
    } else {
        return (
            <div>
                <h1>Result View</h1>
                { keys.map(key => {
                    return <h2 key={key}>uid: {key} score: {scores[key]}</h2>
                })}
            </div>
        )
    }
}