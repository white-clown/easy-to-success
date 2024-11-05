import { ALL } from 'dns';
import { createReadStream } from 'fs';
import { join } from 'path';
export default {
    async beforeCreate(event) {
        const { data } = event.params;
        
        // 检查数据是否符合要求或自动填充数据
        if (!data.title) {
        throw new Error("Title is required");
        }
        //convert a string to lowercase and replace all whitespace characters with hyphens
        data.slug = data.title.toLowerCase().replace(/\s+/g, '-');

        if (!data.coverPhoto) {
            const defaultFile = await strapi.query('plugin::upload.file').findOne({
              where: { name: { $contains: 'addtocart.PNG' } } // adjust if the name is different
            });
            // console.log(data)
            if (defaultFile) {
              data.coverPhoto = Number(defaultFile.id); // Assign the file ID instead of the path
            } else {
              console.error("Default cover image not found in the uploads directory.");
            }
          }
    },
    async beforeDelete(event){
        const {where}=event.params;
        const blogId= where.id;
        //delete all the comments and like related with the blog
        await strapi.query('api::comment.comment').delete({where:{blog:blogId}})
        console.log(blogId+':comment deleted')
        await strapi.query('api::like.like').delete({where:{blog:blogId}})
        console.log(blogId+':like deleted')
    }
}