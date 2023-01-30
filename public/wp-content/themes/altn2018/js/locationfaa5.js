// JavaScript Document

var geocoder = '';
var geo_latitude = 0;
var geo_longitude = 0;

jQuery(document).ready(function(){

	autoCompleteLocation();	
	locationPage();		
});

function autoCompleteLocation()
{
	if(jQuery('#input_location').length)
	{
		var cachetest = {};
		
		jQuery('#input_location').focusin(function(){
			jQuery(this).val('');
		});
		
		jQuery( '#input_location' ).autocomplete({
		  	minLength: 2,
			source: location_vars
		});
	}
}

function closeFindLocation()
{
	jQuery('#findlocation-popup').hide();
}

function closeInformation(i)
{
	jQuery('#more'+ i).hide();
	jQuery('#resultscontainer').show();
}

function getLocationPosition(position)
{
	geo_latitude = position.coords.latitude;
	geo_longitude = position.coords.longitude;
	
	var sku = 'NO';
	var test = '';
	if (typeof popupskulocation !== 'undefined')
	{
		sku = popupskulocation;
		test = 'test'
	}
	
	locationPageDoSearch(geo_latitude, geo_longitude, test, sku);
}

function getLocationPositionError(error)
{
	switch(error.code) 
	{
    	case error.PERMISSION_DENIED:
      		alert("User denied the request for Geolocation.");
      	break;
    	case error.POSITION_UNAVAILABLE:
      		alert("Location information is unavailable.");
      	break;
    	case error.TIMEOUT:
      		alert("The request to get user location timed out.");
      	break;
    	case error.UNKNOWN_ERROR:
      		alert("An unknown error occurred.");
     	 break;
  	}
}

function getMoreInformation(element, i)
{
	var more = '<div class="hide moreinfo" id="more'+ i +'"><a href="javascript:closeInformation('+ i +')" class="close" title="Close information">CLOSE</a><div class="number"><span>'+ (i+1) +'</span></div><div class="theinfo"><div class="information"><h3>'+ element.title +'</h3><div class="maddress"><div class="address">'+ element.address +'</div><div class="city">'+ element.city +', '+ element.state +' '+ element.zip +'</div></div><div class="contact"><div class="telephone"><span><i class="fas fa-phone"></i></span> <a href="tel:'+ stringtonumber(element.phone) +'" target="_blank" title="'+ element.phone +'">'+ transformPhone( element.phone ) +'</a></div>';
	
	if(element.fax != '')
	{
		more += '<div class="telephone"><span><i class="fas fa-fax"></i></span> <a href="tel:'+ stringtonumber(element.fax) +'" target="_blank" title="'+ element.fax +'">'+ element.fax +'</a></div>';
	}
	
	if(element.directions != '')
	{
		more += '<div class="direction"><img src="'+ php_vars.template_url +'/img/direction.png" /> <a href="'+ element.directions +'" target="_blank" title="Get directions">Get directions</a></div>';
	}
	
	more += '</div></div><div class="hours"><h5>Hours</h5>';
	
	if(Array.isArray(element.hours))
	{	
		element.hours.forEach(function(hour) {
			
			more += '<div class="day">'+ hour.day +'</div><div class="time">';
			
			if(hour.start == '' && hour.end == '')
			{
				more += 'CLOSED';
			}
			else if(hour.start != '' && hour.end == '')
			{
				more += 'BY APPOINTMENT';
			}
			else
			{
				more += hour.start +' to '+ hour.end;
			}
			
			more += '</div>';
			
		});
	}
	
	more += '</div><div class="services"><h5>Services offered</h5>';
	
	if(Array.isArray(element.services))
	{
		element.services.forEach(function(service) {
			
			more += '<div class="middle">'+ service +'</div>';
			
		});
	}
	
	more += '</div>';
	
	if(element.more != '')
	{
		more += '<div class="more-information">'+ element.more +'</div>';
	}
	
	more += '<div class="button-side"><a href="'+ element.url +'" class="button-normal" title="Select this location">Select this location</a></div></div>';
	
	jQuery('#moreinfo').append(more);
}

