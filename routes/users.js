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

//funktion för att rega ny användare
router.post('/', (req, res) => {
    let name = req.body.name;
    let password = req.body.pwd;
    let mail = req.body.email;
    let newsletter = false;
    if(req.body.newsletter)//om det är ikryssat så skickas "on" annars undefined
    {newsletter = true}
    let id = rand.generate(); //generera random id
    let newUser = new User(id, name, password, mail, newsletter);
    console.log("användare från regformulär:", newUser)
    activeUser = id;


    fs.readFile("users.json", function (err, data) {
        if (err) {
            console.log(err);
        }

        let users = JSON.parse(data);
        users.push(newUser);

        fs.writeFile("users.json", JSON.stringify(users, null, 2), function (err) {
            if (err) {
                console.log(err);
            }
        })

    })
    res.redirect("http://127.0.0.1:5500/?id=" + activeUser); //redirectar till roten
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
    console.log("från formuläret kommer ", req.body.name);
    fs.readFile("users.json", function (err, data) {
        if (err) {
            console.log(err);
            if (err.code == "ENOENT") {
                console.log("Vi har tappat bort den filen");
            }
        }
        activeUser = login(JSON.parse(data), req.body.name, req.body.pwd);
        res.redirect("http://127.0.0.1:5500/?id=" + activeUser); //skickar tillbaka användare i parameter. ska ändras till id
    });
});

//en funktion som hittar användare efter id och returnerar ett objekt {namn, nyhetsbrev}
router.get('/userData/:userId', (req, res) => {
            fs.readFile("users.json", function (err, data) {
                if (err) {
                    console.log(err);
                }

                let users = JSON.parse(data);

                const matchingUser = users.find(user => user.id == req.params.userId);
                let foundUser  = {
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
            fs.readFile("users.json", function (err, data) {
                if (err) {
                    console.log("error :", err);
                }

                let users = JSON.parse(data);

                const matchingUser = users.find(user => user.id == req.body.id);
                if (!matchingUser) {res.send("error")}
                //det här är som en api-nyckel. skickar man ett id som inte finns kan man inte ändra i databasen
                let newSetting = req.body.newsletter;
                matchingUser.newsletter= newSetting;           

                fs.writeFile("users.json", JSON.stringify(users, null, 2), function (err) {
                    if (err) {
                        console.log(err);
                    }
                })        
                res.send(JSON.stringify(matchingUser.newsletter))
            })
        })

        module.exports = router;