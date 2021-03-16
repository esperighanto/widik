import React from 'react';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

//This class is a wrapper around a <button> element, which adds in the functionality of handling communications with the back end about favoriting certain words that the user decides to.
class FavoriteButton extends React.Component{
  constructor(props){
    super(props);
  }

  handleClick = () => {
    // console.log(cookies.get('loggedIn')); // Just a debug check useful for when cookies are giving you troubles, to make sure that we're getting something other than undefined.
    if(cookies.get('loggedIn') === "false"){
      window.location.href=window.location.href.slice(0, -6) + "/sign-in"; // If this component ever finds itself used off of the /learn route, then this would benefit from being changed.
    } else{
      let httpRequest = new XMLHttpRequest(); // Create and send the XMLHttpRequest which tells the server to favorite this.
      httpRequest.open("POST", this.props.serverAddress + "/add-favorite", true);
      httpRequest.setRequestHeader("Content-Type", "text/plain");
      httpRequest.setRequestHeader("Authorization", this.props.id + ":" + cookies.get('loggedIn').split(":")[1]); // There's a little bit of trickery going on here, but what this is doing is sending the property's id, and then since the loggedIn cookie, when logged in, is structured as true:username, it's using the split function to get the username into the [1] index, and feeding that into this request header.
      httpRequest.send( null );
    }
  }

  render(){
    const buttonStyle = {
      backgroundColor: "#FF8C00", // This button is going to be BRIGHT to contrast with the rather pale, muted background colors on the gradient.
      fontSize: "16px",
      border: "0px",
      justifyContent: "center",
      textAlign: "center",
      margin: "auto",
      display: "inline-block",
      cursor: "pointer",
      padding: "16px 32px",
      display: "block"
    };

    return(
      <button style={buttonStyle} onClick={this.handleClick}> {this.props.buttonText} </button>
    );
  }
}

export default FavoriteButton;