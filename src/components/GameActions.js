import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(3),
      },
    },
}));

function CreateButton({ onCreate }) {
    return (
      <Button variant="contained" onClick={ onCreate }>Create Game</Button>
    )
}

function StartButton(props) {
    return (
      <Button variant="contained" color="secondary" onClick={props.onClick}>
        Start Game!
      </Button>
    );
}
  
function JoinButton({ onJoin }) {
    return (
        <Button variant="contained" onClick={ onJoin }>Join Game</Button>
    )
}

export default function GameActions({ onCreate, onJoin }) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <CreateButton onCreate={onCreate}/>
            <JoinButton onJoin={onJoin}/>
        </div>
    )
}
