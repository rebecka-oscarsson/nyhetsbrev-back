var express = require('express');
var router = express.Router();
const cors = require("cors"); //jag behöver köra npm install cors
router.use(cors());

let username = "admin";
let pwd = "admin";

const loginTemplate = `<h2>Admin login</h2>
<form id="loginForm" method="post" action="/admin/login">
<label for="username">Användare (=admin):</label>
<input type="text" id="username" name="name" required>
<label for="password">Lösenord (=admin):</label>
<input type="password" id="password" name="pwd" required>
<button id="loginBtn" type="submit">logga in</button>
</form>`

const errorTemplate = "<p>Något gick fel med inloggningen, försök igen!</p>"


//en funktion som genererar en tabell med mailadress och prenumeration för alla användare
function makeUserList(users){
let newsletter;
console.log("alla användare", users);
let userList = `
<h2>Välkommen Admin!</h2>
<h3>Dina registrerade användare:</h3>
<table>
<tr>
  <th>Mailadress</th>
  <th>Nyhetsbrev?</th>
</tr>`
    for (user in users) {
        if (users[user].newsletter) {
            newsletter = "ja"
        } else {
            newsletter = "nej"
        }
        userList += `
    <tr>
      <td>${users[user].mail}</td>
      <td>${newsletter}</td>
    </tr>`
    }
    userList += `</table> <a href="http://localhost:3000/admin/">logga ut</a>`
    return userList;
}

//hämtar startsidan
router.get('/', (req, res) => {
    res.send(loginTemplate)
})

//inloggning
router.post('/login', (req, res) => {
    let loggedIn
    if (req.body.name == username && req.body.pwd == pwd) {
        loggedIn = true;
        req.app.locals.myDatabase.collection("users").find().toArray().then(users => {
            let userList = makeUserList(users)
            res.send(userList);
        })
    } else {
        loggedIn = false;
        res.send(loginTemplate + errorTemplate);
    }
})

//en funktion som hämtar alla användare från databasen och kör funktionen makeUserlist 
// router.get('/welcome', (req, res) => {
//     req.app.locals.myDatabase.collection("users").find().toArray().then(users => {
//         let userList = makeUserList(users)
//         res.send(userList)
//     })
// })

module.exports = router;