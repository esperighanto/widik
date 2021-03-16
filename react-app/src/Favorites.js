import React from 'react';
import Cookies from 'universal-cookie';
import WordDisplay from './WordDisplay.js';
const cookies = new Cookies();
window.someGlobalTest = "abc";

/*This class was quite a challenge to build, as it wrestles with the nature of React.js not getting along with asynchronous code.
The solution was found to lie in altering the component mounting functions.*/
class Favorites extends React.Component{
  constructor(props){
    super(props);
    this.state = {textToReturn: "", processedText: ""};

    this.loadFavorites = this.loadFavorites.bind(this);
  }

  getReturnText(){ // This is just an old school getter, to circumvent some scoping issues.
    return this.state.textToReturn;
  }

  getFavorites(serverAddress){ // This sends the XMLHttpRequest to the back-end looking for the list of favorites as a list of integer IDs, which correlate to the favorited words in the database.
    return new Promise(function(resolve, reject){
      let httpRequest = new XMLHttpRequest();
      httpRequest.open("POST", serverAddress + "/get-favorites", true);
      httpRequest.setRequestHeader("Content-Type", "text/plain");
      httpRequest.setRequestHeader("Authorization", cookies.get('loggedIn').substring(5)); // This cuts the "true:" off of the beginning of the loggedIn cookie, so that we are only sending the username attached to the cookie, not the remainder of it. The default formatting for the loggedIn cookie in WIDiK, if logged in, is "true:username".

      httpRequest.onload = function(){
        let status = httpRequest.status;
        if(status == 200){
          resolve(httpRequest.responseText);
        } else{
          reject(status);
        }
      }

      httpRequest.send( null );
    });
  }

  getFavoritesInformation(serverAddress, favoritesData){ // This sends the next request to the backend, taking a processed list of word IDs which are now known to be this account's favorited words, and requesting a much larger chunk of information containing the worsd, their definitions, and essentially the entire database row associated with each of the requested words.
    return new Promise(function(resolve, reject){
      let httpRequest = new XMLHttpRequest();
      httpRequest.open("POST", serverAddress + "/get-favorites-information", true);
      httpRequest.setRequestHeader("Content-Type", "text/plain");
      httpRequest.setRequestHeader("Authorization", favoritesData.toString());

      httpRequest.onload = function(){
        let status = httpRequest.status;
        if(status == 200){
          resolve(httpRequest.responseText);
        } else{
          reject(status);
        }
      }

      httpRequest.send( null );
    });
  }

  async loadFavorites(serverAddress){ // This is the asynchronous function which manages running both getFavorites and getFavoritesInformation in serial, making sure that the data is being handled appropriately.
    try{
      let resultOfGetFavorites = await this.getFavorites(serverAddress);

      let nonRepeatingFavorites = [...new Set(resultOfGetFavorites)]; // This casts the IDs received into being a set, a relatively recent EcmaScript addition which inherently removed redundant entries.

      let resultOfGetFavoritesInfo = await this.getFavoritesInformation(serverAddress, nonRepeatingFavorites);
      return resultOfGetFavoritesInfo;
    } catch(error){
      console.log("Error fetched, " + error);
    }
  }

  formatServerResponse(textToFormat){ // What this needs to do is properly format all of the words, and then separate them by a | character.
    /* let entries = textToFormat.slice(0, -1).split("|"); // This is being sliced with a (0, -1) to remove the last character since there will always be another separator on the end. // This is being left here in case I ever want to go back and tackle the nature of trying to convince this function to return JSX, which can then be used later on in the render function. Until then, I'll have this return whatever it's fed.
    // let splitEntries = [];
    // let textToReturn = "";
    // for(let i = 0; i < entries.length; i++){
    //   console.log("Entry " + i + " is: " + entries[i]);
    //   splitEntries[i] = entries[i].split(":");
    // }
    //
    // for(let i = 0; i < splitEntries.length; i++){
    //   splitEntries[i][1] = splitEntries[i][1].split(';').map(str => <p>{str}</p>); // This works by way of splitting the string by semicolons, then using the map function to turn this array into an array of adequate HTML (really JSX) tags.
    //   let manyDefinitions = (splitEntries[i][1].length < 2) ? false : true;
    //   // textToReturn = textToReturn + splitEntries[i][0] + ": " + splitEntries[i][1] + "<a href={'https://www.dictionary.com/browse/'" + splitEntries[i][0];
    //   textToReturn = textToReturn + <WordDisplay word={splitEntries[i][0]} definition={splitEntries[i][1]} exampleSentence={splitEntries[i][2]} manyDefinitions={manyDefinitions}/>;
    //   if(i < splitEntries.length - 1){ // This is set up so that we won't put a semicolon on the very end.
    //     textToReturn = textToReturn + ";";
    //   }
    // }

    // return textToReturn; */
    return textToFormat;
  }

  componentWillMount(){ // This is the workaround to make sure that loadFavorites is run before the components finish mounting. Handling asynchronicity in React.js components is a bit of a hassle, and this is the necessary workaround to get it functioning properly.
    this._asyncRequest = this.loadFavorites(this.props.serverAddress).then(
      textToReturn => {
        this._asyncRequest = null;
        this.setState({textToReturn: this.formatServerResponse(textToReturn)});
      }
    );
  }

  /*componentWillUnmount(){ // This was necessary for debugging, but is commented out since it does not seem to affect anything once the aforementioned (in componentWillMount) asynchronicity issues were handled.
    if(this._asyncRequest) {
      // this._asyncRequest.cancel();
    }
  }*/

  render(){
    /* this.loadFavorites(this.props.serverAddress).then(function(result){ // This codeblock is being kept around in case any asynchronicity issues reappear, this will be helpful for checking on the data coming in from the server.
    //   console.log("The still serialized result from the server: " + result);
    }); */

    const listItems = this.state.textToReturn.toString().split("|").slice(0,-1).map((result) => // This line takes the textToReturn, which is the data fed in by the server. Splits it by | characters, which are used to separate individual words that were favorited. Removes the final entry, as there is an unnecessary delineating character placed there by the server. Then maps it using the line below.
      <li><a href={"https://www.dictionary.com/browse/" + result.slice(0,-2).split(":").slice(0, 1)}>{result.slice(0,-2).split(":").slice(0, 1)}</a></li>
    ); // This line above creates a dictionary.com link thanks to their fantastically convenient URL formatting, by placing the result, without the final two characters (a period and a colon), split by colons (delineating word from definition from example sentences and the sorts), and then it takes only the first result of this split, which is the word itself.

    // console.log("List items: " + listItems); // Just a helpful debug check for making sure that the asynchronously loaded data came in, in time.


    if(cookies.get('loggedIn').slice(0,4) === "true"){ // This is just making sure that the user is logged in, so that nothing will be erroneously executed without having their username in the loggedIn cookie.
      return(
        <div>
        <ul>{listItems}</ul>
        </div>
      );
    } else{ // If they're not logged in, then present the user with this.
      return(
        <div>
        Please log in to see your favorites.
        </div>
      );
    }

  }
}

export default Favorites;