var express = require('express');
var router = express.Router();
const cors = require("cors"); //jag behöver köra npm install cors
router.use(cors());

let adminId = "topphemligtId"
let pwd = "admin";
let loggedIn = null;
let url = "http://localhost:3000";

const loginTemplate = `<h2>Admin login</h2>
<form id="loginForm" method="post" action="/admin">
<label for="password">Lösenord:</label>
<input type="password" id="password" name="pwd" required>
<button id="loginBtn" type="submit">logga in</button>
</form>`

const errorTemplate = "<p>Något gick fel med inloggningen, försök igen!</p>"

//en funktion som genererar en tabell med mailadress och prenumeration för alla användare
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
    userList += `</table> <a href="${url}/admin/logout">logga ut</a>`
    return userList;
}

router.get('/logout', (req, res) => {
    loggedIn = null;
    res.redirect("/admin")
})

//hämtar startsidan, visar olika beroende på om admin är inloggad
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