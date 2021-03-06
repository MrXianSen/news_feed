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
        // DONE
        'like':{
            method:'POST',
            params: {'verb': 'like'}
        },
        'comment': {
            method: 'POST',
            params: {'verb': 'comment'},
        },
        'getComments':{
            method: 'POST',
            params: {'verb': 'getComments'}
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

    // DONE
    self.comments = [];
    self.getComments = function(){
        return PostResource.Post.getComments(
            {'subreddit':currentSubreddit, 'id':currentPost},
            function(result){
                $scope.comments = result.comments;
            }
        ).$promise;
    }

    // clear comment list view
    self.clearComment = function(){
        currentPost = 0;
        $scope.comments = [];
        document.getElementById("comment_div").style.display = 'none';
    }

    $scope.refreshPosts = function(id, pop) {
        currentSubreddit = id;
        currentPopularity = pop;
        self.clearComment();
        self.getPosts();
    };

    // DONE
    $scope.sortByTitle = function(){
        //return SubredditResource.Subreddit.get(function(){
            var len = $scope.subreddits.length;
            for(var i=0;i<len;i++){
                for(var j=i;j<len;j++)
                if($scope.subreddits[i].title.toLowerCase() > $scope.subreddits[j].title.toLowerCase()){
                    var temp = $scope.subreddits[i];
                    $scope.subreddits[i] = $scope.subreddits[j];
                    $scope.subreddits[j] = temp;
                }
            }
        //}).$promise;
    }

    // DONE
    $scope.sortByDesc = function(){
        //return SubredditResource.Subreddit.get(function(){
            var len = $scope.subreddits.length;
            for(var i=0;i<len;i++){
                for(var j=i;j<len;j++)
                if($scope.subreddits[i].description.toLowerCase() > $scope.subreddits[j].description.toLowerCase()){
                    var temp = $scope.subreddits[i];
                    $scope.subreddits[i] = $scope.subreddits[j];
                    $scope.subreddits[j] = temp;
                }
            }
        //}).$promise;
    }
    // DONE
    var currentPost = 0;
    $scope.postOnEach = function(id){
        currentPost = id;
        var ul = document.getElementById('posts').getElementsByTagName('div');
        for(var i=0;i<ul.length;i++){
            ul[i].index = i;
            ul[i].onclick = function(){
                this.style.background='#F3DFE2';
                for(var j=0;j<ul.length;j++){
                    if(ul[j] != this)
                        ul[j].style.background='#fff';
                }
            };
        }
        document.getElementById("comment_div").style.display = 'block';
        self.getComments();
    }

    // Initialize
    self.posts = [];
    getPosts().then(function() {
        $scope.createPost = function(title, content) {
            return PostResource.Post.create(
                {'subreddit': currentSubreddit, 'title': title, 'content': content, 'popularity': currentPopularity},
                function(result) {
                // TODO | Highlight box red and alert user on error
                // DONE
                if(result.status != 'OK')
                    alert('Something error when add Post')
                $scope.input_post.title = "";
                $scope.input_post.content = "";
                console.log(result);
                getPosts(); // Refresh visible posts
            }).$promise;
        };
    });


    // DONE
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

    // DONE
    getComments().then(function(){
        $scope.comment = function(content){
            if(currentPost == 0)
                alert("You shhould choose a Post");
            return PostResource.Post.comment(
                {'subreddit': currentSubreddit, 'content': content, 'id': currentPost},
                function(result){
                    if(result.status != 'OK')
                        alert(result.status);
                    $scope.input_comment.content = "";
                    getComments();
                }
            ).$promise;
        }
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
                    $scope.input_sub.title = "";
                    $scope.input_sub.description = "";
                    console.log(result);
                    getSubreddits(); // Refresh existing subreddits list
                });
        };
    });

}]);
