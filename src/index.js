const dotenv = require('dotenv').config();
const app = require('./app');

if (dotenv.error) throw dotenv.error;

const port = process.env.EXPRESS_PORT;

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});