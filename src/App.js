import React, { Component } from 'react';
import { database, auth } from './firebase';
import Button from '@material-ui/core/Button';

const STATES = {
    SIGNED_OUT:  'signed_out',
    CHOOSE_NAME: 'choose_name',
    CHOOSE_ROOM: 'choose_room',
    GAME_LOBBY:  'game_lobby',
    RUN_GAME:    'run_game',
    SHOW_RESULT: 'show_result'
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      local_categories: [],
      current_state: STATES.SIGNED_OUT,
      room_code: null,
      numUsers: null,
      isHost: false,
      hideNumCategoriesForm: false,
      user_name: ''
    };

    this.onSubmitUserName = this.onSubmitUserName.bind(this);
    this.onChangeUserName = this.onChangeUserName.bind(this);
    this.onSubmitRoomCode = this.onSubmitRoomCode.bind(this);
    this.onChangeRoomCode = this.onChangeRoomCode.bind(this);
    this.onClickAnswerSubmission = this.onClickAnswerSubmission.bind(this);
    this.onChangeNumCategories = this.onChangeNumCategories.bind(this);
    this.onSubmitNumCategories = this.onSubmitNumCategories.bind(this);
    this.onChangeAnswer = this.onChangeAnswer.bind(this);
    this.onClickStartButton = this.onClickStartButton.bind(this);
    this.login = () => { auth.signInAnonymously() };
  }

  componentDidMount() {
    // Sign out by default for now so we can test the 'Anonymous Login' button.
    // TODO: Probably should remove this in production TM.
    auth.signOut();

    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({current_state: STATES.CHOOSE_NAME})
      } else {
        this.setState({current_state: STATES.SIGNED_OUT})
      }
    })
  }

  onChangeUserName(event) {
    this.setState({user_name: event.target.value})
  }

  onSubmitUserName(event) {
    event.preventDefault();
    this.setState({current_state: STATES.CHOOSE_ROOM})
  }

  onSubmitRoomCode(event) {
    event.preventDefault();

    var uid = auth.currentUser.uid;

    // Write user name to database (We couldn't do this earlier because we did not
    // have a room code yet)
    var name = this.state.user_name
    database.ref(this.state.room_code).child('players').child(uid).child('name').set(name);

    // Decide if we're a host or not
    const hostRef = database.ref(this.state.room_code).child('host')
    hostRef.once('value', snapshot => {
      if (!snapshot.exists()) {
        database.ref(this.state.room_code).child('host').set(uid);
        this.setState({isHost: true})
      } else {
        const categoriesRef = database.ref(this.state.room_code).child('local_categories')
        categoriesRef.on('value', snapshot => {
          if (snapshot.exists()) {
            let categories = []
            for (var i = 0; i < snapshot.val().length; i++) {
              categories.push({
                id: i,
                name: snapshot.val()[i],
                answer: ""
              })
            }
            this.setState({local_categories: categories})
          }
        }, function(err) {
          alert(`isGameStart read failed: ${err.code}`)
        });
      }
    }, function(err) {
      alert(`host read failed: ${err.code}`)
    });

    // Listen for players in the same room as us
    const playersRef = database.ref(this.state.room_code).child('players')
      .orderByKey()
      .limitToLast(100);
    playersRef.on('value', snapshot => {
      this.setState({ numUsers: snapshot.numChildren() })
    }, function(err) {
      alert(`players read failed: ${err.code}`)
    });

    // Listen for signal to start the game
    const isGameStartedRef = database.ref(this.state.room_code).child('isGameStarted')
    isGameStartedRef.on('value', snapshot => {
      if (snapshot.val() === true) {
         this.setState({current_state: STATES.RUN_GAME})
      }
    }, function(err) {
      alert(`isGameStart read failed: ${err.code}`)
    });

    // Time to wait in lobby
    this.setState({current_state: STATES.GAME_LOBBY})
  }

  onChangeRoomCode(event) {
    this.setState({room_code: event.target.value})
  }

  onChangeAnswer(category_id, event) {
    // Preferred way to modify an element in a state array:
    // https://stackoverflow.com/a/42037439/6606953
    const new_categories = this.state.local_categories // copy the array
    new_categories[category_id].answer = event.target.value; // manipulate data
    this.setState({loca_categories: new_categories}) // set the new state
  }

  onClickStartButton(event) {
    // Notify non-host players that the game is starting
    database.ref(this.state.room_code).child('isGameStarted').set(true);
  }

  onClickAnswerSubmission(event) {
    event.preventDefault();

    // Push the user-provided answers to the database
    let answers = []
    for (var i = 0; i < this.state.local_categories.length; i++) {
      answers.push(this.state.local_categories[i].answer)
    }
    let uid = auth.currentUser.uid;
    database.ref(this.state.room_code).child('players').child(uid).child('answers').set(answers);
  }

  onChangeNumCategories(event) {
    this.setState({local_categories: GenerateRandomCategories(event.target.value) })
  }

  onSubmitNumCategories(event) {
    event.preventDefault();

    // Stop the user from changing the number of catergories once the submit
    // button is pressed.
    this.setState({hideNumCategoriesForm: true})

    // Share the category list with other players in the same room
    // (Need to sanitize it first by removing answer and id field)
    let categories = [];
    for (var i = 0; i < this.state.local_categories.length; i++) {
      categories.push(this.state.local_categories[i].name)
    }
    database.ref(this.state.room_code).child('local_categories').set(categories);
  }

  render() {
    // Can't seem to refactor this into a function
    let AnswerForms =
      <div>
        {this.state.local_categories.map((el, index) =>
          <form>
            <label>{el.name}</label><br></br>
            <input type="text" onChange={this.onChangeAnswer.bind(this, el.id)}/>
          </form>
        )}
      </div>

    let mainDisplay;
    const current_state = this.state.current_state

    if (current_state === STATES.SIGNED_OUT) {
      mainDisplay = <LoginButton
                      onClick={this.login} />;
    } else if (current_state === STATES.CHOOSE_NAME) {
      mainDisplay = <UserNameForm
                       onSubmit={this.onSubmitUserName}
                       onChange={this.onChangeUserName} />

    } else if (current_state === STATES.CHOOSE_ROOM) {
      mainDisplay = <RoomCodeForm
                       onSubmit={this.onSubmitRoomCode}
                       onChange={this.onChangeRoomCode} />
    } else if (current_state === STATES.GAME_LOBBY) {
      // There is only one host
      if (this.state.isHost) {
        if (this.state.hideNumCategoriesForm === true) {
          mainDisplay = <pre>
                          <StartButton onClick={this.onClickStartButton}/>
                          <br></br>Room Code: {this.state.room_code}
                          <br></br># of Users: {this.state.numUsers}<br></br>
                        </pre>

        } else {
          mainDisplay = <pre>
                          <NumCategoriesForm
                            onSubmit={this.onSubmitNumCategories}
                            onChange={this.onChangeNumCategories}/>
                          <br></br>Room Code: {this.state.room_code}
                          <br></br># of Users: {this.state.numUsers}<br></br>
                        </pre>
        }
      // Everyone else non-host
      } else {
        mainDisplay = <pre>
                        Room Code: {this.state.room_code}<br></br>
                        # of Users: {this.state.numUsers}
                      </pre>
      }
    } else if (this.state.local_categories !== [] &&
               this.state.current_state === STATES.RUN_GAME) {
            mainDisplay = <div>
                            {AnswerForms}
                            <SubmitAnswersButton
                              onClick={this.onClickAnswerSubmission}/>
                          </div>
    }

    return (
      <div>
        {mainDisplay}
      </div>
    ); }
}

