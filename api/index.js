const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const imageDownloader = require('image-downloader');
app.use(express.json());

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "cdjkcdmkcsdcdscsdcsd";

app.use(
	cors({
		credentials: true,
		origin: "http://localhost:5173",
	})
);
app.use(cookieParser);

if (!process.env.MONGO_URI) {
	console.error("MONGO_URI is not defined in the .env file");
	process.exit(1);
}

mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
	})
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("Could not connect to MongoDB", err));

app.get("/test", (req, res) => {
	res.send("Hello World");
});
app.post("/register", async (req, res) => {
	const { name, email, password } = req.body;
	try {
		const userDoc = await User.create({
			name,
			email,
			password: bcrypt.hashSync(password, bcryptSalt),
		});
		res.json(userDoc);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "An error occurred" });
	}
});

app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	const userDoc = await User.findOne({ email });
	if (userDoc) {
		if (bcrypt.compareSync(password, userDoc.password)) {
			jwt.sign(
				{ email: userDoc.email, id: userDoc._id},
				jwtSecret,
				{},
				(err, token) => {
					if (err) throw err;
					res.cookie("token", token).json(userDoc);
				}
			);
		} else {
			res.status(422).json("password not okay!");
		}
	} else {
		res.status(404).json("not found");
	}
});

app.get("/profile", async (req, res) => {
	const { token } = req.cookies;
	if (token) {
		jwt.verify(token, jwtSecret, {}, async(err, userData) => {
			if (err) throw err;
            const {name, email, _id} = await User.findById(userData.id);
			res.json({name, email, _id});
		});
	} else {
		res.json(null);
	}
	res.json({ token });
});

app.post("/logout", (req, res) => {
	res.cookie('token', '').json(true);
});

app.post("/upload-by-link", async (req, res) => {
	const {link} = req.body;
	const newName = Date.now() + '.jpg';
	await imageDownloader.image({
		url: link,
		dest: __dirname + '/uploads',
	}).then(() => {
		res.json(__dirname + '/uploads/' + newName);
	}).catch((err) => console.error(err));
});

app.listen(4000, () => {
	console.log(`Server is running on port ${4000}`);
});
