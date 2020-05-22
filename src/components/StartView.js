import React from 'react';
import GameActions from './GameActions';

const Title = () => (
    <div className="App-title">
        Komo
    </div>
);

export default function StartView({ onCreate, onJoin }) {
    return (
        <div>
            <Title />
            <GameActions onCreate={ onCreate } onJoin={ onJoin }/>
        </div>
    );
}