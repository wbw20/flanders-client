angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $rootScope, $location) {
  setTimeout(function() {
    $('#password').val('');
  }, 100);

  $rootScope.addUser = function(user) {
    $.ajax({
      type: 'POST',
      url: 'http://flanders.herokuapp.com/users',
      data: {
        user_id: user.user_id,
        country: user.address.country,
        name: user.name,
        organization_id: user.organization_id,
        picture: user.picture,
        email: user.email
      }
    });
  };

  $scope.login = function(username, password) {
    $rootScope.username = username;
    $rootScope.password = password;

    $.ajax({
      type: 'POST',
      url: 'http://flanders.herokuapp.com/login',
      cache: false,
      data: {
        username: username,
        password: password,
        tokenType: 'password',
        network: $rootScope.network
      }
    }).done(function(results) {
      if (results.statusCode === 200) {
        var token = JSON.parse(results.body)

        $.ajax({
          type: 'POST',
          url: 'http://flanders.herokuapp.com/info',
          data: {
            access_token: token.access_token
          }
        }).done(function(results) {
          if (results.statusCode === 200) {
            $rootScope.currentUser = JSON.parse(results.body);
            $rootScope.addUser($rootScope.currentUser);
            $location.path('/friends');
          } else {
            $('#password').css('background-color', 'rgba(169, 68, 66, 0.3)');
            $('#password').val('');
            setTimeout(function() {
              $('#password').css('background-color', 'white');
            }, 500);
          }
        });
      } else {
        $('#password').css('background-color', 'rgba(169, 68, 66, 0.3)');
        $('#password').val('');
        setTimeout(function() {
          $('#password').css('background-color', 'white');
        }, 500);
      }
    });
  }

  $scope.anonymous = function() {
    $rootScope.username = 'Anonymous';  
    $location.path('/friends');
  };
})

.controller('DashCtrl', function($scope, $rootScope) {
  setTimeout(function() {
    $('.ionic-scroll.has-header.has-tabs').css('bottom', '74px');
  }, 100);

  $scope.email = function(user) {
    var matches = /.+@([^.]+).+/.exec(user.email);

    if (matches && ['gmail'].indexOf(matches[1]) === -1) {
      return '(' + matches[1] + ')  ';
    }

    return '';
  }
})

.controller('FriendsCtrl', function($scope, $rootScope, $ionicScrollDelegate, Friends) {
  // $scope.friends = Friends.all();

  setTimeout(function() {
    $ionicScrollDelegate.scrollBottom(true);
  }, 1000);

  $('.compose input').focusin(function() {
    $('.tabs').css('height', '0px');
    $('.tabs').css('padding-top', '0px');
    $('.compose').css('bottom', '0px');
    $('.ionic-scroll.has-header.has-tabs').css('bottom', '55px');
    setTimeout(function() {
      $ionicScrollDelegate.scrollBottom(true);
    }, 100);
  });

  $('.compose input').focusout(function() {
    $('.tabs').css('height', '75px');
    $('.tabs').css('padding-top', '15px');
    $('.compose').css('bottom', '75px');
    $('.ionic-scroll.has-header.has-tabs').css('bottom', '130px');
    setTimeout(function() {
      $ionicScrollDelegate.scrollBottom(true);
    }, 100);
  });

  $scope.addMessage = function(event) {
    event.preventDefault();
    var self = this;

    $.ajax({
      type: 'POST',
      url: 'http://flanders.herokuapp.com/messages',
      data: {
        owner: this.currentUser ? this.currentUser.user_id : 0,
        message: $(event.target).find('input').val(),
        network: $rootScope.network
      }
    }).done(function(results) {
      $(event.target).find('input').val('');
      document.activeElement.blur();
      $('input').blur();
    });
  };

  $scope.getAuthorFor = function(message) {
    var toReturn = {
      name: 'Anonymous'
    };

    $rootScope.users.forEach(function(user) {
      if (user.user_id == message.owner) {
        toReturn = user;
      }
    });

    return toReturn;
  };

  $('.compose form').submit($scope.addMessage.bind($rootScope));
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope, $rootScope, $location) {
  $location.path('/login');
});
