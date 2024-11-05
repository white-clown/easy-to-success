export default {
    routes: [
      {
          //get all blogs
        method: 'GET',
        path: '/blogs/all',
        handler: 'blog.getBlogs',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
          //get recent blogs
        method: 'GET',
        path: '/blogs/recent',
        handler: 'blog.getRecentBlogs',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
          //get saved Blogs
        method: 'GET',
        path: '/blogs/saved',
        handler: 'blog.getSavedBlogs',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
          //like a blog
        method: 'POST',
        path: '/blogs/:id/like',
        handler: 'blog.likeBlog',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
          //comment a blog
        method: 'POST',
        path: '/blogs/:id/comment',
        handler: 'blog.commentBlog',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
        //get relative comment
        method: 'GET',
        path: '/blogs/:id/comment',
        handler: 'blog.getBlogComment',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
          //save a blog
          method: 'PUT',
          path: '/blogs/:id/save',
          handler: 'blog.saveBlog',
          config: {
            policies: [],
            middlewares: [],
          },
        },
        {
          //unsave a blog
          method: 'PUT',
          path: '/blogs/:id/unsave',
          handler: 'blog.unsaveBlog',
          config: {
            policies: [],
            middlewares: [],
          },
        },
      // 其他自定义路由...
    ],
  };