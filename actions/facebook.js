"use strict";
let datafire = require('datafire');

let facebook = require('@datafire/facebook').actions;
//TODO future integration
module.exports = new datafire.Action({
  handler: async (input, context) => {
      return await facebook.post.likes.get({
        post: "498884850566017",
    }, context);
  },
});
