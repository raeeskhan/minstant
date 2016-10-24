Chats = new Mongo.Collection("chats");
Chats.allow({
  insert:function(userId){
    return true;
  },
  update:function(userId){
    return true;
  }
})
