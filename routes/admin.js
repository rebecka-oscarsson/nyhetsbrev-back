var express = require('express');
var router = express.Router();
const cors = require("cors"); //man behöver köra npm install cors
router.use(cors());

//globala variabler
const adminId = "topphemligtId"
const pwd = "admin";
let loggedIn = null;

//inloggningsformulär
const loginTemplate = `<h2>Admin login</h2>
<form id="loginForm" method="post" action="/">
<label for="password">Lösenord:</label>
<input type="password" id="password" name="pwd" required>
<button id="loginBtn" type="submit">logga in</button>
</form>`

//meddelande vid fel lösenord
const errorTemplate = "<p>Något gick fel med inloggningen, försök igen!</p>"

//en funktion som genererar en tabell med mailadress och prenumeration (ja/nej) för alla användare
function makeUserList(users) {
    let newsletter;
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
    userList += `</table><br><form id="logoutForm" method="get" action="/logout">
    <button id="logoutBtn" type="submit">logga ut</button>`
    return userList;
}

//utloggning
router.get('/logout', (req, res) => {
    loggedIn = null;
    res.redirect("/")
})

//hämtar startsidan, visar olika vyer beroende på om admin är inloggad eller ej
router.get('/', (req, res) => {
    if (loggedIn == adminId) {
        req.app.locals.myDatabase.collection("users").find().toArray().then(users => {
            let userList = makeUserList(users)
            res.send(userList);
        })
    } else {
        res.send(loginTemplate)
    }
})

//inloggning
router.post('/', (req, res) => {
    if (req.body.pwd == pwd) {
        loggedIn = adminId;
        req.app.locals.myDatabase.collection("users").find().toArray().then(users => {
            let userList = makeUserList(users)
            res.send(userList);
        })
    } else {
        loggedIn = null;
        res.send(loginTemplate + errorTemplate);
    }
})

module.exports = router;