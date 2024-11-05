/**
 * podcast router
 */

import { factories } from '@strapi/strapi';
import customBlogRoutes from '../../blog/routes/blog';
import routes from '../../user-registration/routes/routes';
import path from 'path';
'use strict';
// const coreRoutes=factories.createCoreRouter('api::podcast.podcast');
const customPodcastRoutes={
    routes:[
        {
            //get all Podcast
            method:'GET',
            path:'/podcasts/all',
            handler: 'podcast.getPodcast',
        },
        {
            //get all SavedPodcast
            method:'GET',
            path:'/podcasts/saved',
            handler:'podcast.getSavedPodcast'
        },
        {
            //like a Podcast
          method: 'POST',
          path: '/podcasts/:id/like',
          handler: 'podcast.likePodcast',
          config: {
            policies: [],
            middlewares: [],
          },
        },
        {
            //comment a Podcast
          method: 'POST',
          path: '/podcasts/:id/comment',
          handler: 'podcast.commentPodcast',
          config: {
            policies: [],
            middlewares: [],
          },
        },
        {
          //Get the Podcast relative comments
          method: 'GET',
          path: '/podcasts/:id/comment',
          handler: 'podcast.getPodcastComment',
          config: {
            policies: [],
            middlewares: [],
          },
        },
        {
            //save a blog
            method: 'PUT',
            path: '/podcasts/:id/save',
            handler: 'podcast.savePodcast',
            config: {
              policies: [],
              middlewares: [],
            },
          },
          {
            //unsave a blog
            method: 'PUT',
            path: '/podcasts/:id/unsave',
            handler: 'podcast.unsavePodcast',
            config: {
              policies: [],
              middlewares: [],
            },
          },
    ]
}
export default customPodcastRoutes;
