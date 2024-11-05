// ./src/api/user-registration/controllers/registration.js

'use strict';

// import { useReducer } from "react";

// const { sanitize}= require("@strapi/utils")

module.exports = {
  // register step 1
  async step1(ctx) {
    const { username, email, phone, password, confirmPassword } = ctx.request.body;

    // required validation
    if (!username || !email || !phone || !password || !confirmPassword) {
      return ctx.badRequest('All fields must be enter!');
    }

    if (password !== confirmPassword) {
      return ctx.badRequest('Password and confirm password must be the same!');
    }

    try {
      // check the user is exist
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({ where: { email } });
      if (existingUser) {
        return ctx.badRequest('Email has already registered!');
      }

      // create a new user
      const user = await strapi.entityService.create('plugin::users-permissions.user',{
        data:{
          username:username,
          email:email,
          phone:phone,
          password:password,
          provider: "local",
          role:1
        }
      });
      

      // construct JWT
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id });
      // console.log('testing')
      // console.log(sanitize(user))
      
      // const { password, ...sanitizedUser } = user;
      
      return ctx.send({
        // user: sanitize(user),
        message:"Step 1 done",
        user:user,
        jwt,
      });
    } catch (error) {
      return ctx.badRequest('Register Fail');
    }
  },

  // regtister step2
  async step2(ctx) {
    const { profile, birthday, gender, country, career, interest } = ctx.request.body;
    // const { jwt } = ctx.request.headers;
    // console.log(ctx.state.user)
    // const user=ctx.state.user
    // if (user) {
    //   return ctx.unauthorized('Required Autherized information.');
    // }

    try {
      // console.log("start verify")
      // verigfy JWT and get the user id
      // 获取用户 ID 通过 JWT
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('您必须登录才能完成注册');
      }
      // console.log('Register Step 2 - User:', user?.id)
      // update the user information
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          // profile:profile,
          // birthday:birthday,
          gender:gender,
          country:country,
          career:career,
          interest:interest,
          
        },
      });
      // console.log("updated")
      const { password, ...sanitizedUser } = updatedUser;
      return ctx.send({
        // user: sanitize(updatedUser, { model: strapi.query('plugin::users-permissions.user') }),
        message:"Register Success",
        user: sanitizedUser
      });
    } catch (error) {
      console.log(error)
      return ctx.unauthorized('Authorization failed');
    }
  },
};
