/**
 * podcast controller
 */

import { factories } from '@strapi/strapi'
import podcast from '../routes/podcast';
import category from '../../category/controllers/category';

export default factories.createCoreController('api::podcast.podcast',{
    //Get All Podcast
    async getPodcast(ctx){
        try{
            const podcasts=await strapi.entityService.findMany("api::podcast.podcast",{
                populate:{
                    audioFile:true,
                    category:{
                        fields:['name']
                    },
                    coverPhoto:true
                }
            })as any;
            // console.log(podcasts)
            if(podcasts.length===0){
                return ctx.send({
                    message: 'No Podcast Found',
                });
            }
            const podcastWithCount = await Promise.all(
                podcasts.map(async (podcast) => {
                  // get the current podcast like count
                  const likeCount = await strapi.entityService.count('api::like.like', {
                    filters: {
                      podcast: {
                        id: {
                          $eq: podcast.id,  // 明确指定 $eq 来匹配 ID
                        },
                      },
                    },
                  });
          
                  // get the current blog comment count
                  const commentCount = await strapi.entityService.count('api::comment.comment', {
                    filters: {
                        podcast: {
                        id: {
                          $eq: podcast.id,  // 明确指定 $eq 来匹配 ID
                        },
                      },
                    },
                  });
                  return {
                    data:{
                      title:podcast.title,
                      author: podcast.author,
                      coverPhoto: podcast.coverPhoto,
                      audioFile:podcast.audioFile,
                      category: podcast.category,
                      likeCount,
                      commentCount,
                    },
                  };
                })
              );
              return podcastWithCount

        }catch (error) {
            strapi.log.error('Get Podcast Failed:', error);
            return ctx.internalServerError('Get Podcast Failed');
      }
    },
    //Get Saved Podcast
    async getSavedPodcast(ctx){
      try{
        const user=ctx.state.user;
        if(!user){
          return ctx.unauthorized('User not authorized')
        }
        const podcasts=await strapi.entityService.findMany("api::podcast.podcast",{
          filters:{
            save_by:user.id
          },
          populate:{
              audioFile:true,
              category:{
                  fields:['name']
              },
              coverPhoto:true
          }
        })as any;
        if(podcasts.length===0){
          return ctx.send({
            message:"No Podcast Saved"
          })
        }
        const podcastWithCount=await Promise.all(
          podcasts.map(async(podcast)=>{
            //get the podcast like count
            const likeCount=await strapi.entityService.count('api::like.like',{
              filters:{
                podcast:{
                  id:{
                    $eq:podcast.id
                  }
                }
              }
            });
            //get the podcast comment count
            const commentCount= await strapi.entityService.count('api::comment.comment',{
              filters:{
                podcast:{
                  id:{
                    $eq:podcast.id
                  }
                }
              }
            });

            return{
              data:{
                title:podcast.title,
                author: podcast.author,
                coverPhoto: podcast.coverPhoto,
                audioFile:podcast.audioFile,
                category: podcast.category,
                likeCount,
                commentCount,
              }
            }
          })
        );
        return podcastWithCount;
      }catch(error){
          strapi.log.error('Get Saved Podcast Failed:',error);
          return ctx.internalServerError('Get Saved Podcast Failed')
      }
    },
    // Like a Podcast
    async likePodcast(ctx) {
      try {
        const { id } = ctx.params;
        const user = ctx.state.user;
  
        if (!user) {
          return ctx.unauthorized('User not registered');
        }
  
        const podcast = await strapi.entityService.findOne('api::podcast.podcast', id);
  
        if (!podcast) {
          return ctx.notFound('Podcast not found');
        }
  
        // check if current user has already liked this podcast
        const existingLike = await strapi.entityService.findMany('api::like.like', {
          // fields:['id'],
          filters: { podcast: id, user: user.id },
        })as any;

        if (existingLike.length > 0) {
          // return ctx.badRequest('Already liked');
          //action to dislike...
          
          const removeId=existingLike.map(like => like.id)
          // console.log(removeId)
          const removeLike=await strapi.entityService.delete('api::like.like',removeId);
          console.log(removeLike)
          return ctx.send({removeLike,message:'Unlike'})
        }
  
  
        // createLikes
        const createLikes = await strapi.entityService.create('api::like.like',  {
          data: { 
            user:user.id,
            podcast:id
          },
        });
  
        return ctx.send(createLikes);
      } catch (error) {
        strapi.log.error('Like failed', error);
        return ctx.internalServerError('Liked failed');
      }
    },
  
    // Comment Podcast
    async commentPodcast(ctx) {
      try {
        const { id } = ctx.params;
        const {content} = ctx.request.body;
        const user = ctx.state.user;
  
        if (!user) {
          return ctx.unauthorized('User not registered');
        }
        console.log(ctx.request.body)
 
        if (!content) {
          return ctx.badRequest('Content cannot be blank');
        }
  
        const podcast = await strapi.entityService.findOne('api::podcast.podcast', id, {
          populate: ['comments'],
        });
  
        if (!podcast) {
          return ctx.notFound('Podcast not found');
        }
  
        // create a comment
        const comment = await strapi.entityService.create('api::comment.comment', {
          data: {
            content,
            usercomment: user.id,
            podcast: id,
          },
        });
  
        return ctx.send(comment);
      } catch (error) {
        strapi.log.error('Comment Failed:', error);
        return ctx.internalServerError('Comment Failed');
      }
    },

    //Get the Podcast relative comment
    async getPodcastComment(ctx){
      try{
        const {id}=ctx.params;
        const user=ctx.state.user;

        if(!user){
          return ctx.unauthorized("User not authorized")
        }

        const comment=await strapi.entityService.findMany('api::comment.comment',{
          filters:{
            podcast:id
          }
        })
        if(comment.length===0){
          return {message:"No Comments"}
        }
        return comment;
      }catch(error){
        strapi.log.error('Get Podcast Comment Failed:', error);
        return ctx.internalServerError('Get Podcast Comment Failed');
      }
    },

    // Save Podcast
    async savePodcast(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('User not authorized');
      }

      // Check Podcast is exist
      const podcast = await strapi.entityService.findOne('api::podcast.podcast', id);
      if (!podcast) {
        return ctx.notFound('Podcast not found');
      }

      // 获取用户的完整信息，包括已保存的博客
      const userWithSavedPodcast = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
        populate: ['podcasts']
      }) as any;

      // check if the blod has already saved
      const isAlreadySaved = userWithSavedPodcast.saveBlog.some(podcasts => podcasts.id === podcast.id);
      // const isAlreadySaved=await strapi.entityService.findMany('plugin::users-permissions.user',{
      //   filters:{
      //       saveBlog:id
      //   }
      // })
      if (isAlreadySaved) {
        // console.log(userWithSavedBlogs.saveBlog)
        return ctx.badRequest('Podcast has already save');
      }


 
      // console.log(userWithSavedBlogs)
      const arrr=[...userWithSavedPodcast.saveBlog.map(p=>p.id),podcast.id]as any


      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          saveBlog:arrr
        },
        populate: ['podcasts'],
      })as any;
      console.log(updatedUser)
      return ctx.send({
        message: 'Podcast saved',
        // saveBlog: updatedUser.saveBlog,
      });
    },

    // Unsave Podcast
    async unsavePodcast(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('User not register');
      }

      // check if podcast is exit
      const podcast = await strapi.entityService.findOne('api::podcast.podcast', id);
      if (!podcast) {
        return ctx.notFound('Podcast not found');
      }

      const userWithSavedPodcast = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
        populate: ['podcasts'],
      })as any;

      // check if the podcast hasn't save
      const isSaved = userWithSavedPodcast.saveBlog.some(podcasts => podcasts.id === podcast.id);
      if (!isSaved) {
        return ctx.badRequest('Podcast has not saved yet');
      }

      // filter the podcast that want to unsave
      const updatedSavedPodcast = userWithSavedPodcast.saveBlog.filter(podcasts => podcasts.id !== podcast.id).map(p => p.id);

      // update user 
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          podcasts: updatedSavedPodcast,
        },
        populate: ['podcasts'],
      })as any;

      return ctx.send({
        message: 'Podcast unsave',
        saved_by: updatedUser.podcasts,
      });
    },

});