function LoginButton(props) {
    return (
      <Button variant="contained" color="primary" onClick={props.onClick}>
        Anonymous Login
      </Button>
    );
}

function UserNameForm(props) {
    return (
        <form onSubmit={props.onSubmit}>
          <label>
            Enter name:
            <input type="text" onChange={props.onChange}/>
          </label>
          <input type="submit" value="Submit"/>
        </form>
    );
}

function RoomCodeForm(props) {
    return (
        <form onSubmit={props.onSubmit}>
          <label>
            Enter room code:
            <input type="text" onChange={props.onChange}/>
          </label>
          <input type="submit" value="Submit"/>
        </form>
    );
}

function StartButton(props) {
    return (
      <Button variant="contained" color="secondary" onClick={props.onClick}>
        Start Game!
      </Button>
    );
}

function NumCategoriesForm(props) {
    return (
        <form onSubmit={props.onSubmit}>
          <label>
            Number of Categories:
            <input type="text" onChange={props.onChange}/>
          </label>
          <input type="submit" value="Submit"/>
        </form>
    );
}

function ConsoleLogCategory(c) {
    // Pretty-print function for category
    console.log(JSON.stringify(c, undefined, 2))
}

function GenerateRandomCategories(size) {
    // Choose {size} categories from the following premade list
    const possible_categories = [
      "A boy’s name",
      "A river",
      "An animal",
      "Things that are cold",
      "Insects",
      "TV Shows",
      "Things that grow",
      "Fruits",
      "Things that are black",
      "School subjects",
      "Movie titles",
      "Musical Instruments",
    ]

    let chosen_categories = []
    for (var i = 0; i < size; i++) {
        // Choose a random category
        var random_index = Math.floor(Math.random() * possible_categories.length)
        chosen_categories.push({
            id: i,
            name: possible_categories[random_index],
            answer: ""
        })
        // Remove the chosen category from the list so we don't get duplicates
        possible_categories.splice(random_index, 1)
    }

    for (var j = 0; j < chosen_categories.length; j++) {
      const c = chosen_categories[j];
      ConsoleLogCategory(c);
    }

    return chosen_categories;
}

function SubmitAnswersButton(props) {
    return (
      <Button variant="contained" color="primary" onClick={props.onClick}>
        Submit Answers
      </Button>
    );
}

export default App;