function initialize() 
{
	geocoder = new google.maps.Geocoder();
	
	if(jQuery('#location_page').length || jQuery('#findlocation-popup').length)
	{
		if (typeof virtual_lat !== 'undefined') 
		{
			var sku = 'NO';
			var test = '';
			if (typeof popupskulocation !== 'undefined')
			{
				sku = popupskulocation;
				test = 'test'
			}
			
			locationPageDoSearch(virtual_lat, virtual_lon, test, sku);
		}		
		else if (navigator.geolocation) 
		{
			navigator.geolocation.getCurrentPosition(getLocationPosition, getLocationPositionError);
		}
		else
		{			
			alert('Geolocation is not supported by this browser');
		}
	}
}

function locationCalcDistanceBetween(lat1, lon1, lat2, lon2) 
{        
	var R = 3958.7558657440545; 
	var dLat = toRad(lat2-lat1);
	var dLon = toRad(lon2-lon1); 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}

function locationPage()
{
	if(jQuery('#location_page').length)
	{
		jQuery('#input_location').on('keydown', function(e) {
    		if (e.which == 13 || e.keyCode == 13) {
        		e.preventDefault();
				locationPageFindLocation('', 'NO');
    		}
		});
	}
}

function locationPageDoSearch(lat, lng, page, sku)
{        
	jQuery('#resultscontainer').show();
	jQuery('#modal-test').show();
	jQuery("#results").empty();
	jQuery('#moreinfo').empty();
	
	var firstlat = 0;
	var firstlon = 0;
	var markers = new Array();
	
	for (var i = 0; i < locations.length; i++) 
	{
		locations[i].d = locationCalcDistanceBetween(locations[i].latitude, locations[i].longitude, lat, lng);
	}    
	
	locations.sort(function(a, b){
		return a.d - b.d
	})
	
	var maxlocation = 12;
	if (typeof virtual_lat !== 'undefined') 
	{
		maxlocation = 3;
		jQuery('#resultscontainer').addClass('onlythree');
	}
	
	if(locations.length < maxlocation)
	{
		maxlocation = locations.length;
	}
	
	/* Crack Orlando franchise *************************************/
	var addressinput = jQuery('#input_location').val();
	var minaddr = addressinput.toLowerCase();
	if(minaddr == 'orlando')
	{
		var tempitem, tempnum;
		
		for (var i = 0; i < maxlocation; i++) 
		{
			if( parseInt( locations[i].id ) == 119 )
			{
				tempitem = locations[i];
				tempnum = i;
			}
		}
		
		locations.splice(tempnum,1);
		
		locations.unshift(tempitem);
	}
	/* END Crack Orlando franchise **********************************/
	
	/* Crack Virginia franchise *************************************/
	if(minaddr == 'virginia')
	{
		var tempitem, tempnum;
		
		for (var i = 0; i < maxlocation; i++) 
		{
			if( parseInt( locations[i].id ) == 215 )
			{
				tempitem = locations[i];
				tempnum = i;
			}
		}
		
		locations.splice(tempnum,1);
		
		var first = locations[0];
		locations.splice(0,1);			
		
		locations.unshift(tempitem);
		locations.unshift(first);
	}
	/* END Crack Virginia franchise **********************************/
	
	/* ONLY PPC ******************************************************/
	
	var urlextra = '';
	if ( typeof onlyppc !== 'undefined' )
	{
		if( !isNaN( onlyppc ) )
		{
			if( 1 == onlyppc )
			{
				urlextra = '?onlyppc=1';
			}
		}
	}	
	
	/* END ONLY PPC **************************************************/
	
	for (var i = 0; i < maxlocation; i++) 
	{
		var html = '<article class="franchise"><div class="num"><span>'+ (i+1) +'</span></div><div class="name"><h4>'+ locations[i].title +'</h4><div class="address">'+ locations[i].address +'</div><div class="city">'+ locations[i].city +', '+ locations[i].state +' '+ locations[i].zip +'</div></div><div class="more">';
		
		if(page != 'test')
		{
			html += '<a href="javascript:openInformation('+ i +')" class="icon-info" title="Open information">INFO</a>';
		}
		
		html += '</div><div class="select"><a href="'+ locations[i].url + urlextra +'" class="icon-select" title="Select this location">SELECT</a></div>';
		
		if(page != 'test')
		{
		 	getMoreInformation(locations[i], i);
		}
		
		html += '</article>';
		
		jQuery("#results").append(html);
		
		/* SCROLL PANEL */
		
		var widthwindow = parseInt(jQuery( window ).width());
		if(widthwindow > 767)
		{
			jQuery('#resultscontainer').scrollpanel({
				prefix: 'sp-'
			});
		}
		
		/* END SCROLL PANEL */
		
		if(i == 0)
		{
			firstlat = locations[i].latitude;
	 		firstlon = locations[i].longitude;
		}		
		
		var num = i + 1;		
		var lab = String(num);
		
		var markerLatlng = new google.maps.LatLng(locations[i].latitude,locations[i].longitude);
		markers[i] = new google.maps.Marker({
    		position: markerLatlng,
    		title: locations[i].title,
			label: {
        		text: lab,
				color : '#ffffff',
				fontFamily : 'Open Sans',
				fontSize : '20px',
				fontWeight : '800'
    		},
			icon : php_vars.template_url +'/img/icon-marker.png'
		});
		
		markers[i].addListener('click', function() {
			
			var text = this.getLabel().text;
			var num = parseInt(text) - 1;
          	openInformation(num);
			
        });
	}
	
	if(jQuery('#googlemap').length)
	{	
		var myLatlng = new google.maps.LatLng(firstlat,firstlon);
		var mapOptions = {
		  zoom: 10,
		  center: myLatlng
		}
		var map = new google.maps.Map(document.getElementById("googlemap"), mapOptions);
	
		for (var i = 0; i < maxlocation; i++) 
		{
			markers[i].setMap(map);
		}
	}
	
	return maxlocation;
}

