/**
 * blog service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::blog.blog',({ strapi }) =>  ({

    async filterCondition(ctx){
         //filter if need
         const { categories, keyword } = ctx.query;
         // construct filter
         const filters: { [key: string]: any } = {} = {};
         if (categories) {
           filters.categories = { name:{$contains: categories }};  // filter category
         }
         if (keyword) {
           filters.title = { $contains: keyword };  // filter keyword
           // filters.content = { $contains: keyword };
         }
         return filters;
    },
    async getBlogWithLikeAndComment(blogs){
        const blogWithCountsAndSaveStatus = await Promise.all(
            blogs.map(async (blog) => {
              // get the current blog like count
              const likeCount = await strapi.entityService.count('api::like.like', {
                filters: {
                  blog: {
                    id: {
                      $eq: blog.id,  // 明确指定 $eq 来匹配 ID
                    },
                  },
                },
              });
      
              // get the current blog comment count
              const commentCount = await strapi.documents('api::comment.comment').count( {
                filters: {
                  blog: {
                    id: {
                      $eq: blog.id,  // 明确指定 $eq 来匹配 ID
                    },
                  },
                },
              });
              return {
                data:{
                  id:blog.id,
                  documentId:blog.documentId,
                  title:blog.title,
                  author: blog.author,
                  coverPhoto: blog.coverPhoto,
                  categories: blog.categories,
                  likeCount,
                  commentCount,
                },
              };
            })
          );
        return blogWithCountsAndSaveStatus;
    }
}));
