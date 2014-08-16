angular.module("app",[])
  .factory('api', function() {
    var _friends = [];
    for (var idx=0; idx < 25; ++idx) {
      var f = {id: idx, name: ('Friend ' + (idx+1)), strength: (idx/25)};
      _friends.push(f);   
    }
    var _added = {};
    var api = {};
    api.getFriendUpdates = function() {
      var actions = [];
      var n = Math.ceil(Math.random() / 0.25);
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
    return api;   
  })
  .factory('friendCollection', function() {
    var _friends = [];
    var friendCollection = {};
    friendCollection.getFriends = function() {
      return _friends;
    }
    friendCollection.addFriend = function(friend) {
      _friends.push({
        info: friend,
        pendingRemoval: false
      });
    }
    friendCollection.removeFriend = function(apifriend) {
      var removed = _.remove(_friends, function(friend) {
        return friend.info.id === apifriend.id;;
      });
    }
    friendCollection.toggleRemoval = function(index) {
      var action = _friends[index]['pendingRemoval'] ? 'toggleOff' : 'toggleOn'
      _friends[index]['pendingRemoval'] = !_friends[index]['pendingRemoval'];
    }
    friendCollection.anyPendingRemoval = function() {
      return _.some(_friends, 'pendingRemoval');
    }
    friendCollection.purgePendingRemoval = function() {
      var removed = _.remove(_friends, 'pendingRemoval');
      _.each(removed, function(friend){
      })
    }
    return friendCollection;
  })
  .controller('friendCtrl', function($scope, $interval, api, friendCollection) {
    var actionHandlers = {
      add: friendCollection.addFriend, 
      remove: friendCollection.removeFriend
    };
    var apiFetchInterval = $interval(function(){
      _.each(api.getFriendUpdates(), function(item) {
        actionHandlers[item.action].call(this, item.friend);
      });
    }, 4000);

    $scope.friends = friendCollection;

    $scope.$on('$destroy', function() {
      $interval.cancel(apiFetchInterval);
    });
  });

// With some HTML magic, we can just point our html elements to 
// properties on the scope, and Angular handles all DOM manipulation
// for us.

// <button class="btn btn-xs pull-right btn-danger"
//         role="button"
//         ng-disabled="!friends.anyPendingRemoval()"
//         ng-click="friends.purgePendingRemoval()">
// Remove Friends
// </button>
// <a href="#"
//    class="list-group-item"
//    ng-repeat="friend in friends.friends" 
//    ng-click="friends.toggleRemoval($index)"
//    ng-class="{'list-group-item-warning': friend.pendingRemoval}">
// {{friend.info.name}}
// </a>