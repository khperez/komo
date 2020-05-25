import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { database, auth } from './firebase';
import HostView from './components/HostView';
import StartView from './components/StartView';
import LobbyView from './components/LobbyView';
import JoinView from './components/JoinView';
import GameView from './components/GameView';
import AdminView from './components/AdminView';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import JoinForm from './components/forms/JoinForm';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categoriesList: [],
      roomCode: null,
      numPlayers: 0,
      isHost: false,
      isHostView: false,
      isStartView: true,
      isLobbyView: false,
      isJoinView: false,
      isGameView: false,
      currentUser: null,
      username: null,
      isValidRoom: null,
      numCategories: 0,
      players: [],
      modalShow: false,
    };
  }

  componentDidMount() {
    // Sign out by default for now so we can test the 'Anonymous Login' button.
    // TODO: Probably should remove this in production TM.
    auth.signOut();

    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("setting current user");
        var numPlayers = this.state.numPlayers + 1
        this.setState({
          currentUser: user.uid,
          numPlayers: numPlayers,
        });
        if (this.state.roomCode) {
          console.log("[database] set roomCode")
          database.ref(this.state.roomCode)
            .child('numPlayers')
            .set(numPlayers);
          if (numPlayers === 1) {
            console.log("setting host");
            this.setState({
              isHost: true,
              modalShow: true,
            });
            database.ref(this.state.roomCode)
              .child('host')
              .set(user.uid);
            database.ref(this.state.roomCode)
              .child('players')
              .child(user.uid)
              .child('name')
              .set(this.state.username);
          } 
        } else {
          this.setState({
            modalShow: true,
          })
        }
      }
    });
  }

  addPlayer = () => {
    var uid = auth.currentUser.uid;
    database.ref(this.state.roomCode).child('players').child(uid).child('name').set(this.state.username);
  }

  onChangeAnswer = (category_id, event) => {
    // Preferred way to modify an element in a state array:
    // https://stackoverflow.com/a/42037439/6606953
    const new_categories = this.state.local_categories // copy the array
    new_categories[category_id].answer = event.target.value; // manipulate data
    this.setState({loca_categories: new_categories}) // set the new state
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

  login = () => {
    auth.signInAnonymously();
  }
  
  generateRoomCode = (length = 4) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456790';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log(result);
    result = "XXXX";
    this.setState({
      roomCode: result,
    });
  }

  createGame = () => {
    this.login();
    this.generateRoomCode();
    this.setState({
      //isStartView: false,
      //isLobbyView: true,
      //isHostView: true,
      // modalShow: true,
    });
  }

  joinGame = () => {
    this.login();
  }

  setLobbyView = () => {
    console.log(this.state.players);
    this.setState({
      isLobbyView: true,
    });
  }

  updateLobbyPlayers = () => {
    const playersRef = database.ref(this.state.roomCode).child('players');
    playersRef.on('value', snapshot => {
      const playerList = [];
      snapshot.forEach(function(data) {
        playerList.push(data.val().name);
      });
      this.setState({
        players: playerList
      }, this.setLobbyView);
    }, function(err) {
      alert(`players read failed: ${err.code}`)
    });
  }

  joinLobby = () => {
    console.log("Join Lobby");
    this.addPlayer();
    this.updateLobbyPlayers();
  }

  setCategories = () => {
    if (this.state.isHost) {
      console.log("pushing categories to server");
      let categories = this.state.categoriesList.map(category => category.name);
      database.ref(this.state.roomCode).child('categories').set(categories);
    }
  }

  startGame = () => {
    console.log("Game START");
    // Notify non-host players that the game is starting
    database.ref(this.state.roomCode).child('isGameStarted').set(true);
    // TODO: I think this line can be removed actually becaues we can have
    // the host listening for the start signal uisng isGameStartedRef
    console.log("Number of categories: " + this.state.numCategories);
    this.setState({
      isGameView: true,
      isHostView: false,
      isJoinView: false,
      isLobbyView: false
    })
  }

  changeHandler = (event) => {
    let name = event.target.name;
    let val = event.target.value;
    if (name === "roomCode") {
      val = val.toUpperCase();
    }
    this.setState({
      [name]: val
    });
  }

  setValidRoom = (value) => {
    this.setState({
      isValidRoom: value,
    })
    if (this.state.isValidRoom === true) {
      this.setState({
        isJoinView: false,
        isLobbyView: true,
      });
    }
  }

  submitHandler = (event) => {
    event.preventDefault();
    console.log("submitHandler called");
    database.ref(this.state.roomCode).once('value').then((snapshot) => {
      if (snapshot.val() !== null) {
        console.log("this is a valid room");
        this.setValidRoom(true);
      } else {
        alert("This is not a valid room. Please try again");
        this.setValidRoom(false);
      }
    });
    this.joinLobby();
  }

  submitHostFormHandler = (event) => {
    event.preventDefault();
    console.log("setting categories locally");
    this.setState({
      categoriesList: GenerateRandomCategories(this.state.numCategories)
    },
      this.setCategories
    );
    this.startGame();
  }

  setModalShow = (value) => {
    this.setState({
      modalShow: value,
    });
  }

  submitHostName = () => {
    this.setModalShow(false);
    this.addPlayer();
    console.log("submitting host username: " + this.state.username);
    this.setState({
      isStartView: false,
      isLobbyView: true,
      isHostView: true,
    });
    this.updateLobbyPlayers();
  };

  render() {
    return (
      <div className="App">
        {this.state.isStartView 
          && 
          <StartView
            onCreate={this.createGame}
            onJoin={this.joinGame}
          />
        }
        {this.state.isJoinView
          && 
          <JoinView 
            changeHandler={this.changeHandler}
            submitHandler={this.submitHandler}
            validRoom={this.state.validRoom}
          />
         }
        {this.state.isHostView
          &&
          <HostView code={this.state.roomCode}
            onClick={this.startGame}
            changeHandler={this.changeHandler}
            submitHandler={this.submitHostFormHandler}
          />
        }
        {this.state.isLobbyView
          && 
          <LobbyView 
            players={this.state.players}
            roomCode={this.state.roomCode}
          />
        }
        {this.state.isGameView
          && 
          <GameView
            categories={this.state.categoriesList}
            onChange={this.onChangeAnswer}
          />
        }
        <JoinForm
          show={this.state.modalShow}
          onHide={() => this.setState({modalShow: false})}
          onSubmit={this.submitHostName}
          onChange={this.changeHandler}
          host={this.state.isHost.toString()}
        />
      </div>
    );
  } 
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

export default App;
