/**
 * `update-own` middleware
 */

import type { Core } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In update-own middleware.');

    if(!ctx.state.user){
      strapi.log.error("You are not authenticated.");
      return ctx.badRequest("You are are not authenticated.")
    }

    const params=ctx.params;
    const requestedUserId=params?.id;
    const currentUserId=ctx.state?.user?.id;
    
    if(!requestedUserId){
      strapi.log.error("Missing user ID.");
      return ctx.badRequest("Missing or invalid user ID.");
    }

    if(Number(currentUserId)!==Number(requestedUserId)){
      return ctx.unauthorized("You are not authorized to perform this action.")
    }

    const _ = require('lodash');
    ctx.request.body=_.pick(ctx.request.body,[
      "username",
      "phone",
      "birthday",
      "gender",
      "country",
      "career",
      "interest"
    ])
    await next();
  };
};
