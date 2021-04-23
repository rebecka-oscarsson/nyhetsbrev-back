var express = require('express');
var router = express.Router();
const cors = require("cors");
const crypto = require("crypto-js");
router.use(cors());
var rand = require("random-key");
const saltKey = "nfmbO9Fl8VvSmBbMrfNBUO76FTvmOgWJ"; //nyckel för att kryptera lösenord


//en klass som jag kan använda för att skapa objekt
class User {
    constructor(id, name, password, mail, newsletter) {
        this.id = id;
        this.name = name;
        this.pwd = password;
        this.mail = mail
        this.newsletter = newsletter;
    };
};

// funktion för att rega ny användare
router.post('/', (req, res) => {
    let name = req.body.name;
    let password = req.body.pwd;

    let secretPassword = crypto.AES.encrypt(password, saltKey).toString();
    let mail = req.body.email;
    let newsletter = false;
    if (req.body.newsletter) //om det är ikryssat kommer "on" från formuläret annars undefined
    {
        newsletter = true;
    }
    let id = rand.generate();
    let newUser = new User(id, name, secretPassword, mail, newsletter);
    let activeUser = id;

    req.app.locals.myDatabase.collection("users").insertOne(newUser).then(()=> {
        res.json(JSON.stringify(activeUser));
    })
});

//hämtar alla användare från databas och skickar in som parameter i login-funktionen.
//returnerar id för inloggad användare
router.post('/login', (req, res) => {
    req.app.locals.myDatabase.collection("users").find().toArray().then(users => {
        let activeUser = login(users, req.body.name, req.body.pwd);
        res.json(JSON.stringify(activeUser));
    })
})

//hittar användare med rätt id och returnerar ett objekt {namn, nyhetsbrev}
router.get('/userData/:userId', (req, res) => {
    var query = {
        id: req.params.userId
    };
    req.app.locals.myDatabase.collection("users").findOne(query)
        .then(matchingUser => {
            let foundUser
            if (matchingUser) {
                foundUser = {
                    "name": matchingUser.name,
                    "newsletter": matchingUser.newsletter
                }
            } else {
                foundUser = {
                    "name": "okänd användare",
                    "newsletter": false
                }
            }
            res.json(foundUser)
        })
})


//kontrollerar skickat användarnamn och lösenord i databasen, returnerar användar-id om korrekt
function login(users, userNameInput, passwordInput) {
    for (index in users) {
        let originalPwd = crypto.AES.decrypt(users[index].pwd, saltKey).toString(crypto.enc.Utf8);
        if (users[index].name == userNameInput && originalPwd == passwordInput) {
            let activeUser = users[index].id;
            console.log("inloggad: ", users[index].name);
            return activeUser
        } else if (users[index].name == userNameInput) {
            let activeUser = "incorrect"; //fel lösenord;
            return activeUser
        }
    }
    let activeUser = "incorrect";//fel användarnamn;
    return activeUser;   
}

//tar emot ett objekt med formatet {id, newsletter}
//returnerar true eller false
router.post('/changeNewsLetter', (req, res) => {
    req.app.locals.myDatabase.collection("users").updateOne({
            "id": req.body.id
        }, {
            $set: {
                "newsletter": req.body.newsletter
            }
        })
        .then(res.send(JSON.stringify(req.body.newsletter))
        )
})

module.exports = router;