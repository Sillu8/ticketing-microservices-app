//loaded automatically on start.
//tell webpack to poll all the different files once after every 300ms.
module.exports = {
  webpack: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
