import React, { Component } from 'react';
import { database, auth } from './firebase';
import Button from '@material-ui/core/Button';

const STATES = {
    SIGNED_OUT: 'signed_out',
    SIGNED_IN:  'signed_in',
    RUN_GAME:   'run_game',
    SHOW_RESULT:'show_result'
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      categories: [],
      current_state: STATES.SIGNED_OUT,
      answer: []
    };

    this.onSubmitAnswer = this.onSubmitAnswer.bind(this);
    this.onChangeNumCategories = this.onChangeNumCategories.bind(this);
    this.onSubmitNumCategories = this.onSubmitNumCategories.bind(this);
    this.login = () => { auth.signInAnonymously() };
  }

  componentDidMount() {
    // Sign out by default for now so we can test the 'Anonymous Login' button.
    // Probably should remove this in production TM.
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
        this.setState({current_state: STATES.SIGNED_IN})
      } else {
        this.setState({current_state: STATES.SIGNED_OUT})
      }
    })
  }

  onChangeAnswer(event) {
    // Each time the user edits their answer, the result gets store in
    // this.state.answers.{category index}

  }

  onSubmitAnswer(event) {
    event.preventDefault();

    // We use the user id (uid) to ensure each user writes to an unique location
    // in the database
    var uid = auth.currentUser.uid;
    database.ref(uid).push(this.input.value);

    this.input.value = '';
  }

  onChangeNumCategories(event) {
    this.setState({categories: GenerateRandomCategories(event.target.value) })
  }

  onSubmitNumCategories(event) {
    this.setState({current_state: STATES.RUN_GAME})
    event.preventDefault();
  }

  render() {
    // Can't seem to refactor this into a function
    let AnswerForms =
      <div>
        {this.state.categories.map((el, index) =>
          <form onSubmit={this.onSubmitAnswer}>
            <label>{el.name}</label><br></br>
            <input type="text" ref={(node) => { this.input = node }}/>
            <ul>
              {this.state.messages.map(message =>
                <li key={message.id}>{message.text}</li>
              )}
            </ul>
          </form>
        )}
      </div>

    let mainDisplay;

    if (this.state.current_state === STATES.SIGNED_OUT) {
      mainDisplay = <LoginButton onClick={this.login} />;
    } else {
        if (this.state.categories !== [] &&
            this.state.current_state === STATES.RUN_GAME) {
            mainDisplay = <div>{AnswerForms}</div>
        } else {
            mainDisplay = <NumCategoriesForm onSubmit={this.onSubmitNumCategories}
                           onChange={this.onChangeNumCategories} />;
        }
    }

    return (
      <div>
        {mainDisplay}
      </div>
    );
  }
}

function LoginButton(props) {
    return (
      <Button variant="contained" color="primary" onClick={props.onClick}>
        Anonymous Login
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

function GenerateRandomCategories(size) {
    // Choose {size} categories from the following premade list
    var possible_categories = [
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
        chosen_categories.push({ name: possible_categories[random_index] })
        // Remove the chosen category from the list so we don't get duplicates
        possible_categories.splice(random_index, 1)
    }
    return chosen_categories;
}


export default App;
