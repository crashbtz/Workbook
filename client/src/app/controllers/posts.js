angular.module('posts', ['resources.posts', 'security.authorization', 'ngSanitize'])

.config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
  $routeProvider.when('/posts', {
    templateUrl:'templates/posts/list.tpl.html',
    controller:'PostsViewCtrl',
    resolve:{
      posts:['Posts', function (Posts) {
        return Posts.all();
      }],
      authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
    }
  });
}])

.controller('PostsViewCtrl', ['$scope', '$location', 'posts', 'security', 'Posts', function ($scope, $location, posts, security, Posts) {
  $scope.posts = posts;

  $scope.focusPostCommentArea = function($event) {
    $($event.currentTarget).closest('.media-body').find('.form-control').focus();
  };

  var updateSuccess = function(result, status, headers, config) {
    Posts.all(
      function success(result, status, headers, config) {
        $scope.posts = result;
      },
      function error(result, status, headers, config) {
        console.log('error');
      }
    );
  };

  var updateError = function(result, status, headers, config) {
    console.log('error');
  };

  $scope.addPost = function() {
    if (this.text) {
      new Posts({text: this.text}).$save(updateSuccess, updateError);
      this.text = '';
    }
  };

  $scope.removePost = function(post) {
    post.$remove(updateSuccess, updateError);
  };

  $scope.canRemovePost = function(post) {
    return post.creator == security.currentUser.id;
  }

  $scope.comment = function(post) {
    if (this.message) {
      post.$addComment(this.message, updateSuccess, updateError);
    }
  };

  $scope.removeComment = function(post, comment) {
    post.$removeComment(comment._id, updateSuccess, updateError);
  };

  $scope.canRemoveComment = function(comment) {
    return comment.creator == security.currentUser.id;
  }

  $scope.like = function(post) {
    post.$addLike(updateSuccess, updateError);
  };

  $scope.unlike = function(post) {
    post.$removeLike(updateSuccess, updateError);
  };

  $scope.likeComment = function(post, comment) {
    post.$addLikeToComment(comment._id, updateSuccess, updateError);
  };

  $scope.unlikeComment = function(post, comment) {
    post.$removeLikeFromComment(comment._id, updateSuccess, updateError);
  };

  $scope.userInArray = function(userIds) {
    return userIds.indexOf(security.currentUser.id) !== -1;
  }
}]);
