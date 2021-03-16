import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

class SignUpForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {emailValue: "", usernameValue: "", passwordValue: "", rememberMeValue: false};

    this.handleSubmit = this.handleSubmit.bind(this); // These functions are bound to prevent some scoping issues pertaining to their access to things via 'this'.
    this.handleChange = this.handleChange.bind(this);
    this.checkForms = this.checkForms.bind(this);
  }

  handleSubmit(event){ //This was originally used in an attempt to handle the request of a new word without requiring the page to refresh, but due to some incompatibilities and issues with how asynchronous code functions within React.js, this was put aside as a potential, though unlikely, future update.
    /* if(this.state.passwordValue !== this.state.reenterPasswordValue){
    //   alert("Passwords do not match!");
    //   return;
    // }
    //
    // let httpRequest = new XMLHttpRequest();
    // httpRequest.open("POST", this.props.serverAddress + "signup", true);
    // httpRequest.setRequestHeader("Content-Type", "text/plain");
    // httpRequest.setRequestHeader("Authorization", btoa(this.state.usernameValue + ":" + this.state.passwordValue + ":" + this.state.emailValue));
    // httpRequest.send( null );
    //
    // httpRequest.onload = function(){
    //   alert(httpRequest.responseText);
    } */
  }

  handleChange(event){ // This is part of the fact that the forms on this page are "controlled components". This necessitates a little bit of extra code here to handle the components' functions, but it also gives React the authority to act as the "single source of truth", which is extremely useful.
    if(event.target.id == "emailForm"){
      this.setState({emailValue: event.target.value});
    } else if(event.target.id === "usernameForm"){
      this.setState({usernameValue: event.target.value});
    } else if(event.target.id === "passwordForm"){
      this.setState({passwordValue: event.target.value});
    } else if(event.target.id === "reenterPasswordForm"){
      this.setState({reenterPasswordValue: event.target.value});
    }
  }

  checkForms(){
    if(this.state.passwordValue !== this.state.reenterPasswordValue){ // This is just verifying that the two passwords entered, match up.
      alert("Passwords do not match!");
    return;
    }

    //I considered using some regex to check email validity here, but that will have to come into play more when there is an email validation system implemented, for now, for the purposes of this being an example of full stack development that isn't intended for a full production rollout however, this will be just fine.

    let httpRequest = new XMLHttpRequest(); // This creates the XMLHttpRequest to the server for signup.
    httpRequest.open("POST", this.props.serverAddress + "signup", true);
    httpRequest.setRequestHeader("Content-Type", "text/plain");
    httpRequest.setRequestHeader("Authorization", btoa(this.state.usernameValue + ":" + this.state.passwordValue + ":" + this.state.emailValue)); // Using the btoa() function here to throw it in base64. It's not fantastic encryption, preferably this is being hosted by a source with an SSL cert, but hey, every little bit counts.
    httpRequest.send( null );

    httpRequest.onload = function(){
      alert(httpRequest.responseText);
    }
  }

  render(){
    return(
      <form onSubmit={this.handleSubmit}>
        <label>
          Email: <br />
          <input id ="emailForm" type="text" value={this.state.emailValue} onChange={this.handleChange} /> <br />
          Username: <br />
          <input id ="usernameForm" type="text" value={this.state.usernameValue} onChange={this.handleChange} /> <br />
          Password: <br />
          <input id ="passwordForm" type="password" value={this.state.passwordValue} onChange={this.handleChange} /> <br />
          Re-Enter Password: <br />
          <input id ="reenterPasswordForm" type="password" value={this.state.reenterPasswordValue} onChange={this.handleChange} /> <br />
          Remember Me? <input id="rememberMeCheckbox" type="checkbox" value={this.state.rememberMeValue} onChange={this.handleChange} /> <br />
        </label>
          {/*}<input id="submitButton" type="submit" value="Submit" />*/}
          <button type="button" onClick={this.checkForms}>Submit</button> {/*This was placed here as opposed to an input with the type submit, so that we could get the checkForms function to run before the page refreshed, which seemed to take precedence when using an input with type submit.*/}
        <Link to="/">
          <button id="cancelButton" value="Cancel"> Cancel </button>
        </Link>
      </form>
    );
  }
}

export default SignUpForm;
