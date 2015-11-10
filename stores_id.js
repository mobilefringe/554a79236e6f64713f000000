$(document).ready(function() {
    init();
    function renderAll (){
        $('#collapse_shopping').collapse('toggle')
        init_hours();
        var all_promos =[];
        $.each( getPromotionsList().reverse() , function( key, val ){
            today = new Date();
            webDate = new Date(val.show_on_web_date);
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
        else if(mh>1){
            $('.mid_section').css('min-height','1200px')
        }
        var pathArray = window.location.pathname.split( '/' );
        var slug = pathArray[pathArray.length-1];
        var store_details = getStoreDetailsBySlug(slug);
        renderStoreDetails("#store_container","#store_template", store_details, slug);
        
        var dimension = (store_details.x_coordinate - 460 )  + " " + (store_details.y_coordinate - 230);
        $(function(){
            $('.demo1').craftmap({
                image: {
        			width: 1975,
    				height: 1278,
    				name: 'imgMap'
    			},
    			map: {
    				position: dimension
    			}
    		});
    		$("#anchor_id").click();
           	$("#scroll_to_marker").click();
        });

        $(document).trigger('render:complete');
        
    }
    function renderStoreExtras(container, template, type, ids){
        if (ids.length > 0 && type == "promos") {
            $('#promotion_extra').show()
        }
        if (ids.length > 0 && type == "jobs") {
            $('#employment_extra').show()
        }
        if (type == "promos"){
            var collection = getPromotionsForIds(ids)
        }
        else if (type =="jobs"){
            var collection = getJobsForIds(ids)
        }
        var item_list = [];
        var item_rendered = [];
        var template_html = $(template).html();
        Mustache.parse(template_html);   // optional, speeds up future uses
        $.each( collection , function( key, val ) {
            start = new Date (val.start_date + "T05:00:00Z");
            end = new Date (val.end_date + "T05:00:00Z");
            if (start.toDateString() == end.toDateString()) {
                val.dates = (get_month(start.getMonth()))+" "+(start.getDate());    
            } else {
                val.dates = (get_month(start.getMonth()))+" "+(start.getDate())+" - "+get_month(end.getMonth())+" "+end.getDate();    
            }
            var rendered = Mustache.render(template_html,val);
            item_rendered.push(rendered);
        }) 
        $(container).html(item_rendered.join(''));
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
    
    function renderStoreDetails(container, template, collection, slug){
        var item_list = [];
        var item_rendered = [];
        var template_html = $(template).html();
        Mustache.parse(template_html);   // optional, speeds up future uses
        item_list.push(collection);
        $.each( item_list , function( key, val ) {
            if (val.z_coordinate == 1){
                val.level = "Lower Level"
            }
            else{
                val.level = "Upper Level"
            }
            if ((val.store_front_url).indexOf('missing.png') > -1){
                val.alt_store_front_url = "http://kodekloud.s3.amazonaws.com/sites/554a79236e6f64713f000000/172a94a0e1dd6a2eeec91e2cea4e8b92/logo.png"
            } else {
                val.alt_store_front_url = getImageURL(val.store_front_url); 
            }
            val.category_list = getCategoriesNamesByStoreSlug(slug)
            val.map_x_coordinate = val.x_coordinate - 19;
            val.map_y_coordinate = val.y_coordinate - 58;
            
            renderStoreExtras($('#promotions_container'), $('#promotions_template'), "promos", val.promotions)
            renderStoreExtras($('#jobs_container'), $('#jobs_template'), "jobs", val.jobs)
            
            if (val.website.length > 0){
                val.show = "display:block"
            }
            else{
                val.show = "display:none"
            }
            var rendered = Mustache.render(template_html,val);
            item_rendered.push(rendered);
        })
        
        $(container).show();
        
        $(container).html(item_rendered.join(''));
        $(".modal-backdrop").remove();
    }
    
    loadMallDataCached(renderAll); 
})