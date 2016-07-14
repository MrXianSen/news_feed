var app = angular.module('NewsFeed', ['ngResource', 'ui.bootstrap'])
.config(function($interpolateProvider, $httpProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');

    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
})
.service('PostResource', ['$resource', function($resource) {
    this.Post = $resource("/post/:subreddit/:verb", {subreddit: '@subreddit'}, {
        'get': {
            method:'GET',
            params: {'verb': 'list'},
        },
        'create': {
            method:'POST',
            params: {'verb': 'create'},
        },
        'like':{
            method:'POST',
            params: {'verb': 'like'}
        }
    });
}])
.service('SubredditResource', ['$resource', function($resource) {
    this.Subreddit = $resource("/subreddit/:verb", {}, {
        'get': {
            method:'GET',
            params: {'verb': 'list'},
        },
        'create': {
            method:'POST',
            params: {'verb': 'create'},
        },
    });
}])
.controller('HomepageController',
            ['$scope', '$timeout', 'filterFilter', 'PostResource', 'SubredditResource',
            function($scope, $timeout, filterFilter, PostResource, SubredditResource) {

    var currentSubreddit = 'global';
    // DONE add var named popularity
    var currentPopularity = 0;
    self.getPosts = function() {
        return PostResource.Post.get({'subreddit': currentSubreddit}, function(result) {
            $scope.posts = result.posts;
        }).$promise;
    };
    $scope.refreshPosts = function(id, pop) {
        currentSubreddit = id;
        currentPopularity = pop;
        self.getPosts();
    };

    // add to sort by title
    $scope.sortByTitle = function(){
        return SubredditResource.Subreddit.get(function(){
            var len = $scope.subreddits.length;
            for(var i=0;i<len;i++){
                for(var j=i;j<len;j++)
                if($scope.subreddits[i].title > $scope.subreddits[j].title){
                    var temp = $scope.subreddits[i];
                    $scope.subreddits[i] = $scope.subreddits[j];
                    $scope.subreddits[j] = temp;
                }
            }
        }).$promise;
    }

    $scope.sortByDesc = function(){
        return SubredditResource.Subreddit.get(function(){
            var len = $scope.subreddits.length;
            for(var i=0;i<len;i++){
                for(var j=i;j<len;j++)
                if($scope.subreddits[i].description > $scope.subreddits[j].description){
                    var temp = $scope.subreddits[i];
                    $scope.subreddits[i] = $scope.subreddits[j];
                    $scope.subreddits[j] = temp;
                }
            }
        }).$promise;
    }

    // Initialize
    self.posts = [];
    getPosts().then(function() {
        $scope.createPost = function(title, content) {
            return PostResource.Post.create(
                {'subreddit': currentSubreddit, 'title': title, 'content': content, 'popularity': currentPopularity},
                function(result) {
                // TODO | Highlight box red and alert user on error
                if(result.status != 'OK')
                    alert('Something error when add Post')
                console.log(result);
                getPosts(); // Refresh visible posts
            }).$promise;
        };
    });

    getPosts().then(function(){
        $scope.like = function(id){
            return PostResource.Post.like(
                {'subreddit': currentSubreddit, 'id': id},
                function(result){
                    if(result.status != 'OK')
                        alert(result.status);
                    getPosts();
                }
            ).$promise;
        };
    });



    var getSubreddits = function(){
        return SubredditResource.Subreddit.get(function(result) {
            $scope.subreddits = result.subreddits;
            console.log($scope.subreddits);
        }).$promise;
    };

    // Initialize
    $scope.subreddits = [];
    getSubreddits().then(function() {
        $scope.createSubreddit = function(title, description) {
            return SubredditResource.Subreddit.create(
                {'title': title, 'description': description},
                function(result) {
                    // TODO | Highlight box red and alert user on error
                    // DONE
                    if(result.status != 'OK')
                        alert("Something wrong when add \nTitle:" + title + "\nDesc:" + description)
                    console.log(result);
                    getSubreddits(); // Refresh existing subreddits list
                });
        };
    });

}]);
