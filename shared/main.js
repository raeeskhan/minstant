Meteor.methods({
  insertChat:function(otherUser){
    console.log("insertChat method running");
    var chatId;
    if(this.userId) {
      console.log("this.userId is true");

      Id = Chats.insert({user1Id:this.userId, user2Id:otherUser});
      console.log("chat inserted with Id: "+Id);
      return Id;
    }
    else {
    return;}
  },

  updateChat:function(chat){    
   var realChat = Chats.findOne({_id:chat._id});
   if(realChat) {
      realChat.messages = chat.messages;
      Chats.update({_id:chat._id}, realChat);
    }
    else {    
    return;
    }
  },
})

Chats.allow({
  remove:function() {
    return true;
  }

})