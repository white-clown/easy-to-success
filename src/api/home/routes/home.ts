// ./src/api/home/routes/home.js

'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/home',
      handler: 'home.getHomeData',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
