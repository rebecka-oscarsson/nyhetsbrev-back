var express = require('express');
var router = express.Router();
const cors = require("cors");
router.use(cors());

//globala variabler
const adminId = "topphemligtId"
const pwd = "admin";
let loggedIn = null;

//inloggningsformulär
const loginTemplate = `<link rel="stylesheet" href="https://rebecka-oscarsson.github.io/nyhetsbrev/stylesheets/style.css">
<h2>Admin login</h2>
<form method="post" class ="admin" action="/">
<label for="password">Lösenord:</label>
<input class = admin type="password" name="pwd" required>
<br>
<button type="submit">logga in</button>
<br><br>
<a href="https://rebecka-oscarsson.github.io/nyhetsbrev/" class="admin">länk till användar-vyn</a>
</form>
<br>`


//meddelande vid fel lösenord
const errorTemplate = "<p>Något gick fel med inloggningen, försök igen!</p>"

//en funktion som genererar en tabell med mailadress och prenumeration för alla användare
function makeUserList(users) {
    let userList = `<link rel="stylesheet" href="https://rebecka-oscarsson.github.io/nyhetsbrev/stylesheets/style.css">
<h2>Välkommen Admin!</h2>
<h3 class = "admin">Dina registrerade användare:</h3>
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
    
    userList += `</table><br><form class = "admin" method="get" action="/logout">
    <button type="submit">logga ut</button></form>
    `
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