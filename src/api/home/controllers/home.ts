// ./src/api/home/controllers/home.js

'use strict';

const { sanitizeEntity } = require('@strapi/utils');

module.exports = {
  async getHomeData(ctx) {
    try {
      // 获取当前用户
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('用户未认证');
      }

      // 获取用户详细信息
      const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: user.id },
      });

      // 获取各模块的数量
      const blogCount = await strapi.entityService.count('api::blog.blog');
      const podcastCount = await strapi.entityService.count('api::podcast.podcast');

      // 获取当前日期
    //   const today = new Date().toISOString().split('T')[0]; // 格式：YYYY-MM-DD

      return ctx.send({
        userName: fullUser.username,
        // today,
        modules: {
          blog: blogCount,
          podcasts: podcastCount,
        },
      });
    } catch (error) {
      strapi.log.error('获取首页数据失败:', error);
      return ctx.internalServerError('获取首页数据失败');
    }
  },
};
