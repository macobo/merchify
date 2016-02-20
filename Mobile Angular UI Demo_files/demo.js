//
// Here is how to define your module
// has dependent on mobile-angular-ui
//
var app = angular.module('MobileAngularUiExamples', [
    'ngRoute',
    'mobile-angular-ui',

    // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'
    // it is at a very beginning stage, so please be careful if you like to use
    // in production. This is intended to provide a flexible, integrated and and
    // easy to use alternative to other 3rd party libs like hammer.js, with the
    // final pourpose to integrate gestures into default ui interactions like
    // opening sidebars, turning switches on/off ..
    'mobile-angular-ui.gestures'
]);

app.run(function ($transform) {
    window.$transform = $transform;
});

//
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false'
// in order to avoid unwanted routing.
//
app.config(function ($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'home.html', reloadOnSearch: false});
    $routeProvider.when('/page2', {templateUrl: 'page2.html'});
    $routeProvider.when('/page3', {templateUrl: 'page3.html'});
    // $routeProvider.when('/scroll',        {templateUrl: 'scroll.html', reloadOnSearch: false});
    // $routeProvider.when('/toggle',        {templateUrl: 'toggle.html', reloadOnSearch: false});
    // $routeProvider.when('/tabs',          {templateUrl: 'tabs.html', reloadOnSearch: false});
    // $routeProvider.when('/accordion',     {templateUrl: 'accordion.html', reloadOnSearch: false});
    // $routeProvider.when('/overlay',       {templateUrl: 'overlay.html', reloadOnSearch: false});
    // $routeProvider.when('/forms',         {templateUrl: 'forms.html', reloadOnSearch: false});
    // $routeProvider.when('/dropdown',      {templateUrl: 'dropdown.html', reloadOnSearch: false});
    // $routeProvider.when('/touch',         {templateUrl: 'touch.html', reloadOnSearch: false});
    // $routeProvider.when('/swipe',         {templateUrl: 'swipe.html', reloadOnSearch: false});
    // $routeProvider.when('/drag',          {templateUrl: 'drag.html', reloadOnSearch: false});
    // $routeProvider.when('/drag2',         {templateUrl: 'drag2.html', reloadOnSearch: false});
    // $routeProvider.when('/carousel',      {templateUrl: 'carousel.html', reloadOnSearch: false});
});

//
// `$touch example`
//

app.directive('toucharea', ['$touch', function ($touch) {
    // Runs during compile
    return {
        restrict: 'C',
        link: function ($scope, elem) {
            $scope.touch = null;
            $touch.bind(elem, {
                start: function (touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                },

                cancel: function (touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                },

                move: function (touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                },

                end: function (touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                }
            });
        }
    };
}]);

//
// `$drag` example: drag to dismiss
//
app.directive('dragToDismiss', function ($drag, $parse, $timeout) {
    return {
        restrict: 'A',
        compile: function (elem, attrs) {
            var dismissFn = $parse(attrs.dragToDismiss);
            return function (scope, elem) {
                var dismiss = false;

                $drag.bind(elem, {
                    transform: $drag.TRANSLATE_RIGHT,
                    move: function (drag) {
                        if (drag.distanceX >= drag.rect.width / 4) {
                            dismiss = true;
                            elem.addClass('dismiss');
                        } else {
                            dismiss = false;
                            elem.removeClass('dismiss');
                        }
                    },
                    cancel: function () {
                        elem.removeClass('dismiss');
                    },
                    end: function (drag) {
                        if (dismiss) {
                            elem.addClass('dismitted');
                            $timeout(function () {
                                scope.$apply(function () {
                                    dismissFn(scope);
                                });
                            }, 300);
                        } else {
                            drag.reset();
                        }
                    }
                });
            };
        }
    };
});

//
// Another `$drag` usage example: this is how you could create
// a touch enabled "deck of cards" carousel. See `carousel.html` for markup.
//
app.directive('carousel', function () {
    return {
        restrict: 'C',
        scope: {},
        controller: function () {
            this.itemCount = 0;
            this.activeItem = null;

            this.addItem = function () {
                var newId = this.itemCount++;
                this.activeItem = this.itemCount === 1 ? newId : this.activeItem;
                return newId;
            };

            this.next = function () {
                this.activeItem = this.activeItem || 0;
                this.activeItem = this.activeItem === this.itemCount - 1 ? 0 : this.activeItem + 1;
            };

            this.prev = function () {
                this.activeItem = this.activeItem || 0;
                this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
            };
        }
    };
});

