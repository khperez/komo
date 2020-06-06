import React, { Component } from 'react';
import GameActions from './GameActions';

const Title = () => (
    <div className="App-title">
        Komo
    </div>
);
class MadeBy extends Component {
    render() {
      return (
        <div className="Made-by">
          Made by <a href="https://github.com/thekenu" className="Github-link">kenu</a> & <a href="https://github.com/khperez" className="Github-link">katu</a>
        </div>
      )
    }
  }

export default function StartView({ onCreate, onJoin }) {
    return (
        <div className="Start-view">
            <Title />
            <GameActions onCreate={ onCreate } onJoin={ onJoin }/>
            <MadeBy />
        </div>
    );
}