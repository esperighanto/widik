import React from 'react';

// This class is the "Teach Me Another Word!" found at the bottom of the Learn page. Just a wrapper for some CSS and a refresh function on top of a normal button.
class WordButton extends React.Component{
  constructor(props){
    super(props);
  }

  handleClick = () => { // This just refreshes the page upon being clicked. It's simple, but allows for higher order elements of the web app to re-request a new word from the server.
    window.location.reload(true);
  }

  render(){
    const buttonStyle = {
      backgroundColor: "#32a8a0",
      fontSize: "16px",
      border: "0px",
      justifyContent: "center",
      textAlign: "center",
      margin: "auto",
      display: "inline-block",
      cursor: "pointer",
      padding: "16px 32px",
      display: "block"
    }

    return(
      <button style={buttonStyle} onClick={this.handleClick}> {this.props.buttonText} </button>
    );
  }
}

export default WordButton;