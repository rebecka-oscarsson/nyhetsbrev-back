var express = require('express');
var router = express.Router();
const cors = require("cors");
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
</form>
<a href="https://rebecka-oscarsson.github.io/nyhetsbrev/">länk till användar-vyn</a>`

//meddelande vid fel lösenord
const errorTemplate = "<p>Något gick fel med inloggningen, försök igen!</p>"

//en funktion som genererar en tabell med mailadress och prenumeration för alla användare
function makeUserList(users) {
    let userList = `
<h2>Välkommen Admin!</h2>
<h3>Dina registrerade användare:</h3>
<table>
<tr>
<th colspan ="2">Prenumererar på nyhetsbrev</th>
<tr>
  <th>Namn</th>
  <th>E-mail</th>
</tr>`
    for (user in users) {
        if (users[user].newsletter) {
            userList += `
    <tr>
      <td>${users[user].name}</td>
      <td>${users[user].mail}</td>
    </tr>`
        }
    }

    userList += `<tr>
    <th colspan ="2"><br>Prenumererar inte</th>
    <tr>
      <th>Namn</th>
      <th>E-mail</th>
    </tr>`

    for (user in users) {
        if (!users[user].newsletter) {
            userList += `
    <tr>
      <td>${users[user].name}</td>
      <td>${users[user].mail}</td>
    </tr>`
        }
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