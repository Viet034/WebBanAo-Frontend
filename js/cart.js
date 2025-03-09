// Hàm thêm sản phẩm vào giỏ hàng
function addToCart(productDetailId, quantity = 1) {
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('userId');
    
    if (!token || !customerId) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
        window.location.href = 'login.html';
        return;
    }

    $.ajax({
        url: 'https://localhost:7060/api/Cart/add-to-cart',
        type: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            customerId: parseInt(customerId),
            productDetailId: productDetailId,
            quantity: quantity
        }),
        success: function(response) {
            console.log('Add to cart response:', response);
            alert('Thêm vào giỏ hàng thành công!');
            loadCartItems();
            updateCartCount();
        },
        error: function(xhr) {
            console.error('Add to cart error:', xhr);
            alert('Có lỗi xảy ra khi thêm vào giỏ hàng!');
        }
    });
}

// Hàm tải sản phẩm trong giỏ hàng
function loadCartItems() {
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('userId');

    if (!token || !customerId) {
        $('.cart_items').html('<p>Vui lòng đăng nhập để xem giỏ hàng!</p>');
        return;
    }

    $.ajax({
        url: `https://localhost:7060/api/Cart/get-cart/${customerId}`,
        type: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(response) {
            console.log('Cart response:', response);
            if (response && response.items && response.items.length > 0) {
                renderCartItems(response.items);
                $('#cartTotal').text(response.totalAmount.toLocaleString() + 'đ');
            } else {
                $('.cart_items').html('<p>Giỏ hàng trống</p>');
                $('#cartTotal').text('0đ');
            }
        },
        error: function(xhr) {
            console.error('Load cart error:', xhr);
            $('.cart_items').html('<p>Không thể tải giỏ hàng</p>');
        }
    });
}

// Hàm hiển thị sản phẩm trong giỏ hàng
function renderCartItems(items) {
    const cartContainer = $('.cart_items');
    cartContainer.empty();

    items.forEach(item => {
        cartContainer.append(`
            <div class="cart_item d-flex align-items-center">
                <div class="cart_item_image">
                    <img src="${item.productImage}" alt="${item.productName}">
                </div>
                <div class="cart_item_info flex-grow-1">
                    <h5 class="cart_item_name">${item.productName}</h5>
                    <div class="cart_item_details">
                        <span class="badge bg-secondary">Size: ${item.size}</span>
                        <span class="badge bg-secondary">Màu: ${item.color}</span>
                    </div>
                    <div class="cart_item_price">${item.price.toLocaleString()}đ</div>
                </div>
                <div class="cart_item_quantity">
                    <input type="number" class="form-control" value="${item.quantity}" 
                           min="1" onchange="updateQuantity(${item.productDetailId}, this.value)">
                </div>
                <div class="cart_item_subtotal mx-4">
                    <strong>${item.subtotal.toLocaleString()}đ</strong>
                </div>
                <div class="cart_item_remove">
                    <button class="btn btn-danger" onclick="removeItem(${item.productDetailId})">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </div>
        `);
    });
}

// Hàm cập nhật số lượng sản phẩm
function updateQuantity(productDetailId, quantity) {
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('userId');

    $.ajax({
        url: 'https://localhost:7060/api/Cart/update-quantity',
        type: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            customerId: parseInt(customerId),
            productDetailId: productDetailId,
            quantity: parseInt(quantity)
        }),
        success: function(response) {
            console.log('Update quantity response:', response);
            loadCartItems(); // Tải lại giỏ hàng để cập nhật thông tin
        },
        error: function(xhr) {
            console.error('Update quantity error:', xhr);
            alert('Có lỗi xảy ra khi cập nhật số lượng!');
            loadCartItems();
        }
    });
}

// Hàm xóa sản phẩm khỏi giỏ hàng
function removeItem(productDetailId) {
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('userId');

    $.ajax({
        url: `https://localhost:7060/api/Cart/remove-item/${customerId}/${productDetailId}`,
        type: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(response) {
            console.log('Remove item response:', response);
            loadCartItems();
            updateCartCount();
        },
        error: function(xhr) {
            console.error('Remove item error:', xhr);
            alert('Có lỗi xảy ra khi xóa sản phẩm!');
        }
    });
}

// Hàm cập nhật số lượng sản phẩm trên icon giỏ hàng
function updateCartCount() {
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('userId');

    if (!token || !customerId) {
        $('#checkout_items').text('0');
        return;
    }

    $.ajax({
        url: `https://localhost:7060/api/Cart/get-cart/${customerId}`,
        type: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(response) {
            const itemCount = response.items ? response.items.reduce((total, item) => total + item.quantity, 0) : 0;
            $('#checkout_items').text(itemCount);
        },
        error: function(xhr) {
            console.error('Update cart count error:', xhr);
            $('#checkout_items').text('0');
        }
    });
}

// Định nghĩa hàm xử lý thêm vào giỏ hàng
window.handleAddToCart = function(productId) {
    console.log('handleAddToCart called with productId:', productId);
    
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('userId');
    
    if (!token || !customerId) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
        window.location.href = 'login.html';
        return;
    }

    // Log thông tin trước khi gửi request
    console.log('Sending request with:', {
        token: token,
        customerId: customerId,
        productId: productId
    });

    $.ajax({
        url: 'https://localhost:7060/api/Cart/add-to-cart',
        type: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            customerId: parseInt(customerId),
            productDetailId: parseInt(productId),
            quantity: 1
        }),
        success: function(response) {
            console.log('Add to cart success:', response);
            alert('Thêm vào giỏ hàng thành công!');
            updateCartCount();
        },
        error: function(xhr, status, error) {
            console.error('Add to cart error:', {
                status: xhr.status,
                error: error,
                response: xhr.responseText
            });
            alert('Có lỗi xảy ra khi thêm vào giỏ hàng!');
        }
    });
};

// Thêm event listener khi document ready
$(document).ready(function() {
    console.log('Cart.js loaded');
    
    // Thêm click event cho tất cả các nút add to cart
    $(document).on('click', '.add_to_cart_button', function(e) {
        console.log('Button clicked through jQuery');
        const productId = $(this).data('product-id');
        if (productId) {
            handleAddToCart(productId);
        }
    });
});

// Tải giỏ hàng khi trang được load
$(document).ready(function() {
    loadCartItems();
    updateCartCount();
});