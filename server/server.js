const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors'); // A very useful tool to handle Cross-Origin Resource Sharing.
const fs = require('fs');
const port = 5000;
const { Client } = require('pg');
const dbConnection = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb',
  password: 'Letmein721!',
  port: 5432,
});
words = {};

dbConnection.connect(); // Create the database connection.

function getRandomNumber(minimum, maximum){ // This is just a wrapper on the relatively unreadable function below, making it more convenient to generate a random number within certain bounds.
  return Math.floor((Math.random() * ((maximum + 1) - minimum)) + minimum);
}

async function getRandomWord(){ // This is an asynchronous function which gathers a random word. As more words are added to the words table, for now, since the line below gets a random number between 1 and 5, those argument would have to be changed statically. This would be vital in a production environment.
  let query = "SELECT * FROM words WHERE id=" + getRandomNumber(1, 5); // Making this dynamically change to the length of the words table would be handy.

  try{ // Send the database query.
    const res = await dbConnection.query(query);
    return res.rows;
  } catch(err){
    console.log("~~~DATABASE ERROR~~~");
    console.log(err.stack);
  }
}

async function getWordByID(id){ // This is an asynchronous function which is a slight deviation on getRandomWord. The two could likely be merged at some point. This just gets a function by a specified ID. Another robustness feature for the future could be, once the length of the words table is known, making sure that the ID provided does not exceed the maximum queryable.
  let query = "SELECT * FROM words WHERE id=" + id;

  try{ // Send the database query.
    const res = await dbConnection.query(query);
    return res.rows;
  } catch(err){
    console.log("~~~DATABASE ERROR~~~");
    console.log(err.stack);
  }
}

async function checkLogin(username, password){ // This is an asynchronous function that takes a username and password, queries the database for the password associated with the username, checks them, and then returns a boolean based on whether or not the passwords matched.
  let query = "SELECT * FROM accounts WHERE accounts.username='" + username + "';";

  try{ // Send the database query.
    const res = await dbConnection.query(query);
    if(typeof res.rows[0] !== "undefined"){
      return (password === res.rows[0].password ? true : false); // A ternary statement handling the password check.
    } else{
      return false;
    }
  } catch(err){
    console.log("~~~DATABASE ERROR~~~");
    console.log(err.stack);
  }
}

async function checkEmailTaken(email){ // This is a function to see if an email already exists within the accounts table's email column.
  let query = "SELECT * FROM accounts WHERE accounts.email='" + email + "';";

  try{// Send the database query.
    const res = await dbConnection.query(query);
    if(typeof res.rows[0] == 'undefined'){
      return false;
    }
    return (email === res.rows[0].email ? true : false); // A ternary statement handling the boolean value being returned, assuming that it wasn't caught in the above check for an undefined data type.
  } catch(err){
    console.log("~~~DATABASE ERROR~~~");
    console.log(err.stack);
  }
}

async function checkUsernameTaken(username){ // This functions almost identically to checkEmailTaken, except for the accounts table's username column instead.
  let query = "SELECT * FROM accounts WHERE accounts.username='" + username + "';";

  try{// Send the database query.
    const res = await dbConnection.query(query);
    if(typeof res.rows[0] == 'undefined'){
      return false;
    }
    return (username === res.rows[0].username ? true : false); // A ternary operation to handle the boolean return, assuming that it wasn't handled in the above check for an undefined data type.
  } catch(err){
    console.log("~~~DATABASE ERROR~~~");
    console.log(err.stack);
  }
}

async function createAccount(username, password, email){ // This handles the creation of a new row in the accounts table, providing the username, password, and email.
  let query = "INSERT INTO accounts(username, email, password) VALUES('" + username + "', '" + email + "', '" + password + "'); COMMIT;"; // Despite the fact that Postgres automatically places a commit on the end of statements without them, it was throwing pretty anomalous errors without it. This coudl be investigated later, but for now it seems to be causing no trouble.
  console.log("Running this query: " + query);

  try{// Send the database query.
    const res = await dbConnection.query(query);
    return true;
  } catch(err){
    console.log("~~~DATABASE ERROR~~~");
    console.log(err.stack);
  }
}

async function addFavorite(username, wordID){ // This function handles the UPDATE query which adds a new word ID to a specific account's favorite_words column.
  let query = "UPDATE accounts SET favorite_words = array_append(favorite_words, " + wordID + ") WHERE username='" + username + "'; COMMIT;"; // TODO: This could be made to not function if it's redundant, but for now that's all being handled in the Favorites.js class with some type casting that's doing the data scrubbing.

  try{// Send the database query.
    const res = await dbConnection.query(query);
    return true;
  } catch(err){
    console.log("~~~DATABASE ERROR~~~");
    console.log(err.stack);
  }
}

