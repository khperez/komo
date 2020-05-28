import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { database, auth } from './firebase';
import HostView from './components/HostView';
import StartView from './components/StartView';
import LobbyView from './components/LobbyView';
import JoinView from './components/JoinView';
import GameView from './components/GameView';
import JoinForm from './components/forms/JoinForm';
import ResultView from './components/ResultView';
import AwaitResultsView from './components/AwaitResultsView';

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
      isResultViiew: false,
      isAwaitResultsView: false,
      currentUser: null,
      username: null,
      isValidRoom: null,
      numCategories: 0,
      players: [],
      modalShow: false,
      localCategories: [],
      categoryLetter: null,
    };
  }

  setHostDatabase = () => {
    database.ref(this.state.roomCode)
      .child('host')
      .set(this.state.currentUser);
    database.ref(this.state.roomCode)
      .child('players')
      .child(this.state.currentUser)
      .child('name')
      .set(this.state.username);
    this.setState({
      modalShow: true,
    })
  }

  setNumPlayersDatabase = () => {
    database.ref(this.state.roomCode).child('numPlayers').set(this.state.numPlayers);
    console.log("numPlayers: " + this.state.numPlayers);
    if (this.state.numPlayers === 1) {
      console.log("setting host");
      this.setState({
        isHost: true,
      }, this.setHostDatabase);
    } else if (this.state.numPlayers === 0) {
      this.setState({
        modalShow: true,
      })
    }
  }

  componentDidMount() {
    // Sign out by default for now so we can test the 'Anonymous Login' button.
    // TODO: Probably should remove this in production TM.
    auth.signOut();

    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("setting current user");
        this.setState({
          currentUser: user.uid,
        });
        if (this.state.roomCode) {
          console.log("[database] set roomCode")
          database.ref(this.state.roomCode)
            .child('numPlayers')
            .once('value').then((snapshot) => {
              let players = 0;
              if (!snapshot.exists()) {
                players = 1;
              } else {
                players = snapshot.val() + 1;
              }
              this.setState({
                numPlayers: players,
              },this.setNumPlayersDatabase); 
          })
        } else {
          this.setState({
            modalShow: true,
          })
        }
      }
    });
  }



  onChangeAnswer = (categoryId, event) => {
    // Preferred way to modify an element in a state array:
    // https://stackoverflow.com/a/42037439/6606953
    const newCategories = this.state.categoriesList// copy the array
    newCategories[categoryId].answer = event.target.value; // manipulate data
    this.setState({categoriesList: newCategories}) // set the new state
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
    var characters       = 'ABCDEFGHIJKLMNPQRSTUVWXYZ12345679';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
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
    const isGameStartedRef = database.ref(this.state.room_code).child('isGameStarted');
    isGameStartedRef.on('value', snapshot => {
      if (snapshot.val() === true) {
        database.ref(this.state.roomCode).child('players').off();
      }
    }, function(err) {
      alert(`isGameStart read failed: ${err.code}`)
    });
  }

  setCategories = () => {
    if (this.state.isHost) {
      console.log("pushing categories to server");
      let categories = this.state.categoriesList.map(category => category.name);
      database.ref(this.state.roomCode).child('categories').set(categories);
    }
  }

  generateCategoryLetter = () => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';
    result = characters.charAt(Math.floor(Math.random() * characters.length));
    this.setState({
      categoryLetter: result,
    }, this.sendStartSignal);
  }

  sendStartSignal = () => {
    console.log(this.state.categoryLetter);
    // Notify non-host players that the game is starting
    database.ref(this.state.roomCode).child('categoryLetter').set(this.state.categoryLetter);
    database.ref(this.state.roomCode).child('isGameStarted').set(true);
    database.ref(this.state.roomCode).child('players').off();
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

  startGame = () => {
    console.log("Game START");
    this.generateCategoryLetter();
    this.setState({
      players: []
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
    if (value === true) {
      this.setModalShow(false);
      if (this.state.isHost) {
        this.setState({
          isStartView: false,
          isLobbyView: true,
          isHostView: true,
        });
      } else {
        this.setState({
          isStartView: false,
          isLobbyView: true,
          isHostView: false,
        }, this.waitForGameStart);
      }
      this.updateLobbyPlayers();
    }
    this.setState({
      isValidRoom: value,
    })
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
 
  showGameView = () => {
    database.ref(this.state.roomCode)
      .child('categoryLetter')
      .once('value').then((snapshot) => {
        if (snapshot.val() !== null) {
          this.setState({
            categoryLetter: snapshot.val()
          })
        }
      })
    database.ref(this.state.roomCode).child('categories')
      .on('value', snapshot => {
        if (snapshot.exists()) {
          let categories = []
          for (var i = 0; i < snapshot.val().length; i++) {
            categories.push({
              id: i,
              name: snapshot.val()[i],
              answer: ""
            })
          }
          this.setState({categoriesList: categories})
        }
      }, function(err) {
        alert(`isGameStart read failed: ${err.code}`)
      });
    this.setState({
      isGameView: true,
      isLobbyView: false,
    });
  }

  waitForGameStart = () => {
    this.setNumPlayersDatabase();
    console.log("wait for game start");
    database.ref(this.state.roomCode).child('isGameStarted')
      .on('value', (snapshot) => {
        if (snapshot.val() === true) {
          this.showGameView();
        }
      });
  }

  checkRoomCode = () => {
    console.log("isvalidroomdatabase")
    database.ref(this.state.roomCode).once('value').then((snapshot) => {
      if (snapshot.exists()) {
        console.log("this is a valid room");
        this.setValidRoom(true);
      } else {
        alert("This is not a valid room. Please try again");
        this.setValidRoom(false);
      }
    });
  }

  addPlayer = () => {
    var uid = auth.currentUser.uid;
    database.ref(this.state.roomCode).child('players').child(uid).child('name').set(this.state.username);
  }

  submitCredentials = () => {
    this.checkRoomCode();
  };

  incrementSubmittedCounter = () => {
    var submittedCounterRef = database.ref(this.state.roomCode+"/submittedCounter");
    submittedCounterRef.transaction(function(counter) {
      // If users/ada/rank has never been set, currentRank will be `null`.
      return counter + 1;
    });
  }

  calculateResults = () => {
    console.log("host is calculating results");
  }

  showVotingView = () => {
    console.log("show voting view");
  }

  runPreVotingValidation = () => {
    var playerRef = database.ref(this.state.roomCode)
    .child('players')

  }

  onSubmitAnswers = () => {
    this.addPlayer();
    this.setState({
      isGameView: false,
      isAwaitResultsView: true,
    })
    this.setState({
      isAwaitResultsView: true,
      isGameView: false,
      isLobbyView: false,
    });
    // Push the user-provided answers to the database
    let answers = []
    for (var i = 0; i < this.state.categoriesList.length; i++) {
      let answer = {
        value: this.state.categoriesList[i].answer,
        valid: false
      }
      answers.push(answer)
    }
    //this.runPreVotingValidation();
    console.log(answers);
    let uid = auth.currentUser.uid;
    database.ref(this.state.roomCode)
      .child('players')
      .child(uid)
      .child('answers')
      .set(answers);
    this.incrementSubmittedCounter();
    if (this.state.isHost) {
      database.ref(this.state.roomCode)
        .child("submittedCounter")
        .on('value', (snapshot) => {
          if (snapshot.val() === this.state.numPlayers) {
            console.log("all players submitted")
          }
        })
    }
  }

  componentWillUnmount = () => {
    // TODO: put leaving logic here
    console.log("Component will unmount");
    auth.signOut();
    database.ref(this.state.roomCode+"/abandoned").set(true);
  }

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
            categoryLetter={this.state.categoryLetter}
            onChange={this.onChangeAnswer}
            onSubmit={this.onSubmitAnswers}
          />
        }
        {this.state.isAwaitResultsView
          &&
          <AwaitResultsView players={this.state.players}/>
        }
        {this.state.isResultView
          && 
          <ResultView/>
        }
        <JoinForm
          show={this.state.modalShow}
          onHide={() => this.setState({modalShow: false})}
          onSubmit={this.submitCredentials}
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
