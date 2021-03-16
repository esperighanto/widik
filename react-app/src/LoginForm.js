import React from 'react';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

//This class creates the forms and handles their XMLHttpRequest actions for logging in. It's very similar to the SignUpForm, and questions about the architecture of this component may be answered by comments in SignUpForm.
class LoginForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {usernameValue: "", passwordValue: ""};

    this.handleChange = this.handleChange.bind(this); // This is to handle some scoping issues pertaining to access to 'this.'.
    this.checkForms = this.checkForms.bind(this);
  }

  handleChange(event){ // This is necessary for the fact that we are using controlled components here.
    if(event.target.id === "usernameForm"){
      this.setState({usernameValue: event.target.value});
    } else if(event.target.id === "passwordForm"){
      this.setState({passwordValue: event.target.value});
    }
  }

  checkForms(){ // This method exists to handle the creation, execution and receipt of the XMLHttpRequest communicating the login information to the server.
    let username = this.state.usernameValue;

    let httpRequest = new XMLHttpRequest();
    httpRequest.open("POST", this.props.serverAddress + "/login", true);
    httpRequest.setRequestHeader("Content-Type", "text/plain");
    httpRequest.setRequestHeader("Authorization", btoa(username + ":" + this.state.passwordValue)); // A colon is being used for serialization here, in line with the remainder of the code in WIDiK. btoa() is being used for encryption here, just base64, in a production environment, there would preferably be a host using an SSL cert to reinforce this however.
    httpRequest.send( null );

    httpRequest.onload = function(){
      if(httpRequest.responseText === "success"){
        cookies.set('loggedIn', 'true:' + username, {path:'/'});
        window.location.href=window.location.href.slice(0, -7); // This is a workaround to get you back to the homepage. This could CERTAINLY be more robust, but it works for now. Integrating React's Router system has led to some interesting issues with directly linking back to specific routes, without getting the user to click on a <Link />. This is one of those cases.
      } else{
        alert("Login failed.");
      }
    }
  }

  logOut(){
    cookies.set('loggedIn', 'false', {path: '/'}); // Sets the loggedIn cookie back to false. It's kept in the root as this is just being run in a test environment.
    window.location.href = window.location.pathname + window.location.search + window.location.hash; // This was, sadly the cleanest way to route back to the page without forcibly refreshing, which was causing some cookie errors. This could be looked into later for cleaner code, but as far as I can tell there aren't any issues arising from running things like this.
  }

  render(){
    return(
      <form onSubmit={this.handleSubmit}>
        <label>
          Username: <input id ="usernameForm" type="text" value={this.state.usernameValue} onChange={this.handleChange} />
          <br />
          Password: <input id="passwordForm" type="text" value={this.state.passwordValue} onChange={this.handleChange} />
        </label>
        <br />
        <button type="button" onClick={this.checkForms}>Log In</button>
        <button type="button" onClick={this.logOut}>Log Out</button>
      </form>
    );
  }
}

export default LoginForm;