async function getFavorites(username){ // This function just returns the entire favorites array for the specified username.
  let query = "SELECT favorite_words FROM accounts WHERE username='" + username + "'";

  try{// Send the database query.
    const res = await dbConnection.query(query);

    if(typeof res.rows == 'undefined'){ //Typechecking for robustness here.
      console.log("Res.rows[0] is just undefined.");
      return "undefined";
    } else{
      return res.rows[0].favorite_words;
    }
  } catch(err){
    console.log("~~~DATABASE ERROR~~~");
    console.log(err.stack);
  }
}

function processLoginInformation(httpBody){ // This handles the base64 decryption, and splits the httpBody up by colons, which are used for serialization in WIDiK.
  return Buffer.from(httpBody, 'base64').toString().split(":");
}

app.use(cors()) // This is to circumvent CORS issues pertaining to running this locally. Once hosted in a production environment, this will have to be reevaluated as it may not be necessary anymore.
app.use(bodyParser.urlencoded({extended: false})); // This throws some middleware into the mix which parses urlencoded bodies, only looking at requests that have a Content-Type header matching the default type, and by setting extended to false, we're parsing the URL-encoded data with the querystring library.
app.use(bodyParser.json()); // Some more uses of the body parser middleware. More information on it can be found here: https://www.npmjs.com/package/body-parser.
app.use(bodyParser.text());

app.get('/', (req, res) => { //This is the root routing for the server, so if you go to the back-end server with just localhost:5000 (or whatever it is in production), you'll be sent back a random word and its associated information.
  let randomWord = "";
  getRandomWord().then(function(result){ // Waiting for the asynchronous function to resolve to its then function.
    randomWord = result[0].definition
    res.send(result[0].word + ":" + result[0].definition + ":" + result[0].examplesentence + ":" + result[0].id); // Send back a manually serialized (with colons) word, definition, the example sentence(s) and the word's ID as well.
  });
});

app.post('/login', (req, res) => { // This handles login requests, relying on the asynchronous function checkLogin.
  let decodedLoginInfo = processLoginInformation(req.get("Authorization"));
  console.log("Got a login request, with username " + decodedLoginInfo[0] + " and password " + decodedLoginInfo[1]);

  checkLogin(decodedLoginInfo[0], decodedLoginInfo[1]).then(function(result){
    // result ? res.send("Login attempt for " + decodedLoginInfo[0] + " successful.") : res.send("Login attempt for " + decodedLoginInfo[0] + " unsuccessful.\n"); // This was helpful for debugging.
    if(result){
      console.log("Login attempt for " + decodedLoginInfo[0] + " successful.");
      res.send("success");
    } else{
      console.log("Login attempt for " + decodedLoginInfo[0] + " unsuccessful.");
      res.send("failure");
    }
  });

});

app.post('/add-favorite', (req, res) => { // This just wraps up the addFavorite async function to function within /add-favorite.
  let decodedFavoriteInfo = req.get("Authorization").split(":");
  addFavorite(decodedFavoriteInfo[1], decodedFavoriteInfo[0]).then(function(result){
    console.log(decodedFavoriteInfo[1] + " has favorited word " + decodedFavoriteInfo[0] + ".");
  });
});

app.post('/get-favorites', (req, res) => { // This returns the listing of wordIDs that is assocaited with an account's favorites, wrapping up the getFavorites method.
  let username = req.get("Authorization");
  console.log("Got a get-favorites post for " + username + ".");
  getFavorites(username).then(function(result){
    if(typeof result === "string"){
      console.log("Result from this get-favorites request is " + result);
      res.send("empty");
    } else{
      let datetime = new Date();
      console.log("Result received from pulling favorite words of " + username + " is " + result.toString() + " at " + datetime); // Thsi prints a lot of text, but it's optimal to make sure that requests are being sent at the right time in development. In production, this can definitely be removed or shortened down.
      res.send(result.toString());
    }
    // console.log("Favorites for " + username + " are: " + Object.keys(result[i])); // This is just a handy debugging check for testing purposes.
    // console.log("Result from this get-favorites request is " + result); // This is just a handy debugging check for testing purposes.
  })
});

async function checkUsernameAndEmail(username, email){ //Just to bundle it all up into a conveniently asynchronous package.
  var emailResult = false;
  var usernameResult = false;

  var usernameTaken = await checkUsernameTaken(username); // This will return false if the name is free to use.
  var emailTaken = await checkEmailTaken(email); // This will return false if the email is free, only returning true if an account with this username already exists.
  // console.log("usernameTaken is " + usernameTaken + " and emailTaken is " + emailTaken); // This is a helpful debugging check that may come in handy in the future.
  if(usernameTaken == false && emailTaken == false){ // This was refactored from a ternary return statement into this, just for the sake of readability.
    return true;
  } else{
    return false;
  }
}

