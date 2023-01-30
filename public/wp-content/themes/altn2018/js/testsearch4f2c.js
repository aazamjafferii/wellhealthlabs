// JavaScript Document

var categories = [];

jQuery(document).ready(function(){

	autoComplete();
	
});

jQuery(window).load(function(){
	
	executeHeight();
	
});

function autoComplete()
{
	if( jQuery('#testfinder-search').length )
	{
		var cachetest = {};
		
		jQuery( '#testfinder-search' ).autocomplete({
		  	minLength: 2,
			source: test_vars
		});
	}
}

function executeCategory(term_id)
{	
	if(jQuery('#category'+ term_id).hasClass('on'))
	{
		jQuery('#category'+ term_id).removeClass('on');
		jQuery('#child'+ term_id).fadeOut(500);
		jQuery('.childof'+ term_id).removeAttr('checked');
		
		jQuery('#label'+ term_id).remove();
		
		categories = executeRemoveElement(categories, parseInt(term_id));
		
		jQuery('.childof'+ term_id).each(function(){
			
			var itemvalue = parseInt(jQuery(this).val());
			
			categories = executeRemoveElement(categories, itemvalue);
			jQuery('#label'+ itemvalue).remove();
			
		});
	}
	else
	{
		jQuery('#category'+ term_id).addClass('on');
		jQuery('#child'+ term_id).fadeIn(500);
		
		categories.push(parseInt(term_id));
		
		jQuery('.childof'+ term_id).each(function(){
		
			categories.push(parseInt(jQuery(this).val()));
			
		});
	}
	
	executeResults();	
}

function executeCategoryChild(term_id)
{
	var nochild = true;
	
	categories = executeRemoveElement(categories, parseInt(term_id));
	
	jQuery('.childof'+ term_id).each(function(){
		
		var itemvalue = parseInt(jQuery(this).val());
		
		if(jQuery(this).is(':checked'))
		{			
			if(categories.indexOf(itemvalue) == -1)
			{				
				categories.push(itemvalue);
			}
			
			nochild = false;
		}
		else
		{
			jQuery('#label'+ itemvalue).remove();
						
			categories = executeRemoveElement(categories, itemvalue);
		}
		
	});
	
	if(nochild)
	{
		categories.push(parseInt(term_id));
		
		jQuery('.childof'+ term_id).each(function(){
		
			categories.push(parseInt(jQuery(this).val()));
			
		});
	}
	
	executeResults();
}

function executeClear()
{
	categories = [];
	jQuery('#results-names').html('');
	jQuery('#results-text-search').html('');
	jQuery('#order-select').val(0);
	jQuery('#test-search').val('');
	
	jQuery('.category-checkbox').removeAttr('checked');
	
	jQuery('.category').removeClass('on');
	jQuery('.childs').fadeOut(500);
	
	executeResults();
	
	window.history.pushState("", "", '/test-finder/');
}

function executeHeight()
{
	if(jQuery('#testfinder').length)
	{
		var heigth = jQuery('#testfinder').innerHeight();
		jQuery('#testfinder #filters').height(heigth);
	}
}

function executeName( tempcat )
{
	jQuery( '#results-names' ).html( '' );
	
	for( i = 0;  i < tempcat.length; i++ )
	{
		var label = jQuery( 'label[for="input-category'+ tempcat[ i ] +'"]' ).text();
		
		var separator = ', ';
		if( 0 == i )
		{
			separator = '';
		}
		
		jQuery('#results-names').append( '<span id="label'+ tempcat[ i ] +'">'+ separator + label +'</span>' );
	}
}

function executePanel()
{
	if(jQuery('#test-panel').is(':checked'))
	{
		jQuery('#results-tests .tests a').each(function(){
		
			var title = jQuery(this).attr('title');
			
			if(title.search("Panel") == -1)
			{
				jQuery(this).addClass('nopanel');
			}
			
		});
	}
	else
	{
		jQuery('#results-tests a').removeClass('nopanel');
	}
	
	executeHeight();
}

