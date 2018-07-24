"use strict";
const datafire = require('datafire');
const trello = require('@datafire/trello').actions;

module.exports = new datafire.Action({
  handler: async (input, context) => {
    console.log('in trello');
    let result = [];
    // get all available boards to the user
    let boards = await trello.getMembersBoardsByIdMember({
      idMember: "lincoln346",
      lists: "none",
      fields: "all",
      filter: "all",
    }, context);
    for (const key1 in boards) {
      if (boards.hasOwnProperty(key1)) {
        // loop through each board to get its lists anad cards
        let listsAndCards = await trello.getBoardsListsByIdBoard({
          idBoard: boards[key1].id,
          cards: "all",
          card_fields: "name,closed,dateLastActivity,desc,dueComplete,due,idChecklists,idMembers,labels,shortUrl",
          filter: "all",
          fields: "all",
        }, context);
        //Creating the first part of the custom JSON reponse
        let temp = {
          "Board_name": boards[key1].name,
          "description": boards[key1].desc,
          "closed": boards[key1].closed,
          "dateLastActiviy": boards[key1].dateLastActivity,
          "url": boards[key1].url,
        }
        //looping through the Cards array in listsAndCards
        for (const key2 in listsAndCards) {
          if (listsAndCards.hasOwnProperty(key2)) {
            let biggerResult = [];
            listsAndCards[key2].cards.forEach(element => {
              let checkListArray = [];
              let memberListArray = [];
              // for each card, get the checklist with it
              element.idChecklists.forEach(async (value) => {
                let checklist = await trello.getChecklistsByIdChecklist({
                  idChecklist: value,
                  card_fields: "none",
                  cards: "none",
                  checkItems: "all",
                  checkItem_fields: "state,name",
                  fields: "name",
                }, context);
                checkListArray.push(checklist);
              });
              //looping through the members array in listsAndCards 
              element.idMembers.forEach(async (people) => {
                let members = await trello.getMembersByIdMember({
                  idMember: people,
                  fields: "fullName,initials,bio,status,username,email,url",
                }, context);
                memberListArray.push(members);
              });
              //Creating the second part of the of the custom JSON reponse with the cards
              let tempList = {
                "List_closed": element.closed,
                cards: {
                  "name": element.name,
                  "id": element.id,
                  "Card_closed": element.closed,
                  "dateLastActivity": element.dateLastActivity,
                  "description": element.desc,
                  "dueDate": element.due,
                  "dueComplete": element.dueComplete,
                  "CheckList": checkListArray,
                  "Members": memberListArray,
                  "labels": element.labels,
                }
              }
              biggerResult.push(tempList);
            });
            //concating the second part of the custom JSON reponse to the first
            temp[listsAndCards[key2].name] = biggerResult;
          }
        }
        result.push(temp);
      }
    }
    return result;
  },
});