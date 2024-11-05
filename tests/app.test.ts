const request = require('supertest');
// const strapi = require('strapi');
const { setupStrapi } = require('./helpers/strapi');
// const httpServer = require('../path/to/your/server'); // 根据需要调整路径

describe('Example API Tests', () => {
  let app;

  beforeAll(async () => {
    app = await setupStrapi();  // 启动 Strapi 应用
  });

  afterAll(async () => {
    await app.destroy(); // 销毁 Strapi 实例
  });

  it('should return 200 for the /api/blogs/all', async () => {
    const response = await request(app).get('/api/blogs/all');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data'); // 根据 API 返回的数据结构进行断言
  });
});
