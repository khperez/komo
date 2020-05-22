import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';

function generateRoomCode(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result.toUpperCase();
}

function RoomCodeDisplay({ onUpdateRoomCode }) {
  let roomCode = generateRoomCode(4);
  this.props.onUpdateRoomCode(this.state.roomCode);
  this.setState({
      roomCode: roomCode,
  });
  return (
    <div className="Room-code-main">
        <div className="Room-code-host">
            You are the host
        </div>
        <div className="Room-code-content">
            <span className="Room-code-title">Room Code: </span>
            <span className="Room-code-id">{roomCode}</span>
        </div>
    </div>
  );
}

export default function HostView({ onUpdateRoomCode }) {
    return (
        <div>
            <RoomCodeDisplay onUpdateRoomCode={onUpdateRoomCode}/>
        </div>
    );
}