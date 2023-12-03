const express = require("express");
const app = express();
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const mongoClient = new MongoClient("mongodb://host.docker.internal:27017");
app.use(express.static(path.join(__dirname, 'files')));
app.use(express.json());
app.use('/uploads', express.static(`${__dirname}/uploads`));
app.get('/',async(req,res)=>{
  res.sendFile(__dirname + '/files/main.html');
});
(async () => {
  try {
     await mongoClient.connect();
     app.locals.collection = mongoClient.db("books").collection("book");
     app.listen(8080);
     console.log("Сервер работает на порте 8080");
 }catch(err) {
     return console.log(err);
 } 
})();
app.get('/books', async (req, res) => {
  try { const limit = 12; 
  const books = await app.locals.collection.find({}).limit(limit).toArray();
    const booksWithFullImagePath = books.map(book => {
      return {
        ...book,
        imagePath: `${book.imagePath}`
      };
    });
    res.json(booksWithFullImagePath);
  } catch (error) {
    console.error('Ошибка при получении книг из базы данных:', error);
    res.status(500).send('Ошибка сервера');
  }
  const { ObjectId } = require('mongodb');
  app.get('/books/:id', async (req, res) => {
    try {
      const bookId = req.params.id;
      if (!ObjectId.isValid(bookId)) {
        return res.status(404).send('Неверный идентификатор книги');
      }
      const book = await app.locals.collection.findOne({ _id: new ObjectId(bookId) });
      if (!book) {
        return res.status(404).send('Книга не найдена');
      }
      res.json(book);
    } catch (error) {
      console.error('Ошибка при получении книги из базы данных:', error);
      res.status(500).send('Ошибка сервера');
    }
  });
});
