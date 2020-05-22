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

const CreateButton = () => (
    <div>
      <Button variant="contained" className="Button-create">Create Game</Button>
    </div>
)
  
const JoinButton = () => (
    <div>
        <Button variant="contained">Join Game</Button>
    </div>
)

export default function GameActions() {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <CreateButton />
            <JoinButton />
        </div>
    )
}
