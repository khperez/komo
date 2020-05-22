import React from 'react';
import TextField from '@material-ui/core/TextField';

export default function JoinView() {
    return (
        <div className="Join-view">
            <TextField id="outlined-basic" label="room code" variant="outlined"/>
            <TextField id="outlined-basic" label="username" variant="outlined"/>
        </div>
    );
}
