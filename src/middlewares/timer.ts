/**
 * `timer` middleware
 */

import type { Core } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    // strapi.log.info('In timer middleware.');

    // const start = Date.now();
    // await next();
    // const delta = Math.ceil(Date.now() - start);
    // ctx.set('X-Response-Time', delta + 'ms');
  };
};
