const teardown = (): Promise<void> => {
  return new Promise((resolve) => {
    if (global.APP) {
      global.APP.close(() => {
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = teardown;
