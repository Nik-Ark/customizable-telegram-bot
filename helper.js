module.exports = {
  sleep(ms) {
    return new Promise(function (resolve) {
      return setTimeout(resolve, ms);
    });
  },
};
