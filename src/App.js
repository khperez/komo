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
      categories: [], // List of string names (category names)
      current_state: STATES.SIGNED_OUT,
    };

    this.onSubmitAnswers = this.onSubmitAnswers.bind(this);
    this.onChangeNumCategories = this.onChangeNumCategories.bind(this);
    this.onSubmitNumCategories = this.onSubmitNumCategories.bind(this);
    this.onChangeAnswer = this.onChangeAnswer.bind(this);
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
        PrintCategory(this.state.categories[i])
    }
  }

  onSubmitAnswers(event) {
    event.preventDefault();

    console.log('onSubmitAnswers')

    // We use the user id (uid) to ensure each user writes to an unique location
    // in the database
    var uid = auth.currentUser.uid;

    for (var i = 0; i < this.state.categories.length; i++) {
      var c = this.state.categories[i];
      const c_str = JSON.stringify(c, undefined, 2);
      console.log(c_str);
      database.ref(uid).push(c_str);
    }
    
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
          <form>
            <label>{el.name}</label><br></br>
            <input type="text" onChange={this.onChangeAnswer.bind(this, el.id)} ref={(node) => { this.input = node }}/>
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
            mainDisplay = <div>{AnswerForms}<SubmitAnswersButton onClick={this.onSubmitAnswers} /></div>
        } else {
            mainDisplay = <NumCategoriesForm onSubmit={this.onSubmitNumCategories}
                           onChange={this.onChangeNumCategories} />;
        }
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

    var match = id.match(/(?:-)(\d+)$/)[1]; // 23
    return match
}

function PrintCategory(c) {
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
            answer: "DEADBEEF" // Placeholder for now
        })
        // Remove the chosen category from the list so we don't get duplicates
        possible_categories.splice(random_index, 1)
    }

    for (var j = 0; j < chosen_categories.length; j++) {
      const c = chosen_categories[j];
      PrintCategory(c);
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