app.directive('carouselItem', function ($drag) {
    return {
        restrict: 'C',
        require: '^carousel',
        scope: {},
        transclude: true,
        template: '<div class="item"><div ng-transclude></div></div>',
        link: function (scope, elem, attrs, carousel) {
            scope.carousel = carousel;
            var id = carousel.addItem();

            var zIndex = function () {
                var res = 0;
                if (id === carousel.activeItem) {
                    res = 2000;
                } else if (carousel.activeItem < id) {
                    res = 2000 - (id - carousel.activeItem);
                } else {
                    res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
                }
                return res;
            };

            scope.$watch(function () {
                return carousel.activeItem;
            }, function () {
                elem[0].style.zIndex = zIndex();
            });

            $drag.bind(elem, {
                //
                // This is an example of custom transform function
                //
                transform: function (element, transform, touch) {
                    //
                    // use translate both as basis for the new transform:
                    //
                    var t = $drag.TRANSLATE_BOTH(element, transform, touch);

                    //
                    // Add rotation:
                    //
                    var Dx = touch.distanceX,
                        t0 = touch.startTransform,
                        sign = Dx < 0 ? -1 : 1,
                        angle = sign * Math.min(( Math.abs(Dx) / 700 ) * 30, 30);

                    t.rotateZ = angle + (Math.round(t0.rotateZ));

                    return t;
                },
                move: function (drag) {
                    if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
                        elem.addClass('dismiss');
                    } else {
                        elem.removeClass('dismiss');
                    }
                },
                cancel: function () {
                    elem.removeClass('dismiss');
                },
                end: function (drag) {
                    elem.removeClass('dismiss');
                    if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
                        scope.$apply(function () {
                            carousel.next();
                        });
                    }
                    drag.reset();
                }
            });
        }
    };
});

app.directive('dragMe', ['$drag', function ($drag) {
    return {
        controller: function ($scope, $element) {
            $drag.bind($element,
                {
                    //
                    // Here you can see how to limit movement
                    // to an element
                    //
                    transform: $drag.TRANSLATE_INSIDE($element.parent()),
                    end: function (drag) {
                        // go back to initial position
                        drag.reset();
                    }
                },
                { // release touch when movement is outside bounduaries
                    sensitiveArea: $element.parent()
                }
            );
        }
    };
}]);

