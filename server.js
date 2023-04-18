// Filesystem dependencies
const fs = require('fs');
const path = require('path');

// Webserver dependencies
const express = require('express');
const cors = require('cors');
const app = express();

// Database dependencies
const mongoose = require('mongoose');
const mongoDBAddr = 'mongodb://127.0.0.1/nt109webservice';
const logSchema = new mongoose.Schema({
    invokedUser: String,
    invokedFunction: String,
    invokedTime: String
})
const logModel = mongoose.model('loggerdbs', logSchema);

// Service dependencies
// Downgrade tfjs-node and tfjs to 4.1.0
// https://github.com/tensorflow/tfjs/issues/7273
const tfnode = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const figlet = require('figlet');

// Setup application serving
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/models'));
app.use(express.json({limit: '50mb'}));

// Connect to MongoDB local database
connectToDB().catch(err => console.error(err));
async function connectToDB() {
    await mongoose.connect(mongoDBAddr);
}

// Global variable
var model = undefined;

async function loadModel() {
    console.log("Initializing model...")
    
    // Comment this out if you don't have predownloaded model
    model = await mobilenet.load({
        version: 1,
        alpha: 1.0,
        modelUrl: "http://localhost:8080/model.json"
    });

    // Uncomment the line below to use online model
    // model = await mobilenet.load();

    console.log("Finished loading model.")

    const LogDB = new logModel({
        invokedUser: "self",
        invokedFunction: arguments.callee.name,
        invokedTime: Date.now()
    })
    await LogDB.save();
}

async function classify (imageString) {
    if (model != undefined) {
        console.log('Starting classification');
        // const image = fs.readFileSync(imagePath);
        // const bimg = imageString.toString('base64');
        const bimg = imageString;
        const dimg = Buffer.from(bimg, 'base64');
        const decodedImage = tfnode.node.decodeImage(dimg, 3);
    
        // const model = await mobilenet.load();
        
        const predictions = await model.classify(decodedImage);
        return predictions;
    } else {
        throw "Not finished loading model";
    }
}

app.get("/database", async (req, res, next) => {
    const results = await logModel.find();
    res.json({"reply": results});

    const LogDB = new logModel({
        invokedUser: req.socket.remoteAddress,
        invokedFunction: "GET Database",
        invokedTime: Date.now()
    })
    await LogDB.save();
});

app.get("/predict", async (req, res, next) => {
    try {
        const image = fs.readFileSync('dog.png');
        const imageString = image.toString('base64');
        results = await classify(imageString);
    }
    catch (err) {
        return next(err);
    }
    res.json({"reply": results});

    const LogDB = new logModel({
        invokedUser: req.socket.remoteAddress,
        invokedFunction: "GET Predict",
        invokedTime: Date.now()
    })
    await LogDB.save();
});

app.get("/figlet", async (req, res) => {
    console.log(req.socket.remoteAddress);
    results = figlet.textSync("Hello world", {
        horizontalLayout: 'fitted',
        verticalLayout: 'fitted'
    });
    res.json({"reply": results});

    const LogDB = new logModel({
        invokedUser: req.socket.remoteAddress,
        invokedFunction: "GET Figlet",
        invokedTime: Date.now()
    })
    await LogDB.save();
});

app.post("/database", async (req, res, next) => {
    const results = await logModel.find({
        invokedUser: req.socket.remoteAddress
    });
    res.json({"reply": results});

    const LogDB = new logModel({
        invokedUser: req.socket.remoteAddress,
        invokedFunction: "POST Database",
        invokedTime: Date.now()
    })
    await LogDB.save();
});

app.post("/predict", async (req, res, next) => {
    try {
        imageString = req.body['image'];
        results = await classify(imageString);
    }
    catch (err) {
        return next(err);
    }
    res.json({"reply": results});

    const LogDB = new logModel({
        invokedUser: req.socket.remoteAddress,
        invokedFunction: "POST Predict",
        invokedTime: Date.now()
    })
    await LogDB.save();
});

app.post("/figlet", async (req, res, next) => {
    try {
        request_body = req.body;
        results = figlet.textSync(request_body['text'], {
            horizontalLayout: 'full',
            verticalLayout: 'full'
        });
    }
    catch (err) {
        results = {
            "error_message": "Invalid POST request"
        }
    }
    res.json({"reply": results});

    const LogDB = new logModel({
        invokedUser: req.socket.remoteAddress,
        invokedFunction: "POST Figlet",
        invokedTime: Date.now()
    })
    await LogDB.save();
})

app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"));
});

// Start server
const server = app.listen(8080, "localhost", async () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log(`Serving on ${host}:${port}`);

    await loadModel(); // Load DL model
})
