import React, { Component } from 'react';
import { database, auth } from './firebase';
import Button from '@material-ui/core/Button';
import HostView from './components/HostView';
import StartView from './components/StartView';
import LobbyView from './components/LobbyView';
import JoinView from './components/JoinView';

const STATES = {
    SIGNED_OUT:       'signed_out',
    CHOOSE_ROOM:      'choose_room',
    GAME_LOBBY:       'game_lobby',
    RUN_GAME:         'run_game',
    SHOW_RESULT:      'show_result'
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      categories: [], // List of string names (category names)
      current_state: STATES.SIGNED_OUT,
      roomCode: null,
      numUsers: null,
      isHost: false,
      hideNumCategoriesForm: false,
      isStart: true,
      isLobby: false,
      isJoin: false
    };

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
        const messagesRef = database.ref(user.uid)
          .orderByKey()
          .limitToLast(100);

        messagesRef.on('child_added', snapshot => {
          const message = { text: snapshot.val(), id: snapshot.key };

          this.setState(prevState => ({
            messages: [ message, ...prevState.messages ],
          }));
        });
        this.setState({current_state: STATES.CHOOSE_ROOM})
      } else {
        this.setState({current_state: STATES.SIGNED_OUT})
      }
    })
  }

  onSubmitRoomCode(event) {
    event.preventDefault();

    var uid = auth.currentUser.uid;

    // Add current user to list of players waiting in lobby
    database.ref(this.state.roomCode).child('players').push(uid);
    this.setState({current_state: STATES.GAME_LOBBY})

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
      // Value gives us a list. We're expecting the list to be size 1,
      // but we still must iterating through the list using .forEach()
      // to get the one thing we want.
      snapshot.forEach(childSnapshot => {
          let isGameStarted = childSnapshot.val()
          // TODO: fix "===" warning
          if (isGameStarted == true) {
             this.setState({current_state: STATES.RUN_GAME})
          }
      });
    }, function(err) {
      alert(`isGameStart read failed: ${err.code}`)
    });
  }

  onChangeRoomCode(event) {
    this.setState({roomCode: event.target.value})
  }

  onChangeAnswer(category_id, event) {
    var index = GetIndexForCategoryId(category_id)

    // Preferred way to modify an element in a state array:
    // https://stackoverflow.com/a/42037439/6606953
    const new_categories = this.state.categories // copy the array
    new_categories[index].answer = event.target.value; // manipulate data
    this.setState({categories: new_categories}) // set the new state

    // It's not recommended to print values right after setState because setState
    // may be deferred. But in my experience it's fine and it's been helpful enough.
    for (var i = 0; i < this.state.categories.length; i++) {
        ConsoleLogCategory(this.state.categories[i])
    }
  }

  onClickStartButton(event) {   
    // Notify non-host players that the game is starting
    database.ref(this.state.room_code).child('isGameStarted').push(true);
    // TODO: I think this line can be removed actually becaues we can have
    // the host listening for the start signal uisng isGameStartedRef
    this.setState({current_state: STATES.RUN_GAME})
  }

  onClickAnswerSubmission(event) {
    event.preventDefault();

    for (var i = 0; i < this.state.categories.length; i++) {
      var c = this.state.categories[i];
      const c_str = JSON.stringify(c, undefined, 2);
      console.log(c_str);

      var uid = auth.currentUser.uid;
      database.ref(this.state.room_code).child(uid).push(c_str);
    }
  }

  onChangeNumCategories(event) {
    this.setState({categories: GenerateRandomCategories(event.target.value) })
  }

  onSubmitNumCategories(event) {
    event.preventDefault();

    // Stop the user from changing the number of catergories once the submit
    // button is pressed.
    this.setState({hideNumCategoriesForm: true})
  }
  
  generateRoomCode = (length = 4) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log(result);
    this.setState({
      roomCode: result,
    });
  }

  onCreate = () => {
    this.login();
    this.generateRoomCode();
    this.setState({
      isStart: false,
      isHost: true,
      isLobby: true,
    });
  }

  onJoin = () => {
    if (!auth.currentUser) {
      this.login();
    }
    this.setState({
      isStart: false,
      isHost: false,
      isJoin: true
    });
  }

  render() {
    //// Can't seem to refactor this into a function
    //let AnswerForms =
    //  <div>
    //    {this.state.categories.map((el, index) =>
    //      <form>
    //        <label>{el.name}</label><br></br>
    //        <input type="text" onChange={this.onChangeAnswer.bind(this, el.id)}/>
    //      </form>
    //    )}
    //  </div>

    //let mainDisplay = <StartView onAction={this.login}></StartView>
    //const current_state = this.state.current_state

    //if (current_state === STATES.SIGNED_OUT) {
    //  mainDisplay = <LoginButton onClick={this.login} />;
    //} else if (current_state === STATES.CHOOSE_ROOM){
    //  mainDisplay = <RoomCodeForm 
    //                   onSubmit={this.onSubmitRoomCode}
    //                   onChange={this.onChangeRoomCode} />
    //} else if (current_state === STATES.GAME_LOBBY) {
    //  // There is only one host
    //  if (this.state.isHost) {
    //    if (this.state.hideNumCategoriesForm == true) {
    //      mainDisplay = <pre>
    //                      <StartButton onClick={this.onClickStartButton}/>
    //                      <br></br>Room Code: {this.state.room_code}
    //                      <br></br># of Users: {this.state.numUsers}<br></br>
    //                    </pre>

    //    } else {
    //      mainDisplay = <pre>
    //                      <NumCategoriesForm
    //                        onSubmit={this.onSubmitNumCategories}
    //                        onChange={this.onChangeNumCategories}/>
    //                      <br></br>Room Code: {this.state.room_code}
    //                      <br></br># of Users: {this.state.numUsers}<br></br>
    //                    </pre>
    //    }
    //  // Everyone else non-host
    //  } else {
    //    mainDisplay = <pre>
    //                    Room Code: {this.state.room_code}<br></br>
    //                    # of Users: {this.state.numUsers}
    //                  </pre>
    //  }
    //} else if (this.state.categories !== [] &&
    //           this.state.current_state === STATES.RUN_GAME) {
    //        mainDisplay = <div>{AnswerForms}<SubmitAnswersButton onClick={this.onClickAnswerSubmission} /></div>
    //}

    return (
      <div className="App">
        {this.state.isStart 
          && <StartView onCreate={this.onCreate}
                        onJoin={this.onJoin}/>}
        {this.state.isHost && <HostView code={this.state.roomCode}/>}
        {this.state.isJoin && <JoinView/>}
        {this.state.isLobby && <LobbyView/>}
      </div>
    );
  } 
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

function GenerateCategoryId(index) {
    // Helper function to generate a category ID using the given index.
    // The given index should be an integer, and the category ID is a
    // string with the form 'category-{index}`. For example, `category-13`.

    return `category-${index}`
}

function GetIndexForCategoryId(id) {
    // Helper function to find the appropriate item in the category
    // array using the given category ID. This is a simple implementation
    // and simply just matches for number after the hyphen (-).

    return id.match(/(?:-)(\d+)$/)[1];
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
            id: GenerateCategoryId(i),
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