function locationPageFindLocation(page, sku)
{
	try{
		var addressinput = jQuery('#input_location').val();
		
		if(typeof replaces != "undefined")
		{
			replaces.forEach(function(element) {
				addressinput = addressinput.replace(element.name, element.replaceit);
			});
		}
		
		if(typeof locations != "undefined")
		{	
			geocoder = new google.maps.Geocoder();
				
			geocoder.geocode( { 'address': addressinput + ' USA'}, 
				function(results, status) {
					if (status == google.maps.GeocoderStatus.OK)
					{
						var maxnum = locationPageDoSearch(results[0].geometry.location.lat(), results[0].geometry.location.lng(), page, sku);
						
						if(typeof dataLayer !== "undefined")
						{
							if(maxnum > 0)
							{
								dataLayer.push({
									'event': 'pageview',
									'pagePath':  php_vars.principal_url +'/locations/?address='+ addressinput,
									'pageTitle' : 'Search Location: '+ addressinput
								});						
							}
							else
							{
								dataLayer.push({
									'event': 'pageview',
									'pagePath':  php_vars.principal_url +'/locations/?address='+ addressinput +'&noresult=1',
									'pageTitle' : 'Search Location: '+ addressinput + ' >> No results'
								});
							}
						}
					}
			});
		}
	}
	catch(err) {
  		jQuery("#results").html('Try again later...');
	}
}

function openFindLocation()
{
	var widthwindow = parseInt(jQuery( window ).width());
	if(widthwindow < 768)
	{
		jQuery('body,html').animate({
			scrollTop: 0 ,
			}, 100
		);
	}
	
	jQuery('#findlocation-popup').show();
	
	jQuery('#input_location').on('keydown', function(e) {
		if (e.which == 13 || e.keyCode == 13) {
			e.preventDefault();
			locationPageFindLocation(jQuery('#findlocation-popup').attr('type'), jQuery('#findlocation-popup').attr('sku'));
		}
	});
	
	if ( typeof google.load !== 'undefined' ) 
	{
		google.load("maps", "3", { callback: initialize, other_params: "key=AIzaSyBa6ny_Avz0YlPPykyhrDCaPswyQn54cH0" });
	}
}

function openInformation(i)
{
	jQuery('#resultscontainer').hide();
	jQuery('.moreinfo').hide();
	jQuery('#more'+ i).show();
}

function transformPhone( phone )
{
	return phone.replace( '8378', 'TEST' );
}

function toRad(Value) 
{
	return Value * Math.PI / 180;
}
