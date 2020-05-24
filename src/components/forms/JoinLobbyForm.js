import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class JoinLobbyForm extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { changeHandler, submitHandler, validRoom } = this.props;
    return (
      <form onSubmit={submitHandler} autoComplete="off">
        {/* {validRoom ? 
        <TextField
          error
          id="outlined-error-helper-text"
          label="Error"
          helperText="Invalid room"
          variant="outlined"
          name="roomCode"/> :
        <TextField onChange={changeHandler} 
          id="outlined-basic"
          label="room code"
          variant="outlined"
          name="roomCode"/>
        } */}
        <TextField onChange={changeHandler} 
          id="outlined-basic"
          label="room code"
          variant="outlined"
          name="roomCode"
        />
        <TextField onChange={changeHandler} 
          id="outlined-basic"
          label="username"
          variant="outlined"
          name="username"/> 
        <Button type="submit" label="login" variant="contained">Join Game</Button>
      </form>
    );
  }
}

export default JoinLobbyForm;