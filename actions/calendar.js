"use strict";
let datafire = require('datafire');
const db = require('./setup.js');
let config = require('./config.json');
let google_calendar;
module.exports = new datafire.Action({
  inputs: [{
    type: "string",
    title: "id",
    default: "lincoln@sublimeapp.com"
  }, {
    type: "string",
    title: "start",
    default: "2018-05-01T13:00:00-00:00"
  }, {
    type: "string",
    title: "end",
    default: "2018-06-29T00:00:00-00:00"
  }, {
    type: "string",
    title: "timeZone",
    default: "UTC"
  }],
  handler: async (input, context) => {
      let database = new db(config);
      await database.query("SELECT AccessToken,RefreshToken,ClientId,ClientSecret FROM AccessKeys WHERE  Name = 'google_calendar'").then(result => {
          result = result[0];
          google_calendar = require('@datafire/google_calendar').create({
              access_token: result.AccessToken,
              refresh_token: result.RefreshToken,
              client_id: result.ClientId,
              client_secret: result.ClientSecret,
          });
      }).catch(e => {
          console.log("Error selecting from credentials for google_calendar, Msg: " + e);
      });
    console.log('in calendar');
    //return all events in the calendar, can add addition timeMax and timeMin params in RFC3339 timeStamp
    const events = new Promise((resolve, reject) => {
      const temp = google_calendar.events.list({
        calendarId: input.id
        //timeMax: 
        //timeMin: 
      }, context);
      resolve(temp);
    });
    //return when the user is free/busy
    const freeBusy = new Promise((resolve, reject) => {
      const temp1 = google_calendar.freebusy.query({
        body: {
          timeMin: input.start,
          timeMax: input.end,
          items: [{
            id: input.id,
          }],
          timeZone: input.timeZone,
        },
        alt: "json",
      }, context);
      resolve(temp1);
    });
    try {
      return await Promise.all([events, freeBusy]);
    } catch (e) {
      return e;
    }
  },
});
