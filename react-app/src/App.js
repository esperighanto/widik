/*Created March of 2021, by Thomas Royall.*/

import './App.css';
import {Component} from 'react';
import WordDisplay from './WordDisplay.js';
import WordButton from './WordButton.js';
import FavoriteButton from './FavoriteButton.js';
import LoginForm from './LoginForm.js';
import SignUpForm from './SignUpForm.js'
import Favorites from './Favorites.js'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Cookies from 'universal-cookie';
const cookies = new Cookies();
const serverURL = 'http://localhost:5000';

function splitWordDefinition(responseText){ // This is just a convenience function for splitting things up by colons, since those are used in this program's serialization.
  let splitPhrase = responseText.split(":");
  return splitPhrase
}

function getNewWord(serverAddress){ // This handles both the creation and the reception of an XMLHttpRequest for grabbing a new word to feed to the Learn page as a prop.
  let httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", serverAddress, false);
  httpRequest.setRequestHeader("Access-Control-Allow-Origin", true);
  httpRequest.send( null );

  httpRequest.onload = function(){
    console.log("Httprequest's status was " + httpRequest.status);
  }

  console.log(httpRequest);
  let splitPhrase = splitWordDefinition(httpRequest.responseText);
  console.log("Word requested, received " + httpRequest.responseText + ".");
  return splitPhrase;
}

class App extends Component {

  constructor(props){
    super(props);

    if(typeof cookies.get('loggedIn') === 'undefined'){ // This handles there being no loggedIn cookie, on the chance that it's somebody's first time on the site.
      cookies.set('loggedIn', 'false', {path: '/'});
    }

    // console.log("Logged in debug check: " + cookies.get('loggedIn'));

    this.state = {loggedIn: cookies.get('loggedIn')}; // This sets the site's constructor to keep track of whether or not the user is logged in.
  }
  render(){
    return(
      <Router>
        <div class="sidenav"> {/*This class is used for CSS purposes.*/}
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/learn">Learn</Link>
            </li>
            <li>
              <Link to="/sign-in">Sign In</Link>
            </li>
            <li>
              <Link to="/favorites">Favorites</Link>
            </li>
          </ul>
        </div>

        <LoggedInMessage loggedIn={this.state.loggedIn} />

        <hr />

        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/learn">
            <Learn />
          </Route>
          <Route path="/sign-in">
            <SignIn />
          </Route>
          <Route path="/sign-up">
            <SignUp />
          </Route>
          <Route path="/favorites">
            <FavoritesPage />
          </Route>
        </Switch>
      </Router>
    )
  }
}

function LoggedInMessage(props){ // This is a component written as a simple function, just to handle the cookie substringing and logic of what to say, whether the user is logged in or not. This could probably be code golfed down to a really compact size, but readability would suffer.
  if(props.loggedIn.substring(0, 4) === "true"){
    return "You are logged in";
  } else{
    return "You are not logged in";
  }
}

function Learn(){
  var wordFound = getNewWord(serverURL);
  wordFound[1] = wordFound[1].split(';').map(str => <p>{str}</p>); // This works by way of splitting the string by semicolons, then using the map function to turn this array into an array of adequate HTML (really JSX) tags.
  let manyDefinitions = (wordFound[1].length < 2) ? false : true; // This might be a little too compact for readability, but it's just setting manyDefinitions to be a boolean, true if there is a semicolon in the definitions string of the word, since a word with many definitions has those definitions separates by a semicolon.
  // console.log("Is there more than one definition? " + manyDefinitions); // Another check that's useful for debugging.

  return(
    <div>
       <div>
         <WordDisplay word={wordFound[0]} definition={wordFound[1]} exampleSentence={wordFound[2]} manyDefinitions={manyDefinitions}/>
       </div>
       <br/><br/><br/><br/><br/><br/>
       <div>
         <WordButton buttonText="Teach Me Another Word!"/>
         <br />
         <FavoriteButton serverAddress={serverURL} buttonText="Favorite This Word" id={wordFound[3]}/>
       </div>
   </div>
  );
}

function Home(){
  return(
    <div>
    Welcome to WIDiK! <br /> <br />
    Words I didn't know. <br /> <br />
    You can use the links on the sidebar to navigate the site, learning words on the <i>Learn</i> page, using the <i>Sign In</i> to log in or create an account, and using the <i>Favorites</i> page to see words that you've favorited.
    </div>
  );
}

function About(){
  return(
    <div>
    Welcome to WIDiK! <br /> <br />
    Words I didn't know. <br /> <br />
    This is a site that exists to teach rare words, and also as an experience in learning full stack development using PostgresQL, React.JS, Node.JS, and Express.JS. <br /> <br />
    Here you can make an account, learn new words, and add them to your favorites list. <br /> <br />
    </div>
  );
}

function SignIn(){
  return(
    <div>
      <LoginForm serverAddress={serverURL}/>
      Need to sign up? <Link to="/sign-up">Click here!</Link>
    </div>
  );
}

function SignUp(){
  return(
    <div>
      Welcome to WIDik! This site exists to teach you new, rare words, and making an account will let you keep track of your progress as you learn.
      <SignUpForm serverAddress={serverURL}/>
    </div>
  );
}

function FavoritesPage(){
  return(
    <div>
      <Favorites serverAddress={serverURL}/>
    </div>
  );
}

export default App;
