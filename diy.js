// Axax Request Simulator
var _dataGenerator = (function() {
  var _friends = [];
  for (var idx=0; idx < 25; ++idx) {
    var f = {id: idx, name: ('Friend ' + (idx+1)), strength: (idx/25)};
    _friends.push(f);   
  }
  var _added = {};
  return {
    getFriendUpdates: function() {      
      var actions = [];
      var n = Math.ceil(Math.random() / 0.33);
      for (var r=0; r < n; ++r) {
        var randIdx = Math.floor(Math.random() * _friends.length);
        var f = _friends[randIdx];
        var act = _added[f.id] ? 'remove' : 'add';
        actions.push({action:act, friend:f});
        if (act == 'add') _added[f.id] = true;
        else delete _added[f.id];
      }
      return actions;
    } 
  } 
})();

// Accessor for Ajax simulator
var api = {

  submitUserChanges: function(updated) {
    console.log(updated); // Verify payload is valid
  },

  listenForFriendChanges: function(listener) {
    setInterval(function() {
      listener(_dataGenerator.getFriendUpdates());
    }, 5000);
  }
}

// The good stuff starts here

$(document).ready(function() {
    var friendList = MakeFriendsList();
    friendList.init();
    $('#friends-list').on('click', 'li', function() {
      friendList.toggleDeletion($(this).data().id);
    });
    $('#delete-friends').on('click', function() {
      friendList.processDeletions();
      friendList.evaluateSubmit();
    });
});

// Make Friends List is a singleton that handles tracking user's current friends,
// managing adding/removing friends, and delegating DOM updating to methods on Friend objects.
var MakeFriendsList = function() {
  // Private variables which will be accessed through closure scope by the methods returned.
  var _friends = {};
  var _pendingDeletion = {};
  var _submitShowing = false;
  // Methods that MakeFriendsList returns when function gets called:
  var list = {};
  list.evaluateSubmit = function() {  
    var pendingLength = Object.keys(_pendingDeletion).length;
    if ((pendingLength > 0 && !_submitShowing) || (pendingLength === 0 && _submitShowing)) {
      $('#delete-friends').toggle();
      _submitShowing = !_submitShowing;
    }
  };
  list.init = function() {
    // retain reference to friend list because we lose context in the api callback
    var _this = this; 
    api.listenForFriendChanges(function (changes) {
      var removed = false;
      changes.forEach(function (change) {
        change.action === "add" ? _this.addFriend(new Friend(change.friend)) : (_this.deleteFriend(change.friend.id), removed = true);
      });
      if(removed) {_this.evaluateSubmit();}
    }); 
  };
  list.addFriend = function (friend) {
    _friends[friend.id] = friend;
  };
  list.deleteFriend = function (id) {  
    if (_pendingDeletion[id]) {
      delete _pendingDeletion[id];
    }
    if (_friends[id]) {  
      _friends[id].remove();
      delete _friends[id];
    }
  };
  list.toggleDeletion = function (id) {  
    var friend = _friends[id];
    friend.pendingDeletion = !friend.pendingDeletion;
    if (friend.pendingDeletion) {
      _pendingDeletion[friend.id] = friend;
    } else {
      delete _pendingDeletion[friend.id];
    }
    friend.toggleSelection();
    this.evaluateSubmit();
  };
  list.processDeletions = function() {  
    var updated = [];
    for(var friend in _pendingDeletion) {
      updated.push({
        action: "remove",
        friend: {
          id: _pendingDeletion[friend].get('id'), 
          name: _pendingDeletion[friend].get('name'), 
          strength: _pendingDeletion[friend].get('strength')
        }
      });
      _pendingDeletion[friend].remove();
      delete _pendingDeletion[friend];
      delete _friends[friend];
    }
    api.submitUserChanges(updated);
  };
  return list;
};

// Friend is a pseudo-classical constructor that creates an object which handles 
// the DOM manipulation for any given friend. The FriendsList object stores references 
// to these Friends objects in the 'friends' variable. The key is is their FriendID.
// Since we will be creating lots of instances of 'Friends', it makes perfect sense to 
// attach methods to the prototype to save memory.

var Friend = function(friend) {
  this.id = friend.id;
  this.pendingDeletion = false;
  this.$el = $('<li />').text(friend.name)
                        .data(friend);
  this.init();
};

Friend.prototype.init = function() {
  this.$el.appendTo('#friends-list');
};

Friend.prototype.remove = function() {
  // it may be overkill, but we want to make sure we remove all references from 
  // jquery's cache by calling .removeData() and .empty() before removing it from
  // the DOM. There are known issues with garbage collection, and we don't want 
  // memory leaking.
  this.$el.removeData().empty().remove(); 
  this.$el = undefined;
};

Friend.prototype.get = function(key) {
  return this.$el.data(key);
};

Friend.prototype.toggleSelection = function() {
  var color = this.pendingDeletion ? "red" : "black";
  this.$el.css("color", color);
};

// HTML-wise, this solution is more clean than Angular, 
// all we need are 2 elements with ids of delete-friends
// and friends-list.

//<button id="delete-friends">
//</button>
//<ul id="#friends-list"> 
//</ul>