/**
 * blog controller
 */

import { factories } from '@strapi/strapi'
import { title } from 'process';
export default factories.createCoreController('api::blog.blog',{
    //delete 
    async delete(ctx,next){
      const {id}=ctx.params;
      await strapi.query('api::blog.blog').delete({where:{id:id}})
      return 'delete success';
    },
    // get all blogs（分页、过滤、排序等由 Strapi 内置）
    async getBlogs(ctx) {
      // try {
      //   const { query } = ctx;
        
      //   const likeCount = await strapi.entityService.count('api::like.like');
      //   const commentCount= await strapi.entityService.count('api::comment.comment')
      //   const blogs = await strapi.entityService.findMany('api::blog.blog', {
      //     ...query,
      //     like_count:likeCount,
      //     comment_count:commentCount,
      //     fields:['author'],
      //     populate: {
      //       coverPhoto:true,
      //       categories:true
      //     },
      //     sort: { createdAt: 'desc' },
      //   });
  
      //   return ctx.send(blogs);
      // } catch (error) {
      //   strapi.log.error('Get Blog Failed:', error);
      //   return ctx.internalServerError('Get Blog Failed');
      // }
      try {
        const cache = require('../../../../config/cache').default;

        // const mykeys = cache.keys();
        // console.log( mykeys );
        
        // cache.flushAll()
        //define cache Key
        const cacheKey = 'all_blogs';

        const cachedBlogs = cache.get(cacheKey);
        // console.log(cachedBlogs)
        //check if there data in cache
        if (cachedBlogs!==undefined) {
          console.log("Using cache")
          return cachedBlogs; // 从缓存中返回数据
        }
        const blogService = strapi.service('api::blog.blog');

        // console.log(filters)
        const blogs = await strapi.documents('api::blog.blog').findMany( {
          //filter if require
          filters:await blogService.filterCondition(ctx),
          populate: {
            likes:true,
            comments:true,
            coverPhoto:true,
            categories:{
              fields:['name']
            },
          },
          sort: { createdAt: 'desc' },
          // limit: 10, // 根据需求调整
        })as any;
        // console.log(blogs)
    
        const blogWithCountsAndSaveStatus = blogService.getBlogWithLikeAndComment(blogs)

        //set data to the cache
        // console.log('setting cache')
        // console.log(cacheKey)
        // console.log(cache)
        cache.set(cacheKey, await blogWithCountsAndSaveStatus);

        return blogWithCountsAndSaveStatus
      } catch (error) {
        strapi.log.error('Get All Blog Failed:', error);
        return ctx.internalServerError('Get All Blog Failed');
      }
    },
  
    // Get Recent Blog 
    async getRecentBlogs(ctx) {
      try {
        const blogService = strapi.service('api::blog.blog');
        const filters=await blogService.filterCondition(ctx);

        const blogs = await strapi.entityService.findMany('api::blog.blog', {
          filters:filters,
          populate: {
            likes:true,
            comments:true,
            coverPhoto:true,
            categories:{
              fields:['name']
            },
          },
        sort: { createdAt: 'desc' },
        // limit: 10, // 根据需求调整
        })as any;
        const blogWithCountsAndSaveStatus = blogService.getBlogWithLikeAndComment(blogs)

        return blogWithCountsAndSaveStatus
      } catch (error) {
        strapi.log.error('Get Recent Blog Failed:', error);
        return ctx.internalServerError('Get Recent Blog Failed');
      }
    },
  
    // Get saved blogs
    async getSavedBlogs(ctx) {
      try {
        const blogService=strapi.service('api::blog.blog')
        const user = ctx.state.user;
  
        if (!user) {
          return ctx.unauthorized('User not Authorized');
        }
        
        // const userWithSavedBlogs = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
        //   populate: ['savedBlogs.coverPhoto', 'savedBlogs.author', 'savedBlogs.categories'],
        // });
  
        // const savedBlogs = userWithSavedBlogs.savedBlogs || [];

        const filters=blogService.filters(ctx)

        // get all saved blogs
        const blogs = await strapi.entityService.findMany('api::blog.blog', {
          filters:{
            filters,
            saved_by:user.id
          },
          populate: {
            likes:true,
            comments:true,
            coverPhoto:true,
            categories:{
              fields:['name']
            },
          }
        })as any;

        const blogWithCountsAndSaveStatus = blogService.getBlogWithLikeAndComment(blogs)

        if(blogWithCountsAndSaveStatus.length===0){
          return ctx.send({
            message: 'No Blog save yet',
          });
        }
        return blogWithCountsAndSaveStatus
      } catch (error) {
        strapi.log.error('Get Blog saved Failed:', error);
        return ctx.internalServerError('Get Blog save Failed');
      }
    },
  
    // Like a Blog
    async likeBlog(ctx) {
      try {
        const { id } = ctx.params;
        const user = ctx.state.user;
  
        if (!user) {
          return ctx.unauthorized('User not registered');
        }
  
        const blog = await strapi.entityService.findOne('api::blog.blog', id);
  
        if (!blog) {
          return ctx.notFound('Blog not found');
        }
  
        // check if current user has already liked this blog
        const existingLike = await strapi.entityService.findMany('api::like.like', {
          filters: { blog: id, user: user.id },
        })as any;

        if (existingLike.length > 0) {
          // return ctx.badRequest('Already liked');
          //action to dislike...
          const removeId=existingLike.map(like => like.id)
          // console.log(removeId)
          const removeLike=await strapi.entityService.delete('api::like.like',removeId);
          console.log(removeLike)
          return ctx.send({message:'Unlike'})
        }
  
  
        // createLikes
        const createLikes = await strapi.entityService.create('api::like.like',  {
          data: { 
            user:user.id,
            blog:id
          },
        });
  
        return ctx.send({message:'like'});
      } catch (error) {
        strapi.log.error('Like failed', error);
        return ctx.internalServerError('Liked failed');
      }
    },
  
    // Comment Blog
    async commentBlog(ctx) {
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
  
        const blog = await strapi.entityService.findOne('api::blog.blog', id, {
          populate: ['comments'],
        });
  
        if (!blog) {
          return ctx.notFound('Blog not found');
        }
  
        // create a comment
        const comment = await strapi.entityService.create('api::comment.comment', {
          data: {
            content,
            usercomment: user.id,
            blog: id,
          },
        });
  
        return ctx.send(comment);
      } catch (error) {
        strapi.log.error('Comment Failed:', error);
        return ctx.internalServerError('Comment Failed');
      }
    },

    //Get Blog relative Comments
    async getBlogComment(ctx){
      try{
        const {id}=ctx.params;
        const user=ctx.state.user;
        if(!user){
          return ctx.unauthorized('User not Authorized')
        }
        const comment=await strapi.documents('api::comment.comment').findMany({
          filters:{
            blog:id
          }
        });
        if(comment.length===0){
          return {message:"No Comment"}
        }
        return comment;
      }catch(error){
        strapi.log.error('Get Blog Comments Failed:',error);
        return ctx.internalServerError('Get Blog Comments Failed')
      }
    },
    // Save Blog
    async saveBlog(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('User not authorized');
      }

      // 查找博客是否存在
      const blog = await strapi.entityService.findOne('api::blog.blog', id);
      if (!blog) {
        return ctx.notFound('Blog not found');
      }

      // 获取用户的完整信息，包括已保存的博客
      const userWithSavedBlogs = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
        populate: ['saveBlog']
      }) as any;

      // 检查博客是否已经被保存
      const isAlreadySaved = userWithSavedBlogs.saveBlog.some(savedBlog => savedBlog.id === blog.id);
      // const isAlreadySaved=await strapi.entityService.findMany('plugin::users-permissions.user',{
      //   filters:{
      //       saveBlog:id
      //   }
      // })
      if (isAlreadySaved) {
        // console.log(userWithSavedBlogs.saveBlog)
        return ctx.badRequest('Blog has already save');
      }


      // function update(arr,id,updateData){
      //   return arr.map((item)=>item.id===id?{...item,...updateData}:item)
      // }
      // console.log(userWithSavedBlogs)

      const arrr=[...userWithSavedBlogs.saveBlog.map(b=>b.id), blog.id]as any;
      
      console.log(arrr)
      // const saveBlogss=userWithSavedBlogs.saveBlog.map(b=>b.id)
      // console.log(saveBlogss)
      // const arrId='0'
      // const newUpdated=update(saveBlogss,arrId,blog.id)
      // const curBlogId=blog.id
      

      // const newUpdate={
      //   ...userWithSavedBlogs.saveBlog.map(b=>b.id),
      //   curBlogId,
      // }

      // console.log(newUpdated)
      // // update savedBlogs 
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data:{
          saveBlog: arrr
        },
          // saveBlog:blog.id
        populate: ['saveBlog'],
      })as any;
      console.log(updatedUser)
      return ctx.send({
        message: 'Blog saved',
        // saveBlog: updatedUser.saveBlog,
      });
    },

    // unsave Blog
    async unsaveBlog(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('User not register');
      }

      // 查找博客是否存在
      const blog = await strapi.entityService.findOne('api::blog.blog', id);
      if (!blog) {
        return ctx.notFound('Blog not found');
      }

      // 获取用户的完整信息，包括已保存的博客
      const userWithSavedBlogs = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
        populate: ['saveBlog'],
      })as any;

      // 检查博客是否已经被保存
      const isSaved = userWithSavedBlogs.saveBlog.some(savedBlog => savedBlog.id === blog.id);
      if (!isSaved) {
        return ctx.badRequest('博客尚未被保存');
      }

      // 过滤掉要取消保存的博客
      const updatedSavedBlogs = userWithSavedBlogs.saveBlog.filter(savedBlog => savedBlog.id !== blog.id).map(b => b.id);

      // 更新用户的 savedBlogs 关系
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          saveBlog: updatedSavedBlogs,
        },
        populate: ['saveBlog'],
      })as any;

      return ctx.send({
        message: 'Blog unsave',
        saved_by: updatedUser.saveBlog,
      });
    },
  });
