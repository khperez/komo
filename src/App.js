import React, { Component } from 'react';
import { database, auth } from './firebase';
import Button from '@material-ui/core/Button';

class App extends Component {
  constructor() {
    super();

    this.state = {
      messages: [],
      user: null,
    };

    this.onAddMessage = this.onAddMessage.bind(this);
    this.login = () => { auth.signInAnonymously() };

  }

  componentDidMount() {
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
      }
      this.setState({user}) })
    auth.signOut();
  }

  onAddMessage(event) {
    event.preventDefault();

    var user = auth.currentUser;
    var uid = user.uid;
    database.ref(uid).push(this.input.value);

    this.input.value = '';
  }

  render() {
    let submitForm =
      <form onSubmit={this.onAddMessage}>
        <input type="text" ref={node => this.input = node}/>
        <ul>
          {this.state.messages.map(message =>
            <li key={message.id}>{message.text}</li>
          )}
        </ul>
      </form>
    let authButton = this.state.user ?
      <div>You're logged in {submitForm} </div> :
      <Button variant="contained" color="primary" onClick={this.login}>
        Anonymous Login
      </Button>
    return (
      <div>
        {authButton}
      </div>
    );
  }
}

export default App;