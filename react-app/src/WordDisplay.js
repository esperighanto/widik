import React from 'react';

//This class is just a CSS wrapper on top of some text that it's fed.
class WordDisplay extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    const wordStyle={
      fontSize: "48px",
      textAlign: "center"
    }
    const definitionStyle={
      fontSize: "16px",
      textAlign: "center"
    }
    const dividingTextStyle={
      fontSize: "24px",
      textAlign: "left",
      paddingLeft: "50px"
    }

    let definitionDisplayText = (this.props.manyDefinitions) ? "Definitions: " : "Definition: "; // This is a ternary statement deciding whether or not to say the singular or plural of the word definition, based on whether or not this component was told that there are numerous definitions or not.

    return(
      <div>
        <div style={wordStyle}>
          <b><i>{this.props.word}</i></b>
        </div>
        <div style={dividingTextStyle}>
          <i>{definitionDisplayText}</i>
        </div>
        <div style={definitionStyle}>
          <i>{this.props.definition}</i>
        </div>
        <div style={dividingTextStyle}>
          <i>Example Sentence:</i>
        </div>
        <div style={definitionStyle}>
          <i>{this.props.exampleSentence}</i>
        </div>
        <br/><br/><br/>
        <div style={definitionStyle}>
          <a href={"https://www.dictionary.com/browse/" + this.props.word}><i>External Dictionary Link</i></a> {/*This automatically creates a dictionary.com link to a word, based on the word that it was fed, and thanks to dictionary.com's convenient URL structuring.*/}
        </div>
      </div>
    );
  }
}

export default WordDisplay;