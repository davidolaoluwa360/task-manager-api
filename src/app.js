const express = require('express');
const app = express();
require('./db/mongoose');

//* imports required routes
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');

//* configure the port for both heroku and local development
const port = process.env.PORT;

//* configure express body-parser to parse a json
app.use(express.json());

//* register all routes

//* middleware for maintenance mode
if (process.env.MAINTENACE_MODE === 'true') {
  app.use((req, res, next) => {
    return res.status(503).send('Sorry in maintenance mode');
  });
}

app.use(userRoutes);
app.use(taskRoutes);

//* create a server and open a connection to the configured port
app.listen(port, () => {
  console.log('Server running on port: http://localhost:' + port);
});
