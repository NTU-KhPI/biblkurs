const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectId;
const app = express();
const jsonParser = express.json();
const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'image') {
            cb(null, 'uploads/'); 
        } else if (file.fieldname === 'audio') {
            cb(null, 'uploads/'); 
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(express.static(`${__dirname}/public`));
app.use('/uploads', express.static(`${__dirname}/uploads`));

(async () => {
    try {
        await mongoClient.connect();
        app.locals.collection = mongoClient.db("books").collection("book");

        app.listen(3002);
        console.log("Сервер ожидает подключения...");
    } catch (err) {
        return console.log(err);
    }
})();

app.get("/api/books", async (req, res) => {
    const collection = req.app.locals.collection;
    try {
        const books = await collection.find({}).toArray();
        res.send(books);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.get("/api/books/:id", async (req, res) => {
    const collection = req.app.locals.collection;
    try {
        const id = new objectId(req.params.id);
        const user = await collection.findOne({ _id: id });
        if (user) res.send(user);
        else res.sendStatus(404);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.post("/api/books", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), jsonParser, async (req, res) => {
    if (!req.body || !req.files) return res.sendStatus(400);

    const bookName = req.body.name;
    const bookAuthor = req.body.author;
    const bookDescription = req.body.description;
    const bookTag = req.body.tag;
    const imagePath = req.files['image'][0].path; 

    let audioPath = null;
    if (req.files['audio'] && req.files['audio'][0]) {
        audioPath = req.files['audio'][0].path;
    }

    const book = {
        name: bookName,
        author: bookAuthor,
        description: bookDescription,
        tag: bookTag,
        imagePath: imagePath,
        audioPath: audioPath 
    };

    const collection = req.app.locals.collection;
    try {
        await collection.insertOne(book);
        res.send(book);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.delete("/api/books/:id", async (req, res) => {
    const collection = req.app.locals.collection;
    try {
        const id = new objectId(req.params.id);
        const result = await collection.findOneAndDelete({ _id: id });
        const book = result.value;
        if (book) res.send(book);
        else console.log("Не получилось сделать middleware delete");
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.put("/api/books", jsonParser, async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    const bookName = req.body.name;
    const bookAuthor = req.body.author;
    const bookDescription = req.body.description;
    const bookTag = req.body.tag;
    const collection = req.app.locals.collection;
    try {
        const id = new objectId(req.body.id);
        const result = await collection.findOneAndUpdate({ _id: id }, { $set: { author: bookAuthor, name: bookName, description: bookDescription, tag: bookTag } },
            { returnDocument: "after" });
        const book = result.value;
        if (book) res.send(book);
        else res.sendStatus(404);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

process.on("SIGINT", async () => {

    await mongoClient.close();
    console.log("Приложение завершило работу");
    process.exit();
});