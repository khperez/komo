import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';

function RoomCode({ code }) {
    return (
        <div className="Room-code-main">
            <div className="Room-code-host">
                You are the host
            </div>
            <div className="Room-code-content">
                <span className="Room-code-title">Room Code: </span>
                <span className="Room-code-id">{code}</span>
            </div>
        </div>
    );
}

export default function HostView({ code }) {
    return (
        <div>
            <RoomCode code={code}/>
        </div>
    );
}