function executeRemoveElement(arr, ele)
{
	for( var i = 0; i < arr.length; i++)
	{ 
   		if ( arr[i] === ele) 
		{
     		arr.splice(i, 1); 
   		}
	}
	
	return arr;
}

function executeResults()
{
	var theselect = [];
	jQuery('.category-checkbox').each(function(){
		if(jQuery(this).is(':checked'))
		{
			theselect.push(parseInt(jQuery(this).val()));
		}
	});
	
	sessionStorage.setItem('categories_session', JSON.stringify(categories));
	sessionStorage.setItem('theselect_session', JSON.stringify(theselect));
	
	jQuery('#results-tests').html('<div class="textcenter"><img src="'+ php_vars.template_url +'/img/loading-gif-orange-1.gif" alt=""></div>');
	jQuery('#order-select').val(0);
	
	var search_text = jQuery('#test-search').val();
	var ap = jQuery('#ap').val();
	
	jQuery.post(php_vars.ajax_url, {'action' : 'get_search_tests', 'search' : search_text, 'categories' : categories, 'ap' : ap})
		.done(function( data ) {
		
			jQuery('#results-tests').html( data );
			jQuery('#test-panel').prop('checked', false);
			executeHeight();
		
	});
	
	executeName( theselect );
}

function executeReturnResults()
{
	var categories_session = JSON.parse(sessionStorage.getItem('categories_session'));
	var theselect_session = JSON.parse(sessionStorage.getItem('theselect_session'));
	
	categories = categories_session;
	
	if(Array.isArray(theselect_session))
	{
		for(var i = 0; i < theselect_session.length; i++)
		{
			jQuery('#input-category'+ theselect_session[i]).prop('checked', true);
			jQuery('#category'+ theselect_session[i]).addClass('on').prop('checked', true);
			jQuery('#child'+ theselect_session[i]).fadeIn();
		}
	}
	
	executeResults();
}

function filterBoxClose()
{
	jQuery('#testfinder #filters .box.filter').hide();
}

function filterBoxCloseSort()
{
	jQuery('#testfinder #filters .box.select').hide();
}

function filterBoxOpen()
{
	jQuery('#testfinder #filters .box.filter').show();
}

function filterBoxOpenSort()
{
	jQuery('#testfinder #filters .box.select').show();
}

function filterOrderOpen()
{
	if(jQuery('#testfinder #results .order').hasClass('open'))
	{
		jQuery('#testfinder #results .order').removeClass('open');
	}
	else
	{
		jQuery('#testfinder #results .order').addClass('open');
	}
}

function filterTestOrderBy( nameid )
{
	var option = jQuery( nameid ).val();
	
	if(option > 0)
	{
		jQuery('#ordertestby .results-link').addClass('hide');
		
		var items = jQuery('#ordertestby .results-link').toArray();
		
		if(option == 1)
		{			
			items.sort(function (a, b) {				
			  	var contentA = parseInt( jQuery(a).attr('number'));
			  	var contentB = parseInt( jQuery(b).attr('number'));
			  	return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
		   	});			
		}
		else if(option == 2)
		{		
			items.sort(function (a, b) {				
			  	var contentA = jQuery(a).attr('title');
			  	var contentB = jQuery(b).attr('title');
			  	return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
		   	});
		}
		else if(option == 3)
		{		
			items.sort(function (a, b) {				
			  	var contentA = parseFloat(jQuery(a).attr('price'));
			  	var contentB = parseFloat(jQuery(b).attr('price'));
			  	return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
		   	});			
		}
		
		jQuery('#ordertestby').html(items);
		
		showMoreTest(php_vars.max_tests);
		
		filterBoxCloseSort();
	}
}

function panelClose()
{
	jQuery('#test-what-panel').hide();
}

function panelOpen()
{
	jQuery('#test-what-panel').show();
}


function showMoreTest(num)
{
	var count = 0;
	jQuery('#results .tests a.hide').each(function(){
	
		if(count < num)
		{
			jQuery(this).removeClass('hide');
		}
		
		count++;
		
	});
	
	if(count <= num)
	{
		jQuery('#testfinder #results .show-more .button').hide();
	}
	
	executeHeight();
}