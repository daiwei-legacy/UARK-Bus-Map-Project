(function (w) {
	var touch = (mobileBrowser) ? 'touchend' : 'click', // mapping touchend and click event
		// MODERNIZR TRANSITION END EVENT
		transEndEventNames = {
		    'WebkitTransition' : 'webkitTransitionEnd',
		    'MozTransition'    : 'transitionend',
		    'OTransition'      : 'oTransitionEnd',
		    'msTransition'     : 'MSTransitionEnd',
		    'transition'       : 'transitionend'
		},
		transEnd = transEndEventNames[ Modernizr.prefixed('transition') ],
		// GOOGLE MAP OPTIONS
		mapOptions = {
			center: new google.maps.LatLng(36.068000, -94.172500),
			zoom: 14,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			streetViewControl: false,
			mapTypeControl: false
		},
		// INIT GOOGLE MAP
		map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions),
		// INIT ROUTES STORAGE
		routes = {},
		buses = [];
	// DECLEAR FUNCTIONS
	function translate (color) { // TRANSLATE COLOR INTO ROUTE ID
		var code = {n: null, rd: null};
		switch (color) {
			case 'red':
				code.n = 1;
				code.rd = 1;
				break;
			case 'brown':
				code.n = 12;
				break;
			case 'tan':
				code.n = 15;
				code.rd = 15;
				break;
			case 'yellow':
				code.n = 16;
				break;
			case 'mapleHill':
				code.n = 18;
				break;
			case 'purple':
				code.n = 19;
				code.rd = 24;
				break;
			case 'pomfret':
				code.n = 20;
				break;
			case 'route56':
				code.n = 21;
				break;
			case 'blue':
				code.n = 8;
				code.rd = 22;
				break;
			case 'green':
				code.n = 71;
				code.rd = 23;
				break;
			case 'gray':
				code.n = 88;
				break;
		}
		return code;
	} // TRANSLATE COLOR INTO ID
	function showRoute(id) { // DISPLAY ROUTE PATH & BUS POSITION
		var bus_id = drawPath(id);
		if (bus_id != null) {
			pinBus(bus_id);
			setInterval(function () {
				pinBus(bus_id);
			}, 4000);
		}
	}
	function drawPath(id) { // DRAW ROUTE PATH
		if ( (routes[id.n] && routes[id.n].inService == 1) || (routes[id.rd] && routes[id.rd].inService == 1) ) {
			var current_id = routes[id.n].inService == 1 ? id.n : id.rd;
			var shape = routes[current_id].shape,
				points = shape.split(','),
				routes_path = [];
			for (var i = 0; i < points.length; i++) {
				var pair = {};
				pair.a = Number(points[i].split(' ')[0]);
				pair.b = Number(points[i].split(' ')[1]);
				var path = new google.maps.LatLng(pair.a, pair.b);
				routes_path[i] = path;
			}
			var routes_polyline = new google.maps.Polyline({
				path: routes_path,
				strokeColor: routes[current_id].color,
				strokeOpacity: 0.8,
				strokeWeight: 4
			});
			routes_polyline.setMap(map);
			return current_id;
		} else {
			alert('No Service is available now.');
			return null;
		}
	}
	function pinBus(bus_id) {
		var url = 'http://campusdata.uark.edu/api/buses?callback=?&routeIds=' + bus_id;
		$.getJSON(url, function (data) {
			for (var i = 0; i < data.length; i++) {
				var lat = data[i].latitude,
					lng = data[i].longitude;
				if (buses[i]) buses[i].setMap(null);
				var new_bus = new google.maps.Marker({
						position: new google.maps.LatLng(lat, lng),
						map: map
					});
				buses[i] = new_bus;
			}
		});
	}
	// LOAD ROUTES INFO
	$.ajax({
		url: 'http://campusdata.uark.edu/api/routes',
		data: {},
		dataType: 'jsonp',
		jsonp: 'callback',
		jsonpCallback: 'Routes',
		cache: 'true',
		success: function (data) {
			$.each(data, function (key, val) {
				if (val.status == 1) {
					routes[val.id] = val; // 19:PURPLE 24:PURPLE REDUCED
				}
			});
		},
		error: function () {
			alert('ERROR');
		}
	});
	// ATTACH EVENT TO MENU BUTTON
	$('#menu').on(touch, 'a', function (e) {
		var rt_color = $(this).attr('class').split(' ')[1],
			rt_code = translate(rt_color);
		$('#menu-overlay').css({display: 'none'});
		showRoute(rt_code);
	});
	w.rt = routes;
})(window);