//
// For this trivial demo we have just a unique MainController
// for everything
//
app.controller('MainController', function($rootScope, $scope){

  $scope.swiped = function(direction) {
    alert('Swiped ' + direction);
  };
    $scope.clients = [
        {
            lat: 59.4223848,
            lng: 24.747689,
            distance: 55,
            name: "Pulcinella",
            logo: "img/Group.png",
            closingAt: "foobar"
        },
        {
            lat: 59.4211961,
            lng: 24.7461416,
            distance: 55,
            name: "Sushicat",
            logo: "img/merch2.png",
            closingAt: "foobar"
        },
        {
            lat: 59.4250154,
            lng: 24.7539764,
            distance: 55,
            name: "Sushicat",
            logo: "img/merch3.png",
            closingAt: "foobar"
        }
    ];

    $scope.i = 0;
    $scope.client = $scope.clients[$scope.i];

    $scope.nextClient = function() {
      var i = ($scope.i+1) % $scope.clients.length;
      setActive(i);
    };


    setActive = function(i) {
      $scope.i = i;
      $scope.client = $scope.clients[i];

      // for (var k = 0; k < markers.length; k++) {
      //   markers[k].setMap(null);
      // }
      // markers = renderMarkers(map, $scope.clients, i);
    }

    $scope.bottomReached = function () {
        /* global alert: false; */
        alert('Congrats you scrolled to the end of the list!');
    };

    //
    // Right Sidebar
    //
    $scope.chatUsers = [
        {name: 'Carlos  Flowers', online: true},
        {name: 'Byron Taylor', online: true},
        {name: 'Jana  Terry', online: true},
        {name: 'Darryl  Stone', online: true},
        {name: 'Fannie  Carlson', online: true},
        {name: 'Holly Nguyen', online: true},
        {name: 'Bill  Chavez', online: true},
        {name: 'Veronica  Maxwell', online: true},
        {name: 'Jessica Webster', online: true},
        {name: 'Jackie  Barton', online: true},
        {name: 'Crystal Drake', online: false},
        {name: 'Milton  Dean', online: false},
        {name: 'Joann Johnston', online: false},
        {name: 'Cora  Vaughn', online: false},
        {name: 'Nina  Briggs', online: false},
        {name: 'Casey Turner', online: false},
        {name: 'Jimmie  Wilson', online: false},
        {name: 'Nathaniel Steele', online: false},
        {name: 'Aubrey  Cole', online: false},
        {name: 'Donnie  Summers', online: false},
        {name: 'Kate  Myers', online: false},
        {name: 'Priscilla Hawkins', online: false},
        {name: 'Joe Barker', online: false},
        {name: 'Lee Norman', online: false},
        {name: 'Ebony Rice', online: false}
    ];

    //
    // 'Forms' screen
    //
    $scope.rememberMe = true;
    $scope.email = 'me@example.com';

    $scope.login = function () {
        alert('You submitted the login form');
    };

    //
    // 'Drag' screen
    //
    $scope.notices = [];

    for (var j = 0; j < 10; j++) {
        $scope.notices.push({icon: 'envelope', message: 'Notice ' + (j + 1)});
    }

    $scope.deleteNotice = function (notice) {
        var index = $scope.notices.indexOf(notice);
        if (index > -1) {
            $scope.notices.splice(index, 1);
        }
        markers = renderMarkers(map, $scope.clients, index);
    };


    function renderMarkers(map, clients, active) {
      var markers = []
      for (var i = 0; i < clients.length; i++) {
        var settings = {
            position: $scope.clients[i],
            map: map,
            // icon: icon
        }
        if (active == i) {
          // settings.icon = licon;
        }
        var marker = new google.maps.Marker(settings);
        markers.push(marker);
      }
      return markers;
    }

    var markers = []
    function initMap() {

        var bounds = new google.maps.LatLngBounds();
        var infowindow = new google.maps.InfoWindow();
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -34.397, lng: 150.644},
            styles: [
    {
        "featureType": "landscape",
        "stylers": [
            {
                "hue": "#F1FF00"
            },
            {
                "saturation": -27.4
            },
            {
                "lightness": 9.4
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "road.highway",
        "stylers": [
            {
                "hue": "#0099FF"
            },
            {
                "saturation": -20
            },
            {
                "lightness": 36.4
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "stylers": [
            {
                "hue": "#00FF4F"
            },
            {
                "saturation": 0
            },
            {
                "lightness": 0
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "hue": "#FFB300"
            },
            {
                "saturation": -38
            },
            {
                "lightness": 11.2
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "hue": "#00B6FF"
            },
            {
                "saturation": 4.2
            },
            {
                "lightness": -63.4
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "hue": "#9FFF00"
            },
            {
                "saturation": 0
            },
            {
                "lightness": 0
            },
            {
                "gamma": 1
            }
        ]
    }
]
        });
        // var userMarker = new google.maps.Marker({
        //   map: map,
        //   position: {lat: -34.397, lng: 150.644}
        // });

        markers = renderMarkers(map, $scope.clients, $scope.i);

        for (i = 0; i < $scope.clients.length; i++) {
            // var marker = new google.maps.Marker({
            //     position: $scope.clients[i],
            //     map: map
            // });

            bounds.extend(markers[i].position);

            // google.maps.event.addListener(marker, 'click', (function (marker, i) {
            //     return function () {
            //         infowindow.setContent(
            //             '<img style="width: 100%" src="' + $scope.clients[i].logo + '"/>');
            //         infowindow.open(map, marker);
            //     }
            // })(marker, i));
            // markers.push(marker);
        }

        var GeoMarker = new GeolocationMarker(map);
        console.log(GeoMarker)
        google.maps.event.addListener(GeoMarker, 'position_changed', function() {
          console.log('change');
          bounds.extend(GeoMarker.position);
          map.setCenter(GeoMarker.position);
          map.setZoom(16);
          // map.fitBounds(bounds);
        });

        // var listener = google.maps.event.addListener(map, "idle", function () {
        //     google.maps.event.removeListener(listener);
        // });
    }

    setTimeout(initMap, 200);
});
