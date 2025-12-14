import express from 'express';

const setup = (): Promise<void> => {
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // routes

  const port = 1337;
  global.APP = app.listen(port); // global variable for teardown

  return new Promise((r) => setTimeout(r, 10000));
};

module.exports = setup;
