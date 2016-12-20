var app = angular.module('app', ['ngRoute', 'luegg.directives']);
app.config(function ($routeProvider) {
    $routeProvider
        .when('/',{
            templateUrl: 'partials/login.html',
            controller: 'loginController'
        })
        .when('/game',{
             templateUrl: 'partials/game.html',
             controller: 'gameController'
        })
        // .when('/topic/:id',{
        //     templateUrl: 'partials/topic.html',
        //     controller: 'topicController'
        // })
        // .when('/user/:id',{
        //     templateUrl: 'partials/user.html',
        //     controller: 'userController'
        // })
        .otherwise({
            redirectTo: '/'
        })
});
