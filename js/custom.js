/* JS Document */

/******************************

[Table of Contents]

1. Vars and Inits
2. Set Header
3. Init Menu
4. Init Timer
5. Init Favorite
6. Init Fix Product Border
7. Init Isotope Filtering
8. Init Slider


******************************/

jQuery(document).ready(function($)
{
	"use strict";

	/* 

	1. Vars and Inits

	*/

	var header = $('.header');
	var topNav = $('.top_nav')
	var mainSlider = $('.main_slider');
	var hamburger = $('.hamburger_container');
	var menu = $('.hamburger_menu');
	var menuActive = false;
	var hamburgerClose = $('.hamburger_close');
	var fsOverlay = $('.fs_menu_overlay');

	setHeader();

	$(window).on('resize', function()
	{
		initFixProductBorder();
		setHeader();
	});

	$(document).on('scroll', function()
	{
		setHeader();
	});

	initMenu();
	initTimer();
	initFavorite();
	initFixProductBorder();
	initIsotopeFiltering();
	initSlider();

	/* 

	2. Set Header

	*/

	function setHeader()
	{
		if(window.innerWidth < 992)
		{
			if($(window).scrollTop() > 100)
			{
				header.css({'top':"0"});
			}
			else
			{
				header.css({'top':"0"});
			}
		}
		else
		{
			if($(window).scrollTop() > 100)
			{
				header.css({'top':"-50px"});
			}
			else
			{
				header.css({'top':"0"});
			}
		}
		if(window.innerWidth > 991 && menuActive)
		{
			closeMenu();
		}
	}

	/* 

	3. Init Menu

	*/

	function initMenu()
	{
		if(hamburger.length)
		{
			hamburger.on('click', function()
			{
				if(!menuActive)
				{
					openMenu();
				}
			});
		}

		if(fsOverlay.length)
		{
			fsOverlay.on('click', function()
			{
				if(menuActive)
				{
					closeMenu();
				}
			});
		}

		if(hamburgerClose.length)
		{
			hamburgerClose.on('click', function()
			{
				if(menuActive)
				{
					closeMenu();
				}
			});
		}

		if($('.menu_item').length)
		{
			var items = document.getElementsByClassName('menu_item');
			var i;

			for(i = 0; i < items.length; i++)
			{
				if(items[i].classList.contains("has-children"))
				{
					items[i].onclick = function()
					{
						this.classList.toggle("active");
						var panel = this.children[1];
					    if(panel.style.maxHeight)
					    {
					    	panel.style.maxHeight = null;
					    }
					    else
					    {
					    	panel.style.maxHeight = panel.scrollHeight + "px";
					    }
					}
				}	
			}
		}
	}

	function openMenu()
	{
		menu.addClass('active');
		// menu.css('right', "0");
		fsOverlay.css('pointer-events', "auto");
		menuActive = true;
	}

	function closeMenu()
	{
		menu.removeClass('active');
		fsOverlay.css('pointer-events', "none");
		menuActive = false;
	}

	/* 

	4. Init Timer

	*/

	function initTimer()
    {
    	if($('.timer').length)
    	{
    		// Uncomment line below and replace date
	    	// var target_date = new Date("Dec 7, 2017").getTime();

	    	// comment lines below
	    	var date = new Date();
	    	date.setDate(date.getDate() + 3);
	    	var target_date = date.getTime();
	    	//----------------------------------------
	 
			// variables for time units
			var days, hours, minutes, seconds;

			var d = $('#day');
			var h = $('#hour');
			var m = $('#minute');
			var s = $('#second');

			setInterval(function ()
			{
			    // find the amount of "seconds" between now and target
			    var current_date = new Date().getTime();
			    var seconds_left = (target_date - current_date) / 1000;
			 
			    // do some time calculations
			    days = parseInt(seconds_left / 86400);
			    seconds_left = seconds_left % 86400;
			     
			    hours = parseInt(seconds_left / 3600);
			    seconds_left = seconds_left % 3600;
			     
			    minutes = parseInt(seconds_left / 60);
			    seconds = parseInt(seconds_left % 60);

			    // display result
			    d.text(days);
			    h.text(hours);
			    m.text(minutes);
			    s.text(seconds); 
			 
			}, 1000);
    	}	
    }

    /* 

	5. Init Favorite

	*/

    function initFavorite()
    {
    	if($('.favorite').length)
    	{
    		var favs = $('.favorite');

    		favs.each(function()
    		{
    			var fav = $(this);
    			var active = false;
    			if(fav.hasClass('active'))
    			{
    				active = true;
    			}

    			fav.on('click', function()
    			{
    				if(active)
    				{
    					fav.removeClass('active');
    					active = false;
    				}
    				else
    				{
    					fav.addClass('active');
    					active = true;
    				}
    			});
    		});
    	}
    }

    /* 

	6. Init Fix Product Border

	*/

    function initFixProductBorder()
    {
    	if($('.product_filter').length)
    	{
			var products = $('.product_filter:visible');
    		var wdth = window.innerWidth;

    		// reset border
    		products.each(function()
    		{
    			$(this).css('border-right', 'solid 1px #e9e9e9');
    		});

    		// if window width is 991px or less

    		if(wdth < 480)
			{
				for(var i = 0; i < products.length; i++)
				{
					var product = $(products[i]);
					product.css('border-right', 'none');
				}
			}

    		else if(wdth < 576)
			{
				if(products.length < 5)
				{
					var product = $(products[products.length - 1]);
					product.css('border-right', 'none');
				}
				for(var i = 1; i < products.length; i+=2)
				{
					var product = $(products[i]);
					product.css('border-right', 'none');
				}
			}

    		else if(wdth < 768)
			{
				if(products.length < 5)
				{
					var product = $(products[products.length - 1]);
					product.css('border-right', 'none');
				}
				for(var i = 2; i < products.length; i+=3)
				{
					var product = $(products[i]);
					product.css('border-right', 'none');
				}
			}

    		else if(wdth < 992)
			{
				if(products.length < 5)
				{
					var product = $(products[products.length - 1]);
					product.css('border-right', 'none');
				}
				for(var i = 3; i < products.length; i+=4)
				{
					var product = $(products[i]);
					product.css('border-right', 'none');
				}
			}

			//if window width is larger than 991px
			else
			{
				if(products.length < 5)
				{
					var product = $(products[products.length - 1]);
					product.css('border-right', 'none');
				}
				for(var i = 4; i < products.length; i+=5)
				{
					var product = $(products[i]);
					product.css('border-right', 'none');
				}
			}	
    	}
    }

    /* 

	7. Init Isotope Filtering

	*/

    function initIsotopeFiltering()
    {
    	if($('.grid_sorting_button').length)
    	{
    		$('.grid_sorting_button').click(function()
	    	{
	    		// putting border fix inside of setTimeout because of the transition duration
	    		setTimeout(function()
		        {
		        	initFixProductBorder();
		        },500);

		        $('.grid_sorting_button.active').removeClass('active');
		        $(this).addClass('active');
		 
		        var selector = $(this).attr('data-filter');
		        $('.product-grid').isotope({
		            filter: selector,
		            animationOptions: {
		                duration: 750,
		                easing: 'linear',
		                queue: false
		            }
		        });

		        
		         return false;
		    });
    	}
    }

    /* 

	8. Init Slider

	*/

    function initSlider()
    {
    	if($('.product_slider').length)
    	{
    		var slider1 = $('.product_slider');

    		slider1.owlCarousel({
    			loop:false,
    			dots:false,
    			nav:false,
    			responsive:
				{
					0:{items:1},
					480:{items:2},
					768:{items:3},
					991:{items:4},
					1280:{items:5},
					1440:{items:5}
				}
    		});

    		if($('.product_slider_nav_left').length)
    		{
    			$('.product_slider_nav_left').on('click', function()
    			{
    				slider1.trigger('prev.owl.carousel');
    			});
    		}

    		if($('.product_slider_nav_right').length)
    		{
    			$('.product_slider_nav_right').on('click', function()
    			{
    				slider1.trigger('next.owl.carousel');
    			});
    		}
    	}
    }

    /* 

    Search

    */

    $(document).ready(function() {
        // Toggle search form
        $('.fa-search').parent().click(function(e) {
            e.preventDefault();
            $('.search-form').toggleClass('active');
        });

        // Close search form when clicking outside
        $(document).click(function(e) {
            if (!$(e.target).closest('.search-container').length) {
                $('.search-form').removeClass('active');
            }
        });

        // Handle search
        $('#searchForm').submit(function(e) {
            e.preventDefault();
            const searchTerm = $('#searchInput').val().toLowerCase();
            
            // Gọi API tìm kiếm với searchTerm
            $.ajax({
                url: `${API_URL}/api/products/search?keyword=${searchTerm}`,
                method: 'GET',
                success: function(response) {
                    displaySearchResults(response);
                },
                error: function(error) {
                    console.error("Lỗi khi tìm kiếm:", error);
                    displaySearchResults([]);
                }
            });
        });

        // Hiển thị kết quả tìm kiếm
        function displaySearchResults(products) {
            // Xóa kết quả cũ nếu có
            $('.search-results').remove();

            // Tạo container cho kết quả
            const resultsContainer = $('<div class="search-results"></div>');

            if (!products || products.length === 0) {
                resultsContainer.append('<div class="search-result-item">Không tìm thấy sản phẩm</div>');
            } else {
                products.forEach(product => {
                    const productElement = `
                        <div class="search-result-item" onclick="window.location.href='single.html?id=${product.id}'">
                            <img src="${product.imageUrl || 'images/product_placeholder.jpg'}" alt="${product.name}">
                            <div class="product-info">
                                <div class="product-name">${product.name}</div>
                                <div class="product-price">${formatPrice(product.price)}</div>
                            </div>
                        </div>
                    `;
                    resultsContainer.append(productElement);
                });
            }

            // Thêm kết quả vào form tìm kiếm
            $('.search-form').append(resultsContainer);
        }

        // Format giá tiền
        function formatPrice(price) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price);
        }

        // Xử lý tìm kiếm realtime
        let searchTimeout;
        $('#searchInput').on('input', function() {
            clearTimeout(searchTimeout);
            const searchTerm = $(this).val().toLowerCase();
            
            // Đợi người dùng ngừng gõ 300ms mới tìm kiếm
            searchTimeout = setTimeout(() => {
                if (searchTerm.length >= 2) {
                    $('#searchForm').submit();
                } else {
                    $('.search-results').remove();
                }
            }, 300);
        });
    });

    /* 

    Language Translation

    */

    $(document).ready(function() {
        // Khởi tạo i18next
        i18next.init({
            lng: 'en', // ngôn ngữ mặc định
            resources: translations,
            fallbackLng: 'en',
        }).then(function(t) {
            // Cập nhật toàn bộ text trên trang
            updateContent();
        });

        // Xử lý chuyển đổi ngôn ngữ
        $('.language_selection li a').click(function(e) {
            e.preventDefault();
            const lang = $(this).data('lang');
            changeLanguage(lang);
        });

        // Hàm thay đổi ngôn ngữ
        function changeLanguage(lang) {
            i18next.changeLanguage(lang, (err, t) => {
                if (err) return console.log('Lỗi khi chuyển ngôn ngữ:', err);
                
                // Cập nhật text hiển thị ngôn ngữ hiện tại
                $('#current-lang').text(lang === 'en' ? 'English' : 'Tiếng Việt');
                
                // Cập nhật nội dung
                updateContent();
                
                // Lưu ngôn ngữ vào localStorage
                localStorage.setItem('preferred_language', lang);
            });
        }

        // Hàm cập nhật nội dung
        function updateContent() {
            // Header
            $('.top_nav_left').text(i18next.t('free_shipping'));
            $('.account > a').text(i18next.t('my_account'));
            
            // Navigation
            $('.navbar_menu li').each(function() {
                const key = $(this).find('a').text().toLowerCase();
                $(this).find('a').text(i18next.t(key));
            });
            
            // Search
            $('#searchInput').attr('placeholder', i18next.t('search_placeholder'));
            
            // Product buttons
            $('.add_to_cart_button a').text(i18next.t('add_to_cart'));
            
            // Newsletter
            $('.newsletter_text h4').text(i18next.t('newsletter'));
            $('.newsletter_text p').text(i18next.t('newsletter_desc'));
            $('#newsletter_email').attr('placeholder', i18next.t('your_email'));
            $('.newsletter_submit_btn').text(i18next.t('subscribe'));
        }

        // Tải ngôn ngữ đã lưu từ localStorage
        const savedLanguage = localStorage.getItem('preferred_language');
        if (savedLanguage) {
            changeLanguage(savedLanguage);
        }

        // Cập nhật hàm formatPrice để sử dụng đúng định dạng tiền tệ theo ngôn ngữ
        function formatPrice(price) {
            const currency = i18next.t('currency');
            const options = {
                style: 'currency',
                currency: currency === 'VND' ? 'VND' : 'USD'
            };
            
            if (currency === 'VND') {
                price = price * 23000; // Giả sử tỷ giá 1 USD = 23000 VND
            }
            
            return new Intl.NumberFormat(i18next.language === 'vi' ? 'vi-VN' : 'en-US', options).format(price);
        }
    });

    function renderProduct(product) {
        console.log("Rendering product:", product); // Thêm log để kiểm tra
        return `
            <div class="col-lg-4 col-md-6">
                <div class="product-item">
                    <div class="product discount product_filter">
                        <div class="product_image">
                            <img src="${product.imageUrl}" alt="${product.name}">
                        </div>
                        <div class="product_info">
                            <h6 class="product_name">
                                <a href="single.html?id=${product.id}">${product.name}</a>
                            </h6>
                            <div class="product_price">${product.price.toLocaleString()}đ</div>
                        </div>
                    </div>
                    <button class="red_button add_to_cart_button" 
                            onclick="handleAddToCart(${product.id})" 
                            style="width: 100%; border: none; padding: 10px; cursor: pointer;">
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        `;
    }
});