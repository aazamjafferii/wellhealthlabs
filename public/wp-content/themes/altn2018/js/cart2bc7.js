// JavaScript Document

jQuery(document).ready(function(){

	uploadCart();
});

function uploadCart()
{
	if( jQuery( '#testfinder-search' ).length )
	{
		if( sessionStorage.getItem( 'session_cart' ) )
		{
			jQuery( '#cartwoo' ).html( sessionStorage.getItem( 'session_cart' ) );
		}
	}
}