async function getFavoritesInformation(favoritesList){ // This asynchronously returns information about an array of word IDs.
  let query = "";

  for(let i=0; i < favoritesList.length - 1; i++){ // This bound is at -1 because of the way that it is fed an array split by a comma, there is a blank entry on the end. This could be reworked to be better about type checking.
    query = query + "(SELECT * FROM words WHERE id=" + favoritesList[i] + ")"; // This loop is creating parenthetical SQL queries, chained together by UNION statements that are added in below. This was originally implemented as STATEMENT; STATEMENT; STATEMENT, as you would with MySQL, but Postgres seems to prefer unionized parenthetical queries instead.
    if(i < favoritesList.length - 2){ // This is bound at favoritesLIst.length - 2, one less than -1, so that there will not just be a free-floating UNION statement on the end of this query.
      query = query + " UNION "; // Here is where the UNION chaining is being linked together.
    }
  }

  try{// Send the database query.
    const res = await dbConnection.query(query);
    return res.rows;
  } catch(err){
    console.log("~~~DATABASE ERROR~~~");
    console.log(err.stack);
  }
}

app.post('/get-favorites-information', (req, res) => { // This method takes in a series of integers, splits them, and then creates a unionized query for each of the integers (which correlate to word IDs), retrieves the words' information, concatenates that into a serialized string, and then returns that to the front-end.
  favoritesList = req.get('Authorization');
  splitFavoritesList = favoritesList.split(","); // Split it into individual IDs.
  let combinedWordIDs = ""; // This will be used in a moment for the actual list of word IDs, for now there is a chance of the input being formatted something like "1,,,2,3,,,4,5,", and we need to clean that up.

  for(let i = 0; i < splitFavoritesList.length; i++){ // That cleaning is being done in here.
    if(splitFavoritesList[i].length == 1){ // This ensures that no empty strings got caught up, in the case that we got sent something like "1,2,,3,,,4", which was an error spontaneously encountered during testing, likely to do with how the data was being cleaned in Favorites.js.
      combinedWordIDs = combinedWordIDs + splitFavoritesList[i] + ",";
    }
  }

  getFavoritesInformation(combinedWordIDs.split(",")).then(function(result){ // Now we feed getFavoritesInformation the cleaned word IDs list, splitting it by commas as it goes into the argument, and we wait on the async function's then callback.
    if(result){
      let combinedWords = "";
      let favoritesInformation = "";
      for(let i = 0; i < result.length; i++){ // This goes through each word that's being requested, and serializes the appropriate information to send back in the response by delineating with colons, and then finally a | character on the end of it all. This is an example of 2-dimensional serialization.
        combinedWords = combinedWords + result[i].word + ", ";
        favoritesInformation = favoritesInformation + result[i].word + ":" + result[i].definition + ":" + result[i].examplesentence + ":" + result[i].id + "|";
      }

      console.log("We have a result, it's " + combinedWords);
      console.log("Info to send back is: " + favoritesInformation);
      res.send(favoritesInformation);
    } else{
      console.log("We don't have a result");
    }
    // console.log("Got this result from the async getFavoritesInformation" + result); // This was useful for debugging, and may be again in the future.
  });
});

app.post('/signup', (req, res) => { // This handles the act of creating a new account.
  let decodedLoginInfo = processLoginInformation(req.get("Authorization"));
  console.log("\nGot a sign up request, with username " + decodedLoginInfo[0] + " and password " + decodedLoginInfo[1] + " and email " + decodedLoginInfo[2] + ".");

  checkUsernameAndEmail(decodedLoginInfo[0], decodedLoginInfo[2]).then(function(result){ // If result is true, then it means that the username and email are free to make a new account, and that the server is creating the account.
    if(result == true){
      res.send("Your account is being created!");
      createAccount(decodedLoginInfo[0], decodedLoginInfo[1], decodedLoginInfo[2]).then(function(result){ // Wait on this async function.
        if(result == true){ // Account successfully created.
          console.log("Account successfully created with username " + decodedLoginInfo[0] + ", password " + decodedLoginInfo[1] + " and email " + decodedLoginInfo[2]);
        } else{
          console.log("Account creation failed.");
        }
      });
    }else{
      res.send("Your username or email are already taken for an account."); // This will be alerted to the user by the front-end.
    }
  });
});

app.listen(port, () => { // This is some leftover boilerplate that's convenient for making sure you know what URL you should aim the front-end at.
  console.log(`WIDiK back-end listening at http://localhost:${port}`);
});