function addToCart(proId){
    console.log('its here');
    // location.href='/'
    
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        
        success:(response)=>{
            swal("added to cart");
            console.log('hell ---',response);
            if(response.status){
                swal("added to cart");
                
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $('#cart-count').html(count)
            }
        }
    })
}

function addToWishlist(proId){
    console.log('its here');
    $.ajax({
        url:'/add-to-wishlist/'+proId,
        method:'get',
        success:(response)=>{
            console.log('hell ---',response);
            if(response.status){
               swal('added to wishlist')
            }
        }
    })
}

function removeFromWishlist(proId){
    console.log('its ok');
    $.ajax({
        url:'/remove-from-wishlist/'+proId,
        method:'get',
        success:(response)=>{
            console.log('yes yes');
        }
    })
}