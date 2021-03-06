var imports = [
    'map.js'
];

angular.module('portalApp')
.controller('portalmonGoCtrl', ['$scope', function ($scope) {
    $scope.campusMap = { value: null };
    
    // Load user profect
    $scope.portalHelpers.invokeServerFunction('getProfile').then(function(profile) {
        console.debug(profile);
        $scope.profile = profile; 
    });
    
    $scope.$watch('campusMap.value', function(new_value, old_value) {
		console.debug(new_value, old_value);
        if (!new_value) return;
        
        // Disable map panning
        new_value.map.dragging.disable();
        new_value.map.touchZoom.disable();
        new_value.map.doubleClickZoom.disable();
        new_value.map.scrollWheelZoom.disable();
        
        // Start watching for the user's location
        new_value.map.locate({
            setView: true,
			watch: true,
			timeout: 10000,
			enableHighAccuracy: true,
            maxZoom: 18
		});
        
        new_value.map.on('locationerror', function (event) {
            
        });
        
        new_value.map.on('locationfound', function(event) {
		   $scope.currentLocation = event.latlng;
        });
    });
    
    $scope.range = function(n) {
      return new Array(n);  
    };
    
    // Get current pooplets count
    $scope.updatePooplets = function(count) {
        if (!count) { count = 0; }
        $scope.portalHelpers.invokeServerFunction('updatePooplets', { pooplets: count}).then(function(res) {
           $scope.profile.collected.geese = res; 
        });
    };
    
    $scope.play = function() {
        $scope.portalHelpers.showView('portalmonGoMain.html', 1);
    };
    
    $scope.getPoop = function(stop_id, feature, $status){
        // Check if we're within range
        //if ($scope.currentLocation.distanceTo(latlng) < 40) {
        var pooplets = Math.floor(((Math.random() * 100) % 4) + 1);
        $scope.portalHelpers.invokeServerFunction('visit', { stop_id: stop_id, pooplets: pooplets });
        $scope.updatePooplets(pooplets);

        $status.replaceWith($("<p>You have already visited this Portastop.</p>"));
        /*} else {
               $status.text('Sorry, you are not close enough to the Porta Stop');
        }*/
        
        $scope.active_stop = {
        	id: stop_id,
            name: feature.properties.name || feature.properties.building_name,
            collected_geese: pooplets
        };
        $scope.portalHelpers.showView('portastop.html', 2);
    };
    
    // Show main view in the first column as soon as controller loads
	// TODO: Re-enable splash screen
	$scope.portalHelpers.showView('loading.html', 1);
	//$scope.portalHelpers.showView('portalmonGoMain.html', 1);
    
    
    // MAP CONFIGURATIN
    $scope.mapConfig = {
        debug: false,

        imagePath: 'https://uwaterloo.ca/map/dist',

        mapapi: {
            base: 'https://uwaterloo.ca/map/api/'
        },
        uwapi: {
            key: '5fb11aadde8964cb5c8a7cc2d243699f',
            base: 'https://api.uwaterloo.ca/'
        },
        valhalla_api_key: '',

        map: {
            config: {
                center: [43.46898830444233,-80.54055154323578],
                zoom: 16,
                minZoom: 11,
                maxBounds: [[43.25,-81.0467],[43.71,-80.1528]],
                zoomControl: false
            },

            scalebar: {
                position: 'bottomleft',
                metric: true
            },

            locator: {
                position: 'topleft',
                marker_style: {
                    radius: 6,
                    stroke: true,
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fill: true,
                    fillColor: '#0033ff',
                    fillOpacity: 1,
                    clickable: false
                },
                accuracy_marker_style: {
                    stroke: true,
                    color: '#abcdef',
                    weight: 3,
                    opacity: 0.5,
                    fill: true,
                    fillColor: '#abcdef',
                    fillOpacity: 0.2,
                    clickable: false
                }
            },

            controls: {
                north_arrow: {
                    position: 'bottomleft',
                    html: function () { return `<img alt="North arrow" height="30" width="20" src="${L.Icon.Default.imagePath}/north.png">` }
                }
            },

            tiles: {
                D: {
                    name: 'Campus Map',
                    url: 'https://uwaterloo.ca/map/tiles/default/{z}/{x}/{y}.png',
                    config: {
                        maxNativeZoom: 18,
                        maxZoom: 18,
                        attribution: '<a href="http://www.openstreetmap.org/copyright">Map data © OpenStreetMap contributors.</a>'
                    }
                },
                H: {
                    name: 'High Contrast',
                    url: 'https://uwaterloo.ca/map/tiles/hc/{z}/{x}/{y}.png',
                    config: {
                        maxNativeZoom: 18,
                        maxZoom: 18,
                        attribution: '<a href="http://www.openstreetmap.org/copyright">Map data © OpenStreetMap contributors.</a>'
                    }
                }
            },

            default_tiles: 'D',

            buildings: {
                type: 'ubuildings',
                id: 'buildings',
                name: 'Buildings',
                endpoint: 'v2/dev/null',
                endpoint_options: { source: 'osm' },
                indoor_maps_endpoint: 'indoor-maps/buildings'
            },
            layers: [{
                type: 'uwapi',
                id: 'stops',
                name: 'Porta Stops',
                endpoint: 'v2/buildings/list',
                icon_class: 'icon-star-circled',
                autoload: true,
                options: {
                    featureName: function(config, feature) {
                        return feature.properties.building_name;
                    },
                    popupContent: function(config, feature, latlng) {
                        var $status = $('<div class="play"><a>Visit</a></div>');
                        $status.click(function(e) {
                            $scope.getPoop(feature.properties.building_id, feature, $status); 
                        });
                        return $status[0];
                    },
                    filter: function(feature, layer) {
                        return feature.properties.building_parent == null;
                    }
                }
            }]
        },

        geocoder: {
            serviceUrl: 'https://uwaterloo.ca/map/api/geocoder/'
        },

        directions: {
            addWaypoints: true,
            useZoomParameter: true,
            autoRoute: true,
            lineOptions: {
                styles: [{color: 'white', opacity: 1, weight: 8},
                         {color: 'black', opacity: 1, weight: 6},
                         {color: '#00b6ff', opacity: 1, weight: 4}]
            },
            summaryTemplate: '<h4>Directions</h4><p class="route-summary">{distance}, {time}</p>',
            collapsible: false,
            show: false,
            containerClassName: 'routing',
            collapseBtn: function(itinerary) {
                let collapseBtn = L.DomUtil.create('a', 'leaflet-routing-collapse-btn');
                let showIcon = L.DomUtil.create('i', 'icon-direction ri-show', collapseBtn);
                let hideIcon = L.DomUtil.create('i', 'icon-cancel ri-hide', collapseBtn);

                L.DomEvent.on(collapseBtn, 'click', itinerary._toggle, itinerary);
                itinerary._container.insertBefore(collapseBtn, itinerary._container.firstChild);
            }
        },

        present: function(title, element, callback = null, returnFocus = null) {
            console.warn('Presenting', title, element);

            let backdrop = L.DomUtil.create('div', 'modal-backdrop fade in', document.body);
            let modal = L.DomUtil.create('div', 'modal fade in', document.body);
            let dialog = L.DomUtil.create('div', 'modal-dialog modal-lg', modal);
            let content = L.DomUtil.create('div', 'modal-content', dialog);

            let keyboardCallback = function (event) {
                if (event.keyCode === 27) { // ESC key
                    closePopup();
                }// End of if
            };
            let closePopup = function (){
                modal.parentElement.removeChild(modal);
                backdrop.parentElement.removeChild(backdrop);
                L.DomEvent.removeListener(window, 'keyup', keyboardCallback);

                if (returnFocus) {
                    returnFocus.focus();
                }// End of if

                if (callback) callback();
            }// End of close function

            modal.style.display = 'block';

            L.DomEvent.addListener(modal, 'click', function(event) {
                if ((event.target || event.srcElement) !== modal) return;
                closePopup();
            });

            L.DomEvent.addListener(window, 'keyup', keyboardCallback);

            // Modal header
            let header = L.DomUtil.create('div', 'modal-header', content);

            let close_button = L.DomUtil.create('button', 'close', header);
            close_button.type = 'button';
            close_button.setAttribute('arial-label', 'close');

            if (!close_button.data) close_button.data = {};
            close_button.data.dismiss = 'modal';

            close_button.innerHTML = '<span aria-hidden="true">&times;</span>';
            L.DomEvent.addListener(close_button, 'click', closePopup);

            let header_title = L.DomUtil.create('h2', 'modal-title', header);
            header_title.innerHTML = title;

            // Modal body
            let body = L.DomUtil.create('div', 'modal-body', content);
            body.appendChild(element);

            // Focus the modal
            setTimeout(function () { close_button.focus() }, 100);
        },

        data_providers: [
            {
                name: 'OpenStreetMap',
                description: 'Map data © OpenStreetMap contributors',
                license: 'http://www.openstreetmap.org/copyright'
            },
            {
                name: 'University of Waterloo Open Data API',
                description: 'Contains information provided by the University of Waterloo under license on an \'as is\' basis',
                license: 'https://uwaterloo.ca/open-data/university-waterloo-open-data-license-agreement-v1'
            },
            {
                name: 'Nominatim',
                description: 'Contains geocoding by Nominatim',
                service_information: 'http://wiki.openstreetmap.org/wiki/Nominatim'
            },
            {
                name: 'Mapzen',
                description: 'Contains routing by Mapzen under license on an \'as is\' basis',
                license: 'https://mapzen.com/terms/'
            },
            {
                name: 'Regional Municipality of Waterloo',
                description: 'Contains information provided by the Regional Municipality of Waterloo under licence',
                license: 'http://www.regionofwaterloo.ca/en/regionalGovernment/OpenDataLicence.asp'
            },
            {
                name: 'Metrolinx',
                description: 'Data used in this product or service is provided with the permission of Metrolinx. Metrolinx makes no representations or warranties of any kind, express or implied, and assumes no responsibility for the accuracy or currency of the data used in this product or service.',
                license: 'http://www.gotransit.com/publicroot/en/schedules/DeveloperResources.aspx#useagreement'
            }
        ]
    };
}]);