$(document).ready(function() {
    init();
    function renderAll (){
        $('#collapse_events').collapse('toggle')
        init_hours();
        var hours = getPropertyHours();
        var all_promos =[];
        $.each( getPromotionsList().reverse() , function( key, val ){
            today = moment();
            webDate = moment(val.show_on_web_date);
            if (today >= webDate) {
                all_promos.push(val);
            } 
        });
        var latest_store_event = all_promos[0];
        var latest_mall_event  = getEventsList().sortBy(function(o){ return new Date(o.end_date) })[0];
        var mh=0
        if (latest_mall_event){
            mh=mh+1;
            renderSideEvents('#latest_mall_event_container', '#latest_mall_event_template', latest_mall_event, 'event');
        }
        if (latest_store_event){
            mh=mh+1
            renderSideEvents('#latest_store_event_container', '#latest_store_event_template', latest_store_event, 'promo');
        } 
        if (mh == 1){
            $('.mid_section').css('min-height','920px')
        }
        else if(mh>1 && $(window).width() > 767){
            $('.mid_section').css('min-height','1100px')
        }
        var pathArray = window.location.pathname.split( '/' );
        var slug = pathArray[pathArray.length-1];
        promo_details = getPromotionDetailsBySlug(slug);
        render_page_details("#promo_container", "#promo_template", promo_details)
        $(document).trigger('render:complete');
        $('.gallery').colorbox();
    }
    
    function render_page_details(container, template, collection){
        var item_list = [];
        var item_rendered = [];
        var template_html = $(template).html();
        Mustache.parse(template_html);   // optional, speeds up future uses
        item_list.push(collection);
        $.each( item_list , function( key, val ) {
            if ((val.promo_image_url).indexOf('missing.png') > -1){
                if (val.promotionable_type == "Store") {
                    var store_details = getStoreDetailsByID(val.promotionable_id);
                    val.alt_promo_image_url = getImageURL(store_details.store_front_url);
                    val.store_detail_btn = store_details.slug 
                    val.store_name = store_details.name
                } else {
                    val.alt_promo_image_url = "//kodekloud.s3.amazonaws.com/sites/554a79236e6f64713f000000/172a94a0e1dd6a2eeec91e2cea4e8b92/logo.png"
                }
            } else {
                if (val.promotionable_type == "Store") {
                    var store_details = getStoreDetailsByID(val.promotionable_id);
                    val.store_detail_btn = store_details.slug 
                    val.store_name = store_details.name
                }
                val.alt_promo_image_url = getImageURL(val.promo_image_url);
            }
        
            var start = moment(val.start_date).tz(getPropertyTimeZone());
            var end = moment(val.end_date).tz(getPropertyTimeZone());
            if (start.format("DMY") == end.format("DMY")){
            	val.dates = start.format("MMM D");
            }
            else {
            	val.dates = start.format("MMM D") + " - " + end.format("MMM D");
            }
            
            var rendered = Mustache.render(template_html,val);
            item_rendered.push(rendered);
        });
        $(container).show();
        $(container).html(item_rendered.join(''));
        if (collection.promotionable_type == "Store"){
            $("#store_btn").show();
        }
        $(".modal-backdrop").remove();
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
    loadMallDataCached(renderAll);  
});