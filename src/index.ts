// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {
    //get the user permission routes
    const userRoutes=strapi.plugins['users-permissions'].routes['content-api'].routes;

    //set the UUID for the middleware
    const updateOwnMiddleWare='global::update-own';

    //find the route where we want to inject the middleware
    const updateUser=userRoutes.findIndex((route)=>route.handler==='user.update'&& route.method==='PUT')
    
    //helper function that will add the required keys and set them accordingly
    function initializeRoute(routes,index){
      routes[index].config.middlewares=routes[index].config.middleware||[];
      routes[index].config.policies=routes[index].config.policies||[];
    }

    //check if we found the find one route if so push our middleware on to that route
    if(updateUser){
      initializeRoute(userRoutes,updateUser);
      userRoutes[updateUser].config.middlewares.push(updateOwnMiddleWare);
    }
    // console.log(userRoutes[updateUser])
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {
    //
    strapi.server.httpServer.requestTimeout = 30 * 60 * 1000;
  },
};
