"use strict";
let datafire = require('datafire');
const db = require('./setup')


// dc : "the extension at the end of the api key"
let mailchimp = require('@datafire/mailchimp').actions;
module.exports = new datafire.Action({
  handler: async (input, context) => {
    console.log('in mailchimp');
    let result = [];
    let resultList = await mailchimp.getLists({
      dc: "us18",
    }, context);
    for (const campaign_Report of resultList.lists) {
      //if user marked as spam
      let abuseReport = await mailchimp.getListsIdAbuseReports({
        list_id: campaign_Report.id,
        dc: "us18",
      }, context);
      //Get up to the previous 180 days of daily detailed aggregated activity stats for a list, not including Automation activity.
      let activity = await mailchimp.getListsIdActivity({
        list_id: campaign_Report.id,
        dc: "us18",
      }, context);
      //Get a list of the top email clients based on user-agent strings.
      let topClients = await mailchimp.getListsIdClients({
        list_id: campaign_Report.id,
        dc: "us18",
      }, context);
      //Get a month-by-month summary of a specific list's growth activity.
      let histroy = await mailchimp.getListsIdGrowthHistory({
        list_id: campaign_Report.id,
        dc: "us18",
      }, context);
      //Get the locations (countries) that the list's subscribers have been tagged to based on geocoding their IP address.
      let location = await mailchimp.getListsIdLocations({
        list_id: campaign_Report.id,
        dc: "us18",
      }, context);
      //Creating a custom JSON response for Lists
      let temp = {
        "Identifier": "List",
        "List_Name": campaign_Report.name,
        "Permission_reminder": campaign_Report.permission_reminder,
        "Contact": campaign_Report.contact,
        "Campaign_defaults": campaign_Report.campaign_defaults,
        "Date_created": campaign_Report.date_created,
        "Url": campaign_Report.subscribe_url_short,
        "Stats": campaign_Report.stats,
        "Spam_reports": abuseReport.abuse_reports,
        "Activity": activity.activity,
        "Top_clients": topClients.clients,
        "History": histroy.history,
        "Locations": location.locations,
      }
      result.push(temp);
    };
    let campaigns = await mailchimp.getCampaigns({
      dc: "us18",
    }, context);
    for (const value of campaigns.campaigns) {
      let campaign_Report = await mailchimp.getReportsId({
        dc: "us18",
        campaign_id: value.id,
      }, context);
      //Creating a custom JSON repsonse for the Campaigns 
      let temp = {
        "Identifier": "Campaign",
        "Campaign_name": campaign_Report.campaign_title,
        "Create_time": value.create_time,
        "Send_time": value.send_time,
        "Type": value.type,
        "Archive_url": value.archive_url,
        "Sent_to": campaign_Report.list_name,
        "Emails_sent": campaign_Report.emails_sent,
        "Spam_report": campaign_Report.abuse_reports,
        "Unsubscribed": campaign_Report.unsubscribed,
        "Bounces": campaign_Report.bounces,
        "Forwards": campaign_Report.forwards,
        "Opens": campaign_Report.opens,
        "Clicks": campaign_Report.clicks,
      }
      result.push(temp);
    }

    result.forEach(element => {
      if (element.Identifier == "List") {

        let sqlList = 'INSERT INTO MailChimpLists (ListName, Description,DateCreated,Language, Url) VALUES (?,?,?,?,?)';
        let listValues = [element.List_Name, element.Permission_reminder, element.Date_created, element.Campaign_defaults.language, element.Url];
        db.query(sqlList, listValues, (err) => {
          if (err) throw err;
          console.log("success inserting to MailChimpLists");
        });

        let sqlContact = 'INSERT INTO MailChimpListContact (ListName, Company, Address1, Address2,City, State,Zip, Country,Phone) VALUES (?,?,?,?,?,?,?,?,?)';
        let contactValues = [element.List_Name, element.Contact.company, element.Contact.address1, element.Contact.address2, element.Contact.city, element.Contact.state, element.Contact.zip, element.Contact.country, element.Contact.phone];
        db.query(sqlContact, contactValues, (err) => {
          if (err) throw err;
          console.log("success inserting to MailChimpListContact");
        });

        let sqlStats = 'INSERT INTO MailChimpListStats (ListName, member_count, unsubscribe_count, cleaned_count,member_count_since_send, unsubscribe_count_since_send,cleaned_count_since_send, campaign_count,campaign_last_sent,merge_field_count,avg_sub_rate,avg_unsub_rate,target_sub_rate,open_rate,click_rate,last_sub_date,last_unsub_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        let statValues = [element.List_Name, element.Stats.member_count, element.Stats.unsubscribe_count, element.Stats.cleaned_count, element.Stats.member_count_since_send, element.Stats.unsubscribe_count_since_send, element.Stats.cleaned_count_since_send, element.Stats.campaign_count, element.Stats.campaign_last_sent, element.Stats.merge_field_count, element.Stats.avg_sub_rate, element.Stats.avg_unsub_rate, element.Stats.target_sub_rate, element.Stats.open_rate, element.Stats.click_rate, element.Stats.last_sub_date, element.Stats.last_unsub_date];
        db.query(sqlStats, statValues, (err) => {
          if (err) throw err;
          console.log("success inserting to MailChimpListStats");
        });

        let sqlActivity = 'INSERT INTO MailChimpListActivity (ListName, day, emails_sent, unique_opens,recipient_clicks, hard_bounce,soft_bounce, subs,unsubs,other_adds,other_removes) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
        element.Activity.forEach(value => {
          let activityValue = [element.List_Name, value.day, value.emails_sent, value.unique_opens, value.recipient_clicks, value.hard_bounce, value.soft_bounce, value.subs, value.unsubs, value.other_adds, value.other_removes];
          db.query(sqlActivity, activityValue, (err) => {
            if (err) throw err;
            console.log("success inserting to MailChimpListActivity");
          });
        });

        let sqlTopClient = 'INSERT INTO MailChimpListTopClients (ListName, Client, Members) VALUES (?,?,?)';
        element.Top_clients.forEach(temp => {
          let topClientValues = [element.List_Name, temp.client, temp.members];
          db.query(sqlTopClient, topClientValues, (err) => {
            if (err) throw err;
            console.log("success inserting to MailChimpListTopClients");
          });
        });

        let sqlHistory = 'INSERT INTO MailChimpListHistory (ListName, Month, Existing,imports,optins ) VALUES (?,?,?,?,?)';
        element.History.forEach(temp2 => {
          let histroyValues = [element.List_Name, temp2.month, temp2.existing, temp2.imports, temp2.optins];
          db.query(sqlHistory, histroyValues, (err) => {
            if (err) throw err;
            console.log("success inserting to MailChimpListHistory");
          });
        });

        let sqlLocation = 'INSERT INTO MailChimpListLocations (ListName, Country, CC,Percent,Total ) VALUES (?,?,?,?,?)';
        element.Locations.forEach(tempValue => {
          let locationValues = [element.List_Name, tempValue.country, tempValue.cc, tempValue.percent, tempValue.total];
          db.query(sqlLocation, locationValues, (err) => {
            if (err) throw err;
            console.log("success inserting to MailChimpListLocations");
          });
        });

      } else if (element.Identifier == "Campaign") {

        let sql = 'INSERT INTO MailChimpCampaign (Name, Create_time, Send_time, Type, Archive_url,Sent_to,Emails_sent,Spam_report,Unsubscribed) VALUES (?,?,?,?,?,?,?,?,?)';
        let values = [element.Campaign_name, element.Create_time, element.Send_time, element.Type, element.Archive_url, element.Sent_to, element.Emails_sent, element.Spam_report, element.Unsubscribed];
        db.query(sql, values, (err) => {
          if (err) throw err;
          console.log("success inserting to MailChimpCampaign");
        });

        let sqlBounces = 'INSERT INTO MailChimpCampaignBounces (Name, hard_bounces, soft_bounces, syntax_errors) VALUES (?,?,?,?)';
        let bounceValues = [element.Campaign_name, element.Bounces.hard_bounces, element.Bounces.soft_bounces, element.Bounces.syntax_errors];
        db.query(sqlBounces, bounceValues, (err) => {
          if (err) throw err;
          console.log("success inserting to MailChimpCampaignBounces");
        });

        let sqlFoward = 'INSERT INTO MailChimpCampaignFowards (Name, forwards_count, forwards_opens) VALUES (?,?,?)';
        let fowardValues = [element.Campaign_name, element.Forwards.forwards_count, element.Forwards.forwards_opens];
        db.query(sqlFoward, fowardValues, (err) => {
          if (err) throw err;
          console.log("success inserting to MailChimpCampaignFowards");
        });


        let sqlOpen = 'INSERT INTO MailChimpCampaignOpens (Name, opens_total, unique_opens, open_rate, last_open) VALUES (?,?,?, ?,?)';
        let openValues = [element.Campaign_name, element.Opens.opens_total, element.Opens.unique_opens, element.Opens.open_rate, element.Opens.last_open];
        db.query(sqlOpen, openValues, (err) => {
          if (err) throw err;
          console.log("success inserting to MailChimpCampaignOpens");
        });

        let sqlClick = 'INSERT INTO MailChimpCampaignClicks (Name, clicks_total, unique_clicks, unique_subscriber_clicks, click_rate, last_click ) VALUES (?,?,?,?,?,?)';
        let clickValues = [element.Campaign_name, element.Clicks.clicks_total, element.Clicks.unique_clicks, element.Clicks.unique_subscriber_clicks, element.Clicks.click_rate, element.Clicks.last_click];
        db.query(sqlClick, clickValues, (err) => {
          if (err) throw err;
          console.log("success inserting to MailChimpCampaignClicks");
        });
      }
    });
    db.end();
    return result;
  },
});