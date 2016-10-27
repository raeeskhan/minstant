import { Template } from 'meteor/templating';

import './main.html';
Meteor.subscribe("chats");
Meteor.subscribe("users");
// set up the main template the the router will use to build pages
Router.configure({
  layoutTemplate: 'ApplicationLayout'
});
// specify the top level route, the page users see when they arrive at the site
Router.route('/', function () {
  console.log("rendering root /");
  this.render("navbar", {to:"header"});
  this.render("lobby_page", {to:"main"});
});

// specify a route that allows the current user to chat to another users
Router.route('/chat/:_id', function () {
  // the user they want to chat to has id equal to
  // the id sent in after /chat/...
  var otherUserId = this.params._id;
  var chatId;
  // find a chat that has two users that match current user id
  // and the requested user id
  var filter = {$or:[
              {user1Id:Meteor.userId(), user2Id:otherUserId},
              {user2Id:Meteor.userId(), user1Id:otherUserId}
              ]};
  var chat = Chats.findOne(filter);
  if (!chat && Meteor.user()){// no chat matching the filter - need to insert a new one
    //chatId = Chats.insert({user1Id:Meteor.userId(), user2Id:otherUserId});
    chatId = Meteor.call("insertChat", otherUserId, function(error, result){
      if(!error) {
          console.log("chatId returned from addChat method: "+result)
      }
    });    
  }
  else {// there is a chat going already - use that.
    chatId = chat._id;
  }
  if (chatId){// looking good, save the id to the session
    Session.set("chatId",chatId);
  }
  this.render("navbar", {to:"header"});
  this.render("chat_page", {to:"main"});
});

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL"

});
///
// helper functions
///
Template.available_user_list.helpers({
  users:function(){
    return Meteor.users.find();
  }
})
Template.available_user.helpers({
  getUsername:function(userId){
    user = Meteor.users.findOne({_id:userId});
    return user.username;
  },
  isMyUser:function(userId){
    if (userId == Meteor.userId()){
      return true;
    }
    else {
      return false;
    }
  }
})


Template.chat_page.helpers({
  messages:function(){
    var chat = Chats.findOne({_id:Session.get("chatId")});
    return chat.messages;
  },
  other_user:function(){
    return ""
  },

})

Template.chat_message.helpers({
  getAvatar:function(userId){
    user = Meteor.users.findOne({_id:userId});
    return user.profile.avatar;
  },
  isMyUser:function(userId){
    if (userId == Meteor.userId()){
      return true;
    }
    else {
      return false;
    }
  }
})

Template.chat_page.events({
// this event fires when the user sends a message on the chat page
'submit .js-send-chat':function(event){
  // stop the form from triggering a page reload
  event.preventDefault();
  // see if we can find a chat object in the database
  // to which we'll add the message
  var chat = Chats.findOne({_id:Session.get("chatId")});
  if (chat && Meteor.user()){// ok - we have a chat to use
    var msgs = chat.messages; // pull the messages property
    if (!msgs){// no messages yet, create a new array
      msgs = [];
    }
    console.log("chat :"+chat._id);

    // is a good idea to insert data straight from the form
    // (i.e. the user) into the database?? certainly not.
    // push adds the message to the end of the array
    msgs.push({user:Meteor.user()._id, text: emojione.toShort(event.target.chat.value)});
    // reset the form
    event.target.chat.value = "";
    // put the messages array onto the chat object
    chat.messages = msgs;
    // update the chat object in the database.
    //Chats.update(chat._id, {$set: chat});   
    Meteor.call("updateChat", chat); 
    }
  },
  'click .js-insert-smile':function(event){   
       console.log(event.target.alt);
      $('#chat').val($('#chat').val()+event.target.alt);

  }
})
