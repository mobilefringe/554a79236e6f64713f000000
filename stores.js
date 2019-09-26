    $(document).ready(function() {
        init()
        function renderAll (){
            init_hours();
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
            if (latest_mall_event){
                renderSideEvents('#latest_mall_event_container', '#latest_mall_event_template', latest_mall_event, 'event');
            }
            if (latest_store_event){
                renderSideEvents('#latest_store_event_container', '#latest_store_event_template', latest_store_event, 'promo');
            } 
            
            var stores = getStoresList();
            var category_stores = getStoresListByCategory();
            var categories = getStoreCategories();
            var category_list = [];
            $.each( categories, function( key, val ){
                if (val.store_ids != null) {
                    category_list.push(val);
                } 
            });
            console.log(category_list)
            
            renderPageData('#store_list_container','#store_list_template', stores, "stores", "A", "M");
            renderPageData('#store_list_container_right','#store_list_template_right', stores, "stores", "M", "Z");
            
            renderPageData('#store_list_container_mobile','#store_list_template_mobile', stores, "stores", "A", "Z");
            renderCatetoryList('#category_list_container_mobile','#category_list_template_mobile', category_list, stores);
            
            console.log(renderCatetoryList())
            
            render_categories(category_list);
            selectCategory();
            $(".modal-backdrop").remove();
            $(document).trigger('render:complete');
        }
        
        function selectCategory() {
            // Auto select based on category
            if (selectedCat = window.location.hash.match(/category\/(\d+)\//)) {
                $('#cats').val(selectedCat[1]).change();
            }
        }
        
        function renderCatetoryList(container, template, category_list,stores){
            var item_rendered = [];
            var template_html = $(template).html();
            Mustache.parse(template_html);   // optional, speeds up future use
            var initial_id = 0;
            var category_index = 0;
            $.each(category_list , function( key, category ) {
                var category_id = parseInt(category.id);
                var category_name = category.name;
                var current_id = category.id
                var count = 0;
                
                $.each( stores , function( i, store ) {
                    if(store.categories != null){
                        var store_category = store.categories;
                        var a = store.categories.indexOf(category_id);
                    }
                    if(a > -1){
                        if (count == 0){
                            store.show  = "display:block"; 
                        }else{
                            store.show  = "display:none"; 
                        }
                        store.header = category_name;
                        store.block = category.id;
                        var rendered = Mustache.render(template_html,store);
                        item_rendered.push(rendered);
                        count += 1;
                    }
                });
                category_index += 1;
            });
             $(container).show();
            $(container).html(item_rendered.join(''));
        }
        
        function renderPageData(container, template, collection, type,starter, breaker){
            var item_list = [];
            var item_rendered = [];
            var template_html = $(template).html();
            Mustache.parse(template_html);   // optional, speeds up future uses
            var store_initial=""
            $.each( collection , function( key, val ) {
                if (type == "stores" || type == "category_stores"){
                    if(!val.store_front_url ||  val.store_front_url.indexOf('missing.png') > -1 || val.store_front_url.length === 0){
                        val.alt_store_front_url = "//kodekloud.s3.amazonaws.com/sites/54cfab316e6f6433ad020000/77c900d783abeb362232339ece231335/10dundas_default.jpg"    
                    } else {
                        val.alt_store_front_url = getImageURL(val.store_front_url);    
                    }
                    
                }
                //var categories = getStoreCategories();
                var current_initial = val.name[0];
                
                if(store_initial == current_initial){
                    val.initial = "";
                    val.show = "display:none;"
                } else {
                    val.initial = current_initial;
                    store_initial = current_initial;
                    val.show = "display:block;"
                }
                if (val.promotions != null){
                    val.promotion_exist = "display:inline-block"
                } else {
                    val.promotion_exist = "display:none"
                }
                if (val.jobs != null){
                    val.job_exist = "display:inline-block"
                } else {
                    val.job_exist = "display:none"
                }
                if(val.is_coming_soon_store != false){
                    val.coming_soon_store = "display: inline-block";
                } else {
                    val.coming_soon_store = "display: none";
                }
                val.block = current_initial + '-block';
                var rendered = Mustache.render(template_html,val);
                var upper_current_initial = current_initial.toUpperCase();
                if (upper_current_initial.charCodeAt(0) < breaker.charCodeAt(0) && upper_current_initial.charCodeAt(0) >= starter.charCodeAt(0)){
                    item_rendered.push(rendered);
                }
    
            });
            
            $(container).show();
            $(container).html(item_rendered.join(''));
        };  
        
        $("#cats").change(function(){
            $('.stores_tab').hide()
            $("#dir_link").css({"border-bottom":"9px solid black","color":"black"});
            $("#map_link").css({"border-bottom":"none","color":"#959595"});
            $("#alpha_link").css({"border-bottom":"none","color":"#959595"});
            $("#alpha_link a").css({"border-bottom":"none","color":"#959595"});
            $("#cat_link").css({"border-bottom":"4px solid black","color":"black"});
            $("#cats").css("color","black");
            var stores_list = getStoresListByCategoryID(parseInt($(this).val()))
            $('#cats_title').text($(this).find('option:selected').text())
            renderCategoriesList(stores_list, Math.round(stores_list.length/2));
            $('.categories_tab').show()
            
            document.location.hash = '#/category/' + [$(this).val(), encodeURI($(this).find('option:selected').text())].join('/');
        });

        $("#show_stores").click(function(e){
            $("#dir_link").css({"border-bottom":"9px solid black","color":"black"});
            $("#alpha_link").css({"border-bottom":"4px solid black","color":"black"});
            $("#alpha_link a").css({"color":"black"});
            $("#cats").css("color","#959595");
            $("#map_link").css({"border-bottom":"none","color":"#959595"});
            $("#cat_link").css({"border-bottom":"none","color":"#959595"});
            $('.stores_tab').show()
            $('.categories_tab').hide()
            $("#cats").val('categories')
            e.preventDefault()
        })
        
        function renderCategoriesList(list, breaker){
            $('#store_category_list_container').html('')
            $('#store_category_list_container_right').html('')
            $.each(list, function(i, val){
                if(i < breaker){
                    $('#store_category_list_container').append('<div class="store_list_content"><p class="store_name"><a href="/stores/' + val.slug + '">' + val.name + '</a></p><div class="clearfix"></div></div>')
                }
                else{
                    $('#store_category_list_container_right').append('<div class="store_list_content"><p class="store_name"><a href="/stores/' + val.slug + '">' + val.name + '</a></p><div class="clearfix"></div></div>')
                }
            })
            
            
        }
        
        function render_categories(categories){
            $.each( categories , function( key, val ) {
                $('#cats').append($('<option>', {
                    value: val.id,
                    text: val.name
                }));
                $('#mobile_cats').append($('<option>', {
                    value: val.id,
                    text: val.name
                }));
            });
        };
        loadMallDataCached(renderAll);  
    })
    function mobile_show_cats(category){
        var className = '.' + category;
        if (category == "all"){
            $('#category_list_container_mobile').find('.store_list_content').show();
        }else{
            $('#category_list_container_mobile').find('.store_list_content').hide();
            $('#category_list_container_mobile').find(className).show();
        }
    }
    function mobile_show_stores(store){
        var className = '.' + store;
        if (store == "all"){
            $('#store_list_container_mobile').find('.store_list_content').show();
        }else{
            $('#store_list_container_mobile').find('.store_list_content').hide();
            $('#store_list_container_mobile').find(className).show();
        }
    }
    
     function toggle_filter(){
            if ($("#alphabet_filter").is(":visible")){
                $("#alphabet_filter").hide();
                $("#category_filter").show();
                $("#mobile-A-Z-list").hide();
                $("#mobile-cat-list").show();
                $("#toggle_filter").text("Filter Stores");
          } else {
                $("#alphabet_filter").show();
                $("#category_filter").hide();
                $("#mobile-A-Z-list").show();
                $("#mobile-cat-list").hide();
                $("#toggle_filter").text("Filter Categories");
          }
         }
