import React from 'react';
import JoinLobbyForm from './forms/JoinLobbyForm';

export default function JoinView({ changeHandler, submitHandler, validRoom }) {
  return (
    <div className="Join-view">
      <JoinLobbyForm
        changeHandler={changeHandler}
        submitHandler={submitHandler}
        validRoom={validRoom}
      />
    </div>
  );
}
