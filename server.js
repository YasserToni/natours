const mongoose = require('mongoose');
const dotnev = require('dotenv');

// process.on('uncaughtException', (err) => {
//   // console.log(err.name, err.message);
//   console.log('uncaught exception 💥 Shutting down...');
//   console.log(err.name, err.message);
//   process.exit(1);
// });

dotnev.config({ path: './config.env' });
const app = require('./app');

// data server URL
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// connect to dat server
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  });

const port = process.env.PORT || 3000;
// const server =
app.listen(port, () => {
  console.log(`App is running in port ${port} ...`);
});

// process.on('unhandledRejection', (err) => {
//   console.log('unhandledRejection 💥 Shutting down...');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
