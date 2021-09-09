//jshint esversion:6

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const saltRounds = 10;
let port = 4000;


app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    token: String
});

const User = new mongoose.model("User", userSchema);


app.post("/register", async(req, res) => {

    console.log("come in register.........")
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

        const newUser = new User({
            email: req.body.email,
            password: hash
        });

        newUser.save();


        //create user token

        const token = jwt.sign({ user_id: newUser._id, email: newUser.email },
            process.env.TOKEN_KEY, {
                expiresIn: "2h",
            });

        //save user token

        newUser.token = token;

        //return user

        res.status(201).json(newUser);

    });



});

app.post("/login", async(req, res) => {

    const username = req.body.email;
    const password = req.body.password;

    User.findOne({ email: username }, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if (result === true) {
                        res.send("Badhai ho");
                    } else {
                        res.send("incorrect password");
                    }
                });
            }
        }
    });
});

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});


app.listen(port, function() {
    console.log(`Server has started on port ${port}`);
});