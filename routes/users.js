var express = require('express');
var router = express.Router();
const fs = require("fs");
const cors = require("cors"); //jag behöver köra npm install cors
router.use(cors());
var rand = require("random-key");


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
    let mail = req.body.email;
    let newsletter = false;
    if (req.body.newsletter) //om det är ikryssat så skickas "on" annars undefined
    {
        newsletter = true
    }
    let id = rand.generate(); //generera random id
    let newUser = new User(id, name, password, mail, newsletter);
    activeUser = id;
    console.log("användare från regformulär:", newUser)

    req.app.locals.myDatabase.collection("users").insertOne(newUser).then(result => {
        console.log(result);
        res.redirect("http://127.0.0.1:5500/?id=" + activeUser);
    })
});

//loggar ut
router.get('/logout', function (req, res) {
    activeUser = null;
    res.redirect("http://127.0.0.1:5500/");
});

//startvärde, problem om det används men det händer nog bara om servern startar om
let activeUser = null;

/* GET users listing. */
router.get('/activeUser', function (req, res, next) {
    res.json(activeUser);
});

//inloggning
router.post('/login', (req, res) => {
    console.log("mottaget ", req.body.name);
    req.app.locals.myDatabase.collection("users").find().toArray().then(users => {
        // console.log("alla användare", users);
        activeUser = login(users, req.body.name, req.body.pwd);
        console.log("svar", activeUser)
        res.json(JSON.stringify(activeUser));
        // res.redirect("http://127.0.0.1:5500/?id=" + activeUser)
    })
})

//en funktion som hittar användare efter id och returnerar ett objekt {namn, nyhetsbrev}
router.get('/userData/:userId', (req, res) => {
    console.log(req.params.userId);
    var query = {
        id: req.params.userId
    };
    req.app.locals.myDatabase.collection("users").findOne(query)
        .then(matchingUser => {
            let foundUser = {
                "name": matchingUser.name,
                "newsletter": matchingUser.newsletter
            }
            res.json(foundUser)
        })
})

function login(users, userNameInput, passwordInput) {
    for (index in users) {
        if (users[index].name == userNameInput && users[index].pwd == passwordInput) {
            activeUser = users[index].id;
            console.log("inloggad: ", users[index].name);
            return activeUser
        } else if (users[index].name == userNameInput) {
            // console.log("fel lösen");
            activeUser = "incorrect";
            return activeUser
            // console.log("fel lösen");
        }
    }
    //console.log("fel namn");
    activeUser = "incorrect";
    return activeUser;
}

//tar emot ett objekt med formatet {id, newsletter}
//returnerar true eller false
router.post('/changeNewsLetter', (req, res) => {
    req.app.locals.myDatabase.collection("users").updateOne({"id": req.body.id}, {$set: {"newsletter": req.body.newsletter}})
        .then(matchingUser => {console.log("tjoho", matchingUser)
        res.send(JSON.stringify(req.body.newsletter))//behöver jag egentligen skicka något?
    })
})

module.exports = router;