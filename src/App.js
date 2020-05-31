import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { database, auth } from './firebase';
import HostView from './components/HostView';
import StartView from './components/StartView';
import LobbyView from './components/LobbyView';
import GameView from './components/GameView';
import JoinForm from './components/forms/JoinForm';
import CreateForm from './components/forms/CreateForm';
import ResultView from './components/ResultView';
import AwaitResultsView from './components/AwaitResultsView';
import AdminView from './components/AdminView';

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
      submittedPlayers: [],
      modalShowCreateGame: false,
      modalShowJoinGame: false,
      localCategories: [],
      categoryLetter: null,
    };
  }

  setHostDatabase = () => {
    database.ref(this.state.roomCode)
      .child('host')
      .set(this.state.currentUser);
    this.setState({
      modalShow: true,
    })
  }

  setNumPlayersDatabase = () => {
    database.ref(this.state.roomCode).child('numPlayers').set(this.state.numPlayers);
    console.log("[local] numPlayers = " + this.state.numPlayers);
    if (this.state.numPlayers === 1) {
      console.log("I am host");
      this.setState({
        isHost: true,
      }, this.setHostDatabase);
    } else if (this.state.numPlayers === 0) {
      console.error('We should never get here, host or not-host.')
    }
  }

  componentDidMount() {
    // Sign out by default for now so we can test the 'Anonymous Login' button.
    // TODO: Probably should remove this in production TM.
    auth.signOut();

    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("[local] setting current user id as " + user.uid);
        this.setState({
          currentUser: user.uid,
        });
        if (this.state.roomCode) {
          console.log("[database] set roomCode as " + this.state.roomCode)
          database.ref(this.state.roomCode)
            .child('numPlayers')
            .once('value').then((snapshot) => {
              let players = 0;
              if (!snapshot.exists()) {
                players = 1;
              } else {
                console.error('The host attempted to take a room with players in it already')
              }
              this.setState({
                numPlayers: players,
              }, this.setNumPlayersDatabase);
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
    }, this.login); // OnAuthStateChanged expects a valid this.state.roomCode for host,
                    // so don't login until setState is completed
  }

  createGame = () => {
    this.setState({
      modalShowCreateGame: true,
    })
  }

  joinGame = () => {
    this.setState({
      modalShowJoinGame: true,
    })
  }

  setLobbyView = () => {
    console.log('[local] List of players: ' + this.state.players);
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

  setCategoriesDatabase = () => {
    if (this.state.isHost) {
      console.log("[datbase] setting " + this.state.numCategories + " categories");
      let categories = this.state.categoriesList.map(category => category.name);
      database.ref(this.state.roomCode).child('categories').set(
        categories,
        (err) => {
          // Once we're here, the categories have been uploaded to the database
          // and we're ready to start the game
          this.startGame()
        });
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
    console.log('Category Letter = ' + this.state.categoryLetter);
    // Notify non-host players that the game is starting
    database.ref(this.state.roomCode).child('categoryLetter').set(this.state.categoryLetter);
    database.ref(this.state.roomCode).child('isGameStarted').set(true);
    database.ref(this.state.roomCode).child('players').off();
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
    console.log("[local] setting " + this.state.numCategories + " categories");
    this.setState({
      categoriesList: GenerateRandomCategories(this.state.numCategories)
    },
      this.setCategoriesDatabase
    );
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
    console.log("Waiting for host to start the game");
    database.ref(this.state.roomCode).child('isGameStarted')
      .on('value', (snapshot) => {
        if (snapshot.val() === true) {
          database.ref(this.state.roomCode).child('players').off();
          this.showGameView();
        }
      });
  }

  checkRoomCode = () => {
    database.ref(this.state.roomCode).once('value').then((snapshot) => {
      if (snapshot.exists()) {
        console.log(this.state.roomCode + " is a valid room");

        if (!this.state.isHost) {
          // This is the earliest possible point at which a non-host has
          // a room code to use for checking the number of players
          database.ref(this.state.roomCode)
            .child('numPlayers')
            .once('value').then((snapshot) => {
              let players = 0;
              if (!snapshot.exists()) {
                console.error('Non-host attempted to join a valid room without a host!')
              } else {
                players = snapshot.val() + 1;
              }
              this.setState({
                numPlayers: players,
              }, () => {
                this.setNumPlayersDatabase();
                this.setValidRoom(true);
              });
            })
        }
        else
        {
          this.setValidRoom(true);
        }

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

  submitJoinForm = () => {
    if (!this.state.isHost) {
      this.checkRoomCode();
    } else {
      this.setValidRoom(true);
    }
    this.addPlayer();
  };

  submitCreateForm = () => {
    this.setState({
      modalCreateGameShow: true,
    })

  }

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

  onSubmitAnswers = () => {
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

      if (answer.value.toUpperCase().startsWith(this.state.categoryLetter)) {
        answer.valid = true
      }
      answers.push(answer)
    }

    console.log('[database] setting answers ' + answers.map(ans => ans.value))

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
            console.log("All players have submitted their answers")
          }
        })
    }
    database.ref(this.state.roomCode)
      .child('submittedPlayers')
      .push(this.state.username)
    database.ref(this.state.roomCode)
      .child('submittedPlayers')
      .on('value', snapshot => {
          var submittedPlayers = []
          snapshot.forEach(function(data) {
            submittedPlayers.push(data.val());
          });

          this.setState({
            submittedPlayers: submittedPlayers
          })
      })
  }

  componentWillUnmount = () => {
    // TODO: put leaving logic here
    console.log("Component will unmount");
    auth.signOut();
    database.ref(this.state.roomCode+"/abandoned").set(true);
  }

  onClickAdminView = () => {
    console.log("Obliterating database")
    database.ref().set(null)
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
          <AwaitResultsView players={this.state.submittedPlayers}/>
        }
        {this.state.isResultView
          &&
          <ResultView/>
        }
        <CreateForm
          show={this.state.modalShowCreateGame}
          onHide={() => this.setState({modalShowCreateGame: false})}
          onSubmit={this.submitCreateForm}
          onChange={this.changeHandler}
        />
        <JoinForm
          show={this.state.modalShowJoinGame}
          onHide={() => this.setState({modalShowJoinGame: false})}
          onSubmit={this.submitJoinForm}
          onChange={this.changeHandler}
        />
        <AdminView onClick={this.onClickAdminView} />
      </div>
    );
  }
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

    return chosen_categories;
}

export default App;
