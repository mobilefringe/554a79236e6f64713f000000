/*Created 2015-05-18  by RKS*/
function init(){
    $('<div class="modal-backdrop custom_backdrop"><img src="//kodekloud.s3.amazonaws.com/sites/554a79236e6f64713f000000/69e8cd982124dc73de1f5a67a627ee75/loading.gif" class="" alt=""></div>').appendTo(document.body);
    
    var current_year = moment().year();
    $("#current_year").text(current_year);

    var collapse_shopping = ["/hours", "/map", "/stores", "/pages/erinmills-location"];
    var collapse_events = ["/events", "/promotions", "/redevelopment", "/trend-report", "/pages/erinmills-video-gallery"];
    var collapse_guest_services = ["/pages/erinmills-gift-cards", "/pages/erinmills-accessibility", "/pages/erinmills-guest-services", "/pages/erinmills-security-services"];
    var collapse_centre_info = ["/pages/erinmills-contact-us", "/pages/erinmills-being-green-environmental-initiatives","/pages/erinmills-pr-releases","/pages/erinmills-leasing-information","/pages/erinmills-community-partners"];
    var path = window.location.pathname
    
    if ($.inArray(path, collapse_shopping) >= 0){
        $('#collapse_shopping').collapse('toggle')
    }
    
    if ($.inArray(path, collapse_events) >= 0){
        $('#collapse_events').collapse('toggle')
    }
    if ($.inArray(path, collapse_guest_services) >= 0){
        $('#collapse_guest_services').collapse('toggle')
    }
    if ($.inArray(path, collapse_centre_info) >= 0){
        $('#collapse_centre_info').collapse('toggle')
    }
}

function init_hours(){
    var monday_hours = getRegHoursForDayIndex(1);
    var saturday_hours = getRegHoursForDayIndex(6);
    var sunday_hours = getRegHoursForDayIndex(0);
    
    renderLayoutHours('#monday_hours_container', '#monday_hours_template', monday_hours);
    renderLayoutHours('#saturday_hours_container', '#saturday_hours_template', saturday_hours);
    renderLayoutHours('#sunday_hours_container', '#sunday_hours_template', sunday_hours);
}
    
function renderLayoutHours(container, template, collection){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    item_list.push(collection);
    $.each( item_list , function( key, val ) {
        var open_time = moment(val.open_time).tz(getPropertyTimeZone());
        var close_time = moment(val.close_time).tz(getPropertyTimeZone());
        val.h = open_time.format("h:mma") + " - " + close_time.format("h:mma");
        
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });
    $(container).html(item_rendered.join(''));
}

function renderSideEvents(container, template, collection, type){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    item_list.push(collection);
    console.log(collection, type)
    if (type=="event"){
        $.each( item_list , function( key, val ) {
            if ((val.event_image_url).indexOf('missing.png') > -1){
                val.alt_promo_image_url = "//kodekloud.s3.amazonaws.com/sites/554a79236e6f64713f000000/172a94a0e1dd6a2eeec91e2cea4e8b92/logo.png"
                if (val.eventable_type == "Store") {
                    var store_details = getStoreDetailsByID(val.eventable_id);
                    if ((store_details.store_front_url_abs).indexOf('missing.png') === -1) {
                        val.alt_promo_image_url = (store_details.store_front_url_abs);    
                    }
                }
            } else {
                val.alt_promo_image_url = getImageURL(val.event_image_url);
            }
            var rendered = Mustache.render(template_html,val);
            item_rendered.push(rendered);
        });
    } else if(type=="promo") {
        var all_promos = [];
        $.each( item_list , function( key, val ) {
            if (val.name.length > 60 ) {
               val.name_shortened =  val.name.substring(0,60)+'...';
            } else {
                val.name_shortened =  val.name;
            }
            if (val.promotionable_type == "Store") {
                var store_details = getStoreDetailsByID(val.promotionable_id);
                console.log(store_details)
                if ((store_details.store_front_url).indexOf('missing.png') > -1) {
                    val.store_logo = "//kodekloud.s3.amazonaws.com/sites/554a79236e6f64713f000000/172a94a0e1dd6a2eeec91e2cea4e8b92/logo.png";
                } else {
                    val.store_logo = (store_details.store_front_url_abs);    
                }
            } else {
                val.store_logo = "//kodekloud.s3.amazonaws.com/sites/554a79236e6f64713f000000/172a94a0e1dd6a2eeec91e2cea4e8b92/logo.png";
            }
            
            if ((val.promo_image_url).indexOf('missing.png') > -1){
                val.alt_promo_image_url = "//kodekloud.s3.amazonaws.com/sites/554a79236e6f64713f000000/172a94a0e1dd6a2eeec91e2cea4e8b92/logo.png";
            } else {
                val.alt_promo_image_url = getCloudinaryImageUrl(val.promo_image_url);
            }
            
            var start = moment(val.start_date).tz(getPropertyTimeZone());
            var end = moment(val.end_date).tz(getPropertyTimeZone());
            if (start.format("DMY") == end.format("DMY")){
            	val.dates = start.format("MMM D");
            } else {
            	val.dates = start.format("MMM D") + " - " + end.format("MMM D");
            }
            
            var rendered = Mustache.render(template_html,val);
            item_rendered.push(rendered);
        });
    }
    $(container).html(item_rendered.join(''));
}

