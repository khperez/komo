import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { database, auth } from './firebase';
import HostLobbyView from './components/HostLobbyView';
import StartView from './components/StartView';
import NonHostLobbyView from './components/NonHostLobbyView';
import GameView from './components/GameView';
import JoinForm from './components/forms/JoinForm';
import CreateForm from './components/forms/CreateForm';
import ResultView from './components/ResultView';
import AwaitResultsView from './components/AwaitResultsView';
import VotingView from './components/VotingView';
//import AdminView from './components/AdminView';
import Timer from './components/Timer';
import WinnerPrize from './components/WinnerPrize';
import Button from 'react-bootstrap/Button';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categoriesList: [],
      roomCode: null,
      numPlayers: 0,
      isHost: false,
      isHostLobbyView: false,
      isStartView: true,
      isNonHostLobbyView: false,
      isJoinView: false,
      isGameView: false,
      isResultView: false,
      isAwaitResultsView: false,
      isVotingView: false,
      currentUser: null,
      username: null,
      isValidRoom: null,
      numCategories: 0,
      players: [],
      isAnswerSubmitted: false,
      submittedPlayers: [],
      modalShowCreateGame: false,
      modalShowJoinGame: false,
      localCategories: [],
      categoryLetter: null,
      timeRemaining: null,
      timerShow: false,
      isGameOver: false,
      scores: {},
      showWinnerModal: false,
    };
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

  onChangeVoteCheckbox = (categoryId, uid, event) => {
    // Preferred way to invert a boolean inside an object inside an array:
    // https://stackoverflow.com/a/49502115
    let voteResults = [...this.state.voteResults]
    let item = {...voteResults[categoryId]}
    item[uid] = !item[uid]
    voteResults[categoryId] = item

    this.setState({
      voteResults
    })
  }

  generateRoomCode = async (length = 4) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNPQRSTUVWXYZ12345679';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    this.setState({
      roomCode: result,
    }, () => {
      this.setValidRoom(true)
    }); // OnAuthStateChanged expects a valid this.state.roomCode for host,
    // so don't login until setState is completed
    return result
  }

  checkRoomCode = async () => {
    if (this.state.roomCode !== null) {
      return database.ref(this.state.roomCode).once('value').then((snapshot) => {
        if (snapshot.exists()) {
          console.log(this.state.roomCode + " is a valid room");
          this.updateNumPlayersDbAndLocal();
          this.setValidRoom(true);
          return true
        } else {
          alert("This is not a valid room. Please try again");
          this.setValidRoom(false);
          return false
        }
      });
    }
    return false;
  }

  setHostDb = () => {
    database.ref(this.state.roomCode+"/host")
    .set(this.state.currentUser)
  }

  login = async () => {
    console.log("Logging in")
    return (await auth.signInAnonymously()).user.uid
  }

  createUser = (uid) => {
    database.ref(this.state.roomCode).child('players').child(uid).child('name').set(this.state.username);
    return uid
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

  updateNumPlayersDbAndLocal = () => {
    const numPlayersRef = database.ref(this.state.roomCode+"/numPlayers")
    numPlayersRef.transaction((count) => {
      let total = count + 1
      this.setState({
        numPlayers: total
      })
      return total
    })
  }

  setHostLocal = () => {
    this.setState({
      isHost: true,
    })
  }

  listenNumPlayersDb = () => {
    database.ref(this.state.roomCode+"/numPlayers").on('value', (snapshot) => {
      this.setState({
        numPlayers: snapshot.val()
      })
    })
  }

  submitCreateForm = (e) => {
    e.preventDefault();
    this.generateRoomCode()
    .then(this.login()
    .then(this.createUser)
    .then(this.updateNumPlayersDbAndLocal)
    .then(this.listenNumPlayersDb)
    .then(this.setHostDb)
    .then(this.setHostLocal))
    this.setState({
      isStartView: false,
      modalShowCreateGame: false,
      isNonHostLobbyView: true,
      isHostLobbyView: true,
      isHost: true,
    })
  }

  submitJoinForm = (e) => {
    e.preventDefault();
    this.checkRoomCode()
    .then((isValidRoom) => {
      if (isValidRoom === true) {
        this.login()
        .then(this.createUser)
        .then(() => {
          this.setState({
          isStartView: false,
          modalShowJoinGame: false,
          isNonHostLobbyView: true,
          })
        })
      }
    })
  }

  setNonHostLobbyView = () => {
    console.log('[local] List of players: ' + this.state.players);
    this.setState({
      isNonHostLobbyView: true,
    });
  }

  updateLobbyPlayers = () => {
    console.log("updateLobbyPlayers")
    const playersRef = database.ref(this.state.roomCode).child('players');
    playersRef.on('value', snapshot => {
      if (snapshot.exists()) {
        const playerList = [];
        snapshot.forEach(function(data) {
          playerList.push(data.val().name);
        });
        this.setState({
          players: playerList
        }, this.setNonHostLobbyView);
      }
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
      var characters       = 'ABCDEFGHIJKLMNPRSTW';
      result = characters.charAt(Math.floor(Math.random() * characters.length));
      this.setState({
        categoryLetter: result,
      }, this.sendStartSignal);
    }

    tick = () => {
      var timeRemaining = this.state.timeRemaining
      if (timeRemaining === 0) {
        this.setState({
          timerShow: false,
          isGameView: false,
          isAwaitResultsView: false,
        })
        if (!this.state.isAnswerSubmitted) {
          this.onSubmitAnswers();
        }
        clearInterval(this.state.countdownHandler);
      }
      this.setState({
        timeRemaining: timeRemaining - 1
      })
    }
    sendStartSignal = () => {
      console.log('Category Letter = ' + this.state.categoryLetter);
      // Notify non-host players that the game is starting
      database.ref(this.state.roomCode).child('categoryLetter').set(this.state.categoryLetter);
      database.ref(this.state.roomCode).child('isGameStarted').set(true);
      database.ref(this.state.roomCode).child('players').off();
      database.ref(this.state.roomCode).child('timerValue').set(this.state.timeRemaining);
      database.ref(this.state.roomCode)
      .child("submittedCounter")
      .on('value', (snapshot) => {
        if (snapshot.val() === this.state.numPlayers) {
          console.log("All players have submitted their answers")
          this.getAnswersFromAllPlayers()
          database.ref(this.state.roomCode).child('isGameOver').set(true)
          clearInterval(this.state.countdownHandler)
          this.setState({
            isAwaitResultsView: false,
            timerShow: false,
          })
        }
      })
      var countdownHandler = setInterval(this.tick, 1000)
      this.setState({
        isGameView: true,
        isHostLobbyView: false,
        isJoinView: false,
        isNonHostLobbyView: false,
        timerShow: true,
        countdownHandler: countdownHandler,
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
      if (name === "timeRemaining") {
        val = parseInt(val, 10);
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
            isNonHostLobbyView: true,
            isHostLobbyView: true,
          });
        } else {
          this.setState({
            isStartView: false,
            isNonHostLobbyView: true,
            isHostLobbyView: false,
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
        isNonHostLobbyView: false,
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
      database.ref(this.state.roomCode).child('timerValue')
      .on('value', (snapshot) => {
        if (snapshot.val()) {
          console.log("timeRemaining: " + snapshot.val())

          var countdownHandler = setInterval(this.tick, 1000)

          this.setState({
            timeRemaining: snapshot.val(),
            timerShow: true,
            countdownHandler: countdownHandler
          })
        }
      })
      database.ref(this.state.roomCode).child('isGameOver')
      .on('value', (snapshot) => {
        if (snapshot.val() === true) {
          clearInterval(this.state.countdownHandler)
          this.setState({
            isAwaitResultsView: false,
            timerShow: false,
            isGameOver: snapshot.val(),
          })
        }
      })
    }

    incrementSubmittedCounter = () => {
      var submittedCounterRef = database.ref(this.state.roomCode+"/submittedCounter");
      submittedCounterRef.transaction(function(counter) {
        return counter + 1;
      });
    }

    incrementNumPlayersVoted = () => {
      var numPlayersVotedRef = database.ref(this.state.roomCode+"/numPlayersVoted");
      numPlayersVotedRef.transaction(function(counter) {
        return counter + 1;
      });
    }

    setAnswersDb = async () => {
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
      .set(answers)
      .then(() => {return true});
    }

    setVotesDb = async () => {
      // Push the user-provided votes to the database
      const votes = this.state.voteResults
      console.log('[database] setting votes')
      console.log(votes)
      let uid = auth.currentUser.uid;
      database.ref(this.state.roomCode)
      .child('players')
      .child(uid)
      .child('votes')
      .set(votes)
      .then(() => {return true});
    }

    markDuplicatesAsInvalid(allAnswers, categories) {
      // Duplicate answers will have their .valid set to false
      let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index)
      for (let i = 0; i < categories.length; i++) {
        let category = categories[i];
        let onlyAnswers = [];
        let allAnswersForOneCategory = allAnswers[category.id]
        Object.keys(allAnswersForOneCategory).map(uid => {
          onlyAnswers.push(allAnswersForOneCategory[uid].value.toLowerCase())
          return true
        })
        onlyAnswers = [...new Set(findDuplicates(onlyAnswers))]
        if (onlyAnswers.length !== 0 || onlyAnswers !== undefined) {
          Object.keys(allAnswersForOneCategory).map(uid => {
            if (onlyAnswers.includes(allAnswersForOneCategory[uid].value.toLowerCase())) {
              allAnswers[category.id][uid].valid = false
            }
            return true
          })
        }
      }

      return allAnswers
    }

    onSubmitAnswers = (event) => {
      if (event) {
        event.preventDefault();
      }
      console.log("onSubmitAnswers")
      this.setState({
        isAwaitResultsView: true,
        isGameView: false,
        isNonHostLobbyView: false,
        isAnswerSubmitted: true,
      });
      this.setAnswersDb().then(this.incrementSubmittedCounter())
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

      database.ref(this.state.roomCode)
      .child('allAnswers')
      .on('value', snapshot => {
        if (snapshot.exists()) {
          this.setState({
            allAnswers: this.markDuplicatesAsInvalid(snapshot.val(), this.state.categoriesList)
          }, () => {
            this.setState({
              voteResults: this.getVoteResults(this.state.allAnswers)
            }, () => {
              this.setState({ isVotingView: true })
            })
          })

          database.ref(this.state.roomCode)
          .child('allAnswers')
          .off()
        }
      })
    }

    calculateScores = (allVotes) => {
      let are_scores_initialized = false
      let scores = {}

        for (var i = 0; i < allVotes.length; i++) {
          var question = allVotes[i]

          const uids = Reflect.ownKeys(question) // [ uid_0, uid_1, ..]

          if (!are_scores_initialized) {
            for (var k = 0; k < uids.length; k++){
              const uid = uids[k]
              scores[uid] = 0
            }

            are_scores_initialized = true
          }

          for (var j = 0; j < uids.length; j++) {
            const uid = uids[j]
            const votes = question[uid]

            var vote_count = 0

            for (var key in votes) {
              const vote = votes[key]

              if (vote === true) {
                vote_count = vote_count + 1
              } else if (vote === false) {
                vote_count = vote_count - 1
              } else {
                console.warn('Unexpected vote value. Must be true or false.')
              }
            }

            // If there are more YES vote than NO vote, add 1 point
            if (vote_count > 0) {
              scores[uid] = scores[uid] + 1
            }
          }
        }


      return scores
    }

    onSubmitVotes = () => {
      this.setState({
        isResultView: true,
        isVotingView: false
      })
      this.setVotesDb().then(this.incrementNumPlayersVoted())

      // The hosts calculates the scores and uploads them
      if (this.state.isHost) {
        var numPlayersVotedRef = database.ref(this.state.roomCode+"/numPlayersVoted");
        numPlayersVotedRef.on('value', (snapshot) => {

          if (snapshot.val() === this.state.numPlayers) {

            console.log("All players have submitted their votes")

            this.getVotesFromAllPlayers().then(() => {
              // FIXME allVotes is shaky for now, print it out!
              console.log(this.state.allVotes)
              const scores = this.calculateScores(this.state.allVotes)

              database.ref(this.state.roomCode)
              .child('players')
              .on('value', snapshot => {
                if (snapshot.exists()) {

                  // key: uid, value: name
                  var uidToName = {}

                  snapshot.forEach(childSnapshot => {
                    uidToName[childSnapshot.key] = childSnapshot.val().name
                  })
                }

                let newScores = {}
                const uids = Reflect.ownKeys(scores)
                for (let i = 0; i < uids.length; i++) {
                  let uid = uids[i]
                  newScores[uidToName[uid]] = scores[uid]
                }

                database.ref(this.state.roomCode)
                .child('scores')
                .set(newScores)
              })
            })
          }
        })
      }

      // Everyone listens for the scores from Firebase (incl. host)
      database.ref(this.state.roomCode)
      .child('scores')
      .on('value', snapshot => {
        if(snapshot.exists()) {
          const scores = snapshot.val()
          this.setState({ scores })

          // Don't need to listen for the scores from Firebase anymore
          // after after we get the first valid query
          database.ref(this.state.roomCode).child('score').off()
        }
      })
    }

    getVoteResults = (allAnswers) => {
      var voteResults = Array(allAnswers.length)
      for (var k = 0; k < allAnswers.length; k++) {
        voteResults[k] = {}
      }

      // Use any item in allAnswers array to retrive
      // all the user-ids. The index 0 here is arbitrary.
      var uids = []
      var item = allAnswers[0]
      var uid = null
      for (uid in item) {
        uids.push(uid)
      }

      for (var i = 0; i < voteResults.length; i++) {
        for (var j = 0; j < uids.length; j++) {
          uid = uids[j]
          if (allAnswers[i][uid].valid) {
            voteResults[i][uid] = true
          } else {
            voteResults[i][uid] = false
          }
        }
      }

      return voteResults
    }

    getAnswersFromAllPlayers = () => {
      database.ref(this.state.roomCode)
      .child('players')
      .on('value', snapshot => {
        let allAnswers = Array(this.state.numCategories)
        for (var j = 0; j < this.state.numCategories; j++) {
          allAnswers[j] = {}
        }

        if (snapshot.exists()) {
          snapshot.forEach(childSnapshot => {
            var answers = childSnapshot.val().answers

            for (var i = 0; i < answers.length; i++) {
              const answer = answers[i]
              allAnswers[i][childSnapshot.key] = answer
            }
          })
        }

        database.ref(this.state.roomCode)
        .child('allAnswers')
        .set(allAnswers)
      })
    }

    getVotesFromAllPlayers = async () => {
      // This function should only be called _after_ we are certain
      // all the votes have been submitted!
      database.ref(this.state.roomCode)
      .child('players')
      .once('value')
      .then(snapshot => {
        let allVotes = Array(this.state.numCategories)

        if (snapshot.exists()) {

          // Initialize allVotes properly!
          // allVotes = [
          //   {
          //     uid_0: { uid_0: t/f, uid_1: t/f, ...} ,
          //     uid_1: { uid_0: t/f, uid_1: t/f, ...} ,
          //     ...
          //   },
          //   ...
          // ]
          for (let j = 0; j < this.state.numCategories; j++) {
            allVotes[j] = {}

            snapshot.forEach(childSnapshot => {
              allVotes[j][childSnapshot.key] = {}
            })
          }

          snapshot.forEach(childSnapshot => {
            var votes = childSnapshot.val().votes

            for (let i = 0; i < votes.length; i++) {
              const answers = votes[i]
              const uids = Reflect.ownKeys(answers)

              for (let k = 0; k < uids.length; k++) {
                const uid = uids[k]
                allVotes[i][uid][childSnapshot.key] = answers[uid]
              }
            }
          })
        }

        this.setState({ allVotes })

        return true
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

    showWinnerPrize = () => {
      this.setState({
        showWinnerModal: true
      })
    }

    render() {
      return (
        <div className="App">
          <div className="Game-view">
        {this.state.isStartView
          &&
          <StartView
          onCreate={this.createGame}
          onJoin={this.joinGame}
          />
        }
        {this.state.isHostLobbyView
          &&
        <div className="Lobby-view">
          <HostLobbyView
          onChange={this.changeHandler}
          onSubmit={(e) => this.submitHostFormHandler(e)}
          />
        </div>
        }
        {this.state.isNonHostLobbyView
          &&
        <div className="Lobby-view">
          <NonHostLobbyView
          players={this.state.players}
          roomCode={this.state.roomCode}
          />
        </div>
        }
        {this.state.isGameView
          &&
          <div>
              <div className="Voting-container">
                <div className="Voting-header">
                  <Timer>{this.state.timeRemaining}</Timer>
                  <div className="letter">
                  {this.state.categoryLetter}
                  </div>
                </div>
                <div className="Voting-form">
                  <div className="Voting-form-header"/>
                    <GameView
                    categories={this.state.categoriesList}
                    categoryLetter={this.state.categoryLetter}
                    onChange={this.onChangeAnswer}
                    onSubmit={this.onSubmitAnswers}
                    className="Game-view"
                    />
                  <div className="Voting-form-footer"/>
                </div>
                <div className="Voting-submit">
                  <div className="Game-form-submit">
                    <Button onClick={this.onSubmitAnswers} type='submit'>Submit</Button>
                  </div>
                </div>
              </div>
          </div>
        }
        {this.state.isAwaitResultsView
          &&
          <AwaitResultsView players={this.state.submittedPlayers}/>
        }
        {this.state.isVotingView
          &&
          <div>
              <div className="Voting-container">
                <div className="Voting-header">
                  <div className="Voting-header-title">Vote</div>
                  <div className="letter">
                  {this.state.categoryLetter}
                  </div>
                </div>
                <div className="Voting-form">
                  <div className="Voting-form-header"/>
                  <VotingView
                  categories={this.state.categoriesList}
                  categoryLetter={this.state.categoryLetter}
                  allAnswers={this.state.allAnswers}
                  onChange={this.onChangeVoteCheckbox}
                  voteResults={this.state.voteResults}
                  onSubmitVotes={this.onSubmitVotes}
                  numPlayers={this.state.numPlayers}
                  />
                  <div className="Voting-form-footer"/>
                </div>
                <div className="Voting-submit">
                  <div className="Game-form-submit">
                    <Button onClick={this.onSubmitVotes} type='submit'>Submit</Button>
                  </div>
                </div>
              </div>
          </div>
        }
        {this.state.isResultView
          &&
          <ResultView
          scores={this.state.scores}
          handleClick={this.showWinnerPrize}
          currentUser={this.state.username}
          />
        }
        <CreateForm
        show={this.state.modalShowCreateGame}
        onHide={() => this.setState({modalShowCreateGame: false})}
        onSubmit={(e) => this.submitCreateForm(e)}
        onChange={this.changeHandler}
        />
        <JoinForm
        show={this.state.modalShowJoinGame}
        onHide={() => this.setState({modalShowJoinGame: false})}
        onSubmit={(e) => this.submitJoinForm(e)}
        onChange={this.changeHandler}
        />
        <WinnerPrize
        show={this.state.showWinnerModal}
        onHide={() => this.setState({showWinnerModal: false})}/>
          </div>
        </div>
        );
      }
    }

    function GenerateRandomCategories(size) {
      // Choose {size} categories from the following premade list
      const possible_categories = [
        "A BOY'S NAME",
        "U.S. CITIES",
        "THINGS THAT ARE COLD",
        "SCHOOL SUPPLIES",
        "PRO SPORTS TEAMS",
        "INSECTS",
        "BREAKFAST FOODS",
        "FURNITURE",
        "TV SHOWS",
        "THINGS FOUND IN THE OCEAN",
        "PRESIDENTS",
        "PRODUCT NAMES",
        "VEGETABLES",
        "STATES",
        "THINGS YOU THROW AWAY",
        "OCCUPATIONS",
        "APPLIANCES",
        "CARTOON CHARACTERS",
        "TYPES OF DRINK",
        "MUSICAL GROUPS",
        "STORE NAMES",
        "THINGS AT A FOOTBALL GAME",
        "TREES",
        "PERSONALITY TRAITS",
        "ARTICLES OF CLOTHING",
        "DESSERTS",
        "CAR PARTS",
        "THINGS FOUND ON A MAP",
        "ATHLETES",
        "4-LETTER WORDS",
        "ITEMS IN A REFRIGERATOR",
        "FARM ANIMALS",
        "STREET NAMES",
        "THINGS AT THE BEACH",
        "COLORS",
        "TOOLS",
        "SPORTS",
        "SONG TITLES",
        "PARTS OF THE BODY",
        "ETHNIC FOODS",
        "THINGS YOU SHOUT",
        "BIRDS",
        "A GIRL'S NAME",
        "WAYS TO GET FROM HERE TO THERE",
        "ITEMS IN A KITCHEN",
        "VILLAINS / MONSTERS",
        "FLOWERS",
        "THINGS YOU REPLACE",
        "SANDWICHES",
        "ITEMS IN A CATALOG",
        "WORLD LEADERS / POLITICIANS",
        "SCHOOL SUBJECTS",
        "EXCUSES FOR BEING LATE",
        "ICE CREAM FLAVORS",
        "THINGS THAT JUMP / BOUNCE",
        "TELEVISION STARS",
        "THINGS IN A PARK",
        "FOREIGN CITIES",
        "STONES / GEMS",
        "MUSICAL INSTRUMENTS",
        "THINGS THAT ARE STICKY",
        "AWARDS / CEREMONIES",
        "CARS",
        "SPICES / HERBS",
        "BAD HABITS",
        "COSMETICS / TOILETRIES",
        "CELEBRITIES",
        "COOKING UTENSILS",
        "REPTILES / AMPHIBIANS",
        "PARKS",
        "LEISURE ACTIVITIES",
        "THINGS YOU'RE ALLERGIC TO",
        "FICTIONAL CHARACTERS",
        "MENU ITEMS",
        "MAGAZINES",
        "CAPITALS",
        "KINDS OF CANDY",
        "ITEMS YOU SAVE UP TO BUY",
        "FOOTWEAR",
        "SOMETHING YOU KEEP HIDDEN",
        "ITEMS IN A SUITCASE",
        "THINGS WITH TAILS",
        "SPORTS EQUIPMENT",
        "CRIMES",
        "NICKNAMES",
        "THINGS IN THE SKY",
        "PIZZA TOPPINGS",
        "COLLEGES / UNIVERSITIES",
        "FISH",
        "COUNTRIES",
        "THINGS THAT HAVE SPOTS",
        "HISTORICAL FIGURES",
        "SOMETHING YOU'RE AFRAID OF",
        "TERMS OF MEASUREMENT",
        "ITEMS IN THIS ROOM",
        "BOOK TITLES",
        "RESTAURANTS",
        "NOTORIOUS PEOPLE",
        "FRUITS",
        "THINGS IN A MEDICINE CABINET",
        "TOYS",
        "HOUSEHOLD CHORES",
        "BODIES OF WATER",
        "AUTHORS",
        "HALLOWEEN COSTUMES",
        "WEAPONS",
        "THINGS THAT ARE ROUND",
        "WORDS ASSOCIATED WITH EXERCISE",
        "HEROES",
        "GIFTS / PRESENTS",
        "TERMS OF ENDEARMENT",
        "KINDS OF DANCES",
        "THINGS THAT ARE BLACK",
        "VEHICLES",
        "TROPICAL LOCATIONS",
        "COLLEGE MAJORS",
        "DAIRY PRODUCTS",
        "THINGS IN A SOUVENIR SHOP",
        "ITEMS IN YOUR PURSE / WALLET",
        "WORLD RECORDS",
        "BABY FOODS",
        "FAMOUS DUOS AND TRIOS",
        "THINGS FOUND IN A DESK",
        "VACATION SPOTS",
        "DISEASES",
        "WORDS ASSOCIATED WITH MONEY",
        "ITEMS IN A VENDING MACHINE",
        "MOVIE TITLES",
        "GAMES",
        "THINGS THAT YOU WEAR",
        "BEERS",
        "THINGS AT A CIRCUS",
        "FAMOUS FEMALES",
        "MEDICINE / DRUGS",
        "THINGS MADE OF METAL",
        "HOBBIES",
        "PEOPLE IN UNIFORM",
        "THINGS YOU PLUG IN",
        "ANIMALS",
        "LANGUAGES",
        "NAMES USED IN THE BIBLE",
        "JUNK FOOD",
        "THINGS THAT GROW",
        "COMPANIES",
        "FROM TV, MOVIES AND BOOKS",
        "DANGEROUS ANIMALS",
        "ANIMALS THAT SWIM",
        "FOUR-LEGGED CREATURES",
        "THINGS ANIMALS EAT",
        "PETS",
        "ANIMALS FOUND IN FOREIGN LANDS",
        "ANIMAL NOISES",
        "AT THE ZOO",
        "MASCOTS",
        "ANIMALS THAT ADVERTISE PRODUCTS",
        "ANIMALS THAT FLY",
        "MOVIE STARS (LIVING)",
        "MOVIE STARS (DEAD)",
        "POLITICAL FIGURES",
        "SPORTS PERSONALITIES",
        "SEX SYMBOLS",
        "NEWSCASTERS / JOURNALISTS",
        "SINGERS",
        "ARTISTS",
        "CELEBRITIES YOU'D LIKE TO MEET",
        "CHILDREN",
        "STARS WHO APPEAR IN BOTH TV AND MOVIES",
        "MILITARY LEADERS",
        "THINGS THAT SMELL BAD",
        "THINGS YOU CAN'T SEE",
        "THINGS YOU DON'T WANT TO HEAR",
        "THINGS THAT FEEL SOFT",
        "THINGS THAT TASTE SPICY",
        "THINGS THAT SMELL GOOD",
        "THINGS THAT ARE RED",
        "THINGS YOU NEVER TASTED",
        "THINGS THAT ARE LOUD",
        "THINGS YOU SHOULDN'T TOUCH",
        "THINGS YOU SEE IN A CITY",
        "THINGS THAT FEEL HOT",
        "PRODUCE",
        "COCKTAILS",
        "SEAFOOD",
        "LOW CALORIE FOODS",
        "FOOD FOUND IN A DELI",
        "BREAKFAST CEREALS",
        "ANY GREEN FOOD OR DRINK",
        "SOFT DRINKS",
        "DISGUSTING THINGS TO EAT OR DRINK",
        "HORS D'OEUVRES",
        "FRIED FOODS",
        "ON A WINE LIST",
        "ITALIAN FOOD",
        "FAST FOOD",
        "KINDS OF SOUP",
        "SNACKS",
        "FOOD YOU EAT RAW",
        "FOOD FOUND IN A CASSEROLE",
        "FOOD AT A CARNIVAL OR FAIR",
        "HEALTH FOOD",
        "CANNED FOOD",
        "CHINESE FOOD",
        "FOUND IN A SALAD BAR",
        "MEXICAN FOOD",
        "PEOPLE YOU ADMIRE",
        "LAST NAMES",
        "PEOPLE WHO DO DANGEROUS JOBS",
        "COUPLES",
        "PEOPLE WHO GO DOOR-TO-DOOR",
        "NATIONALITIES",
        "PEOPLE WHO WORK AT NIGHT",
        "PEOPLE'S NAMES USED IN SONGS",
        "PEOPLE YOU AVOID",
        "SOMEONE FROM YOUR PAST",
        "TITLES PEOPLE HAVE",
        "PEOPLE WHO WORK ALONE",
        "IN EUROPE",
        "HONEYMOON SPOTS",
        "COLD CLIMATES",
        "PLACES YOU WOULDN'T WANT TO LIVE",
        "ISLANDS",
        "IN NORTH AMERICA",
        "IN YOUR HOMETOWN",
        "WITH A HIGH ALTITUDE",
        "NOT ON THE PLANET EARTH",
        "IN NATIONAL GEOGRAPHIC MAGAZINE",
        "FICTITIOUS PLACES",
        "WARM CLIMATES",
        "THINGS FOUND IN THE WATER",
        "GIFTS FOR THE BRIDE AND GROOM",
        "TOURIST ATTRACTIONS",
        "REASONS TO CALL EMERGENCY 911",
        "THINGS YOU CARRY",
        "THINGS FROM A STATIONERY STORE",
        "REASONS TO QUIT YOUR JOB",
        "THINGS WORN FROM THE WAIST UP",
        "THINGS THAT ARE WHITE",
        "THINGS FOUND IN A BASEMENT / CELLAR",
        "THINGS WITH STRIPES",
        "THINGS YOU NEED TICKETS TO SEE",
        "MATH TERMS",
        "THINGS YOU DO IN STUDY HALL",
        "THINGS FOUND IN A LOCKER",
        "THINGS YOU STUDY IN HISTORY",
        "SCIENCE TERMS",
        "AFTER SCHOOL ACTIVITIES",
        "REASONS TO GO TO THE PRINCIPAL'S OFFICE",
        "REASONS TO BE ABSENT",
        "THINGS IN A CLASSROOM",
        "THINGS YOU STUDY IN GEOGRAPHY",
        "THINGS YOU DO IN GYM CLASS",
        "FOUND IN THE CAFETERIA",
        "TEAM NAMES",
        "PLAYED INSIDE",
        "PLAYED OUTSIDE",
        "BOOKS, MOVIES, OR TV SHOWS ABOUT SPORTS",
        "SPORTS TERMS",
        "FEMALE ATHLETES",
        "SPORTING EVENTS",
        "A FOOTBALL PLAYER'S NAME",
        "A BASEBALL PLAYER'S NAME",
        "THINGS YOU SCREAM AT OFFICIALS",
        "OLYMPIC EVENTS",
        "ATHLETES WHO DO COMMERCIALS",
        "CANCELLED TV SHOWS",
        "MOVIES ON TV",
        "CHILDREN'S TV SHOWS",
        "COMEDY SHOWS",
        "LONG-RUNNING TV SERIES",
        "SHOWS YOU DON'T LIKE",
        "THINGS SOLD IN COMMERCIALS",
        "TV CHARACTER NAMES",
        "FEMALE STARS",
        "MALE STARS",
        "THINGS YOU DO WHILE WATCHING TV",
        "DAYTIME TV SHOWS",
        "WORDS ENDING IN -LY",
        "NOUNS",
        "ACTION WORDS",
        "ABBREVIATIONS",
        "FOREIGN WORDS",
        "5-LETTER WORDS",
        "WORDS THAT END IN -ING",
        "WORDS WITH A DOUBLE LETTER",
        "WORDS SAID IN ANGER",
        "ADJECTIVES",
        "WORDS ENDING IN -ED",
        "3-LETTER WORDS",
        "THINGS AT A PICNIC",
        "THINGS THAT ARE SOFT",
        "THINGS IN A SCIENCE FICTION MOVIE",
        "THINGS AT THE WHITE HOUSE",
        "THINGS THAT KIDS PLAY WITH",
        "THINGS AT A WEDDING",
        "HOT PLACES",
        "THINGS IN OUTER SPACE",
        "FOUND IN A COLLEGE DORM",
        "THINGS AT A DINER",
        "FAMOUS SINGERS",
        "THINGS AT AN AMUSEMENT PARK",
        "WORN ABOVE THE WAIST",
        "THINGS THAT ARE BRIGHT",
        "THINGS THAT HAVE NUMBERS",
        "FOUND IN A GYM / HEALTH CLUB",
        "THINGS ON A SAFARI",
        "WAYS TO SAY HI AND BYE",
        "THINGS FROM THE SIXTIES",
        "HOLIDAY THINGS",
        "ITEMS IN AN OFFICE",
        "THINGS IN PAIRS OR SETS",
        "THINGS ON A HIGHWAY",
        "THINGS IN LAS VEGAS",
        "THINGS AT A ZOO",
        "THINGS WITH MOTORS",
        "THINGS THAT FLY",
        "FOUND AT A SALAD BAR",
        "WORDS ENDING IN -LY",
        "THINGS ON A HIKING TRIP",
        "THINGS IN A HOTEL",
        "HEALTHY FOODS",
        "FOUND IN A CLASSROOM",
        "PARTY THINGS",
        "REASONS TO SKIP SCHOOL / WORK",
        "TITLES PEOPLE HAVE",
        "THINGS IN A DESERT",
        "THINGS IN A MYSTERY NOVEL",
        "COMPUTER LINGO",
        "LOUD THINGS",
        "KINDS OF SOUPS / STEWS",
        "MATH TERMS",
        "UNDERGROUND THINGS",
        "THINGS IN THE WILD WEST",
        "THINGS IN AN AIRPORT",
        "WORDS WITH DOUBLE LETTERS",
        "FOUND IN NEW YORK CITY",
        "THINGS IN FAIRY TALES",
        "CHRISTMAS THINGS",
        "SUMMER VACATION THINGS",
        "WINTER VACATION THINGS",
        "HALLOWEEN THINGS",
        "HOLIDAY FOOD OR DRINK",
        "VALENTINE'S DAY THINGS",
        "THINGS IN A FOOD FIGHT",
        "THINGS YOU EAT OR DRINK AT LUNCH",
        "THINGS ON A HAMBURGER",
        "YUCKY THINGS TO EAT OR DRINK",
        "YUMMY THINGS MOM DOESN'T WANT YOU TO EAT",
        "THINGS YOU EAT WITH YOUR FINGERS",
        "WILD ANIMALS",
        "THINGS YOU FEED YOUR PET",
        "NAMES FOR A DOG OR CAT",
        "ANIMALS THAT MAKE BAD PETS",
        "ANIMALS THAT FLY OR SWIM",
        "STUFFED ANIMALS",
        "THINGS YOU DO AT RECESS",
        "REASONS YOU DIDN'T DO YOUR HOMEWORK",
        "A CLASSMATE'S NAME",
        "EXCUSES TO LEAVE THE CLASSROOM",
        "SOMETHING YOU STUDY",
        "PLACES TO GO ON FIELD TRIPS",
        "PICNIC THINGS",
        "STUFF YOU WEAR ON THE WEEKEND",
        "MOVIES",
        "THINGS AT A BASEBALL GAME",
        "THINGS AT AN AMUSEMENT PARK",
        "THINGS AT THE MALL",
        "STREET NAMES",
        "THINGS IN A LIBRARY",
        "THINGS IN A FIRE STATION",
        "PEOPLE IN YOUR NEIGHBORHOOD",
        "PLACES TO EAT",
        "THINGS IN A POLICE STATION",
        "OUTDOOR ACTIVITIES",
        "AFTER SCHOOL SNACKS",
        "TV SHOWS",
        "TOYS OR GAMES",
        "AFTER SCHOOL HANGOUTS",
        "AFTER SCHOOL CHORES",
        "THINGS YOU BRING",
        "PLACES YOU'D LIKE TO GO",
        "THINGS YOU TAKE PICTURES OF",
        "SOMETHING AT THE BEACH",
        "CAMP STUFF",
        "SEEN FROM THE CAR WINDOW",
        "SHORT WORDS",
        "LONG WORDS",
        "WORDS ABOUT MONEY",
        "ACTION WORDS",
        "WORDS ABOUT SPORTS",
        "WORDS ABOUT MUSIC",
        "A PERSON YOU LIKE",
        "SOMETHING YOU HATE TO DO",
        "SOMETHING YOU WISH FOR",
        "SOMETHING YOU'RE GOOD AT",
        "SOMETHING THAT'S GROSS",
        "SOMETHING THAT MAKES YOU HAPPY",
        "THINGS AT A PARADE",
        "WAYS TO MAKE MONEY",
        "SONGS OR SINGERS",
        "WAYS TO BUG THE BABYSITTER",
        "SOMETHING SCARY",
        "SOMETHING IN YOUR BEDROOM",
        "SOMEBODY COOL",
        "THINGS AT A BIRTHDAY PARTY",
        "THINGS THAT MAKE NOISE",
        "FAST THINGS",
        "THINGS AT A WEDDING",
        "PLACES OR THINGS ON A MAP",
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
