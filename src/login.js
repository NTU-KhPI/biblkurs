
const { connectToDatabase } = require("./databaseInit");

async function loginHandler(req, res) {
  const { mail, pass } = req.body;
  try {
    console.log('Запрос на аутентификацию получен:', mail, pass);
    const collection = await connectToDatabase();

    const user = await collection.findOne({ mail, pass });

    if (user) {
      console.log('Успешная аутентификация');
      res.send('Successful login');
    } else {
      console.log('Неверные учетные данные');
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = { loginHandler };