function renderBanner(banner_template,home_banner,banners){
    var item_list = [];
    var item_rendered = [];
    var banner_template_html = $(banner_template).html();
    Mustache.parse(banner_template_html);   // optional, speeds up future uses
    $.each( banners , function( key, val ) {
        val.image_url=val.image_url;
        today = new Date;
        start = new Date (val.start_date);
        start.setDate(start.getDate());
        if(val.url == "" || val.url === null){
           val.css = "style=cursor:default;";
           val.noLink = "return false";
        }
        if (start <= today){
            if (val.end_date){
                end = new Date (val.end_date);
                end.setDate(end.getDate() + 1);
            if (end >= today){
                item_list.push(val);  
            }
             
        } else {
            item_list.push(val);
        }
       }
    });

    $.each( item_list , function( key, val ) {
        var repo_rendered = Mustache.render(banner_template_html,val);
        item_rendered.push(repo_rendered);
    });
    
    $(home_banner).show();
    $(home_banner).html(item_rendered.join(''));
    $('.item').first().addClass('active');
    $('.flexslider').flexslider({
        animation: "slide",
        controlNav: true,
        directionNav: true,        
        prevText: "",
        nextText: ""
    });
}


function convert_hour(d){
    var h = (d.getUTCHours());
    var m = addZero(d.getUTCMinutes());
    var s = addZero(d.getUTCSeconds());
    if (h >= 12) {
        if ( h != 12) {
            h = h - 12;    
        }
        
        i = "pm"
    } else {
        i = "am"
    }
    if (m <= 0){
        return h+i;
    }
    else{
        return h+":"+m+i;
    }
}


function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function toggle_mobile_menu(){
        if($(".mobile_menu").is(":visible")){
            $(".mobile_menu").slideUp();    
        } else {
            $(".mobile_menu").slideDown();
        }
    
    }
    
    function show_mobile_sub_menu(id){   
        
        if ($("#mobile-"+id).is(":visible")){
                $("#mobile-"+id).slideUp();
            } else {
                if ($(".mobile_sub_menu_div").is(":visible")){
                    $(".mobile_sub_menu_div").slideUp();
                     $("#mobile-"+id).slideDown();
                     
                } else {
                    $("#mobile-"+id).slideDown(); 
                }
                
        }
    }
    function get_month (id){
            switch(id) {
                case 0:
                    month = "Jan"
                    break;
                case 1:
                    month = "Feb"
                    break;
                case 2:
                    month = "Mar"
                    break;
                case 3:
                    month = "Apr"
                    break;
                case 4:
                    month = "May"
                    break;
                case 5:
                    month = "June"
                    break;
                case 6:
                    month = "July"
                    break;
                case 7:
                    month = "Aug"
                    break;
                case 8:
                    month = "Sep"
                    break;
                case 9:
                    month = "Oct"
                    break;
                case 10:
                    month = "Nov"
                    break;
                case 11:
                    month = "Dec"
                    break;
                    
            }
            return month;
        }

$(document).ready(function(){
    $(document).bind('render:complete', function() {
        // $('.site_content_container').height($('.side_nav').height());
        $('[rel=lightbox], [rel=lightbox-gallery]').slimbox();
    });

    $('.syria_link').click(function(e){
        var url = $(this).attr("href");
        ga('send', 'event', 'Outbound Links', e.currentTarget.host, url);
    });
    
    $(window).on("load", function() {
        var navHeight = $('.side_nav').height();
        var contentHeight = $('.site_content_container').height();
        if (navHeight > contentHeight) {
            $('.site_content_container').height(navHeight);
        }
    });
});