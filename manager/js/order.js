let orderData = [];

//Khởi tạo khi trang load
document.addEventListener("DOMContentLoaded", function(){
  if(!checkAuth()) return;

  //Thêm UI phân trang
  document.getElementById("orderPaginationContainer").innerHTML =
    Pagination.createPaginationUI("pagination");

  // Thêm event listener cho search
  document
    .getElementById("searchVoucher")
    ?.addEventListener("input", function (e) {
      renderVouchers(e.target.value);
    });

  //Thêm event cho listener cho form thêm Order
  const addOrderForm = document.getElementById("addOrderForm");
  if(addOrderForm){
    addOrderForm.addEventListener("submit", function (e){
      e.preventDefault();

      //format ngày tháng theo định dạng ISO
      const orderDate = new Date(document.getElementById("orderDate").value);

      const formData = {
        code: document.getElementById("orderCode").value,
        
        note: document.getElementById("orderNote").value,
        initialTotalAmount: parseFloat(document.getElementById("orderInitialTotalAmount").value),
        totalAmount: parseFloat(document.getElementById("orderInitialTotalAmount").value),
        customerId: parseInt(document.getElementById("orderCustomerId").value),
        employeeId: parseInt(document.getElementById("orderEmployeeId").value),
        voucherId: parseInt(document.getElementById("orderVoucherId").value),
        orderDate: orderDate.toISOString(),
        Status: "Pending"
      };

      // Validate dữ liệu
      if (!formData.customerId || !formData.employeeId || !formData.voucherId) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }
      console.log("Dữ liệu gửi đi khi thêm:", formData);
      addOrder(formData);
    });
  }

  //xử lý form edit
  const editForm = document.getElementById("editOrderForm");
  if(editForm){
    editForm.addEventListener("submit", handleEditFormSubmit);
  }

  // Khởi tạo các event listeners cho search
  initializeEventListeners();
  
  //khởi tạo dữ liệu
  fetchOrders();
});

function initializeEventListeners() {
  // Xử lý tìm kiếm khi nhấn Enter
  const searchInput = document.getElementById("searchOrder");
  if (searchInput) {
    searchInput.addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        searchOrders();
      }
    });
  }
}

// Kiểm tra xác thực
function checkAuth() {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token || !userRole) {
    alert("Vui lòng đăng nhập để tiếp tục.");
    window.location.href = "../login.html";
    return false;
  }

  if (userRole !== "Employee") {
    alert("Bạn không có quyền truy cập trang này.");
    window.location.href = "../login.html";
    return false;
  }

  return true;
}

// Hàm lấy danh sách đơn hàng
function fetchOrders() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Không tìm thấy token xác thực");
    alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
    window.location.href = "../login.html";
    return;
  }

  // Chỉ gọi API GetAll
  $.ajax({
    url: "https://localhost:7060/api/Order/GetAll",
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    success: function(response) {
      orderData = response;
      console.log("Danh sách đơn hàng:", orderData);
      renderOrders();
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      alert("Không thể lấy danh sách đơn hàng. Vui lòng thử lại sau.");
    }
  });
}

// Các hàm xử lý status
function getStatusText(status) {
  const statusMap = {
    'Pending': "Chờ xác nhận",
    'Confirm': "Đã xác nhận",
    'Confirmed': "Đã xác nhận",
    'Shipped': "Đang giao",
    'Delivery': "Đã giao",
    'Delivered': "Đã giao",
    'Cancelled': "Đã hủy"
  };
  return statusMap[status] || status;
}

function getStatusClass(status) {
  const classMap = {
    'Pending': "status-Pending",
    'Confirm': "status-Confirm",
    'Confirmed': "status-Confirm",
    'Shipped': "status-Shipped",
    'Delivery': "status-Delivery",
    'Delivered': "status-Delivery",
    'Cancelled': "status-Cancelled",
    'Proccessed': "status-Proccessed",
    'Complete': "status-Complete"
  };
  return classMap[status] || "";
}

function getOrderButtons(order) {
  let buttons = '';
  
  // Nếu là đơn của SYSTEM (chưa ai nhận)
  if (order.employeeId === 29) {
    buttons = `
      <button class="btn btn-primary btn-sm" onclick="assignOrderToMe(${order.id})">
        <i class="fas fa-hand-pointer"></i> Nhận xử lý
      </button>
    `;
    return buttons;
  }

  // Nếu là đơn đã được assign cho nhân viên này
  switch(order.status) {
    case 'Pending':
      buttons = `
        <button class="btn btn-success btn-sm" onclick="changeOrderStatus(${order.id}, 'Confirmed')">
          <i class="fas fa-check"></i> Xác nhận
        </button>
        <button class="btn btn-danger btn-sm" onclick="changeOrderStatus(${order.id}, 'Cancelled')">
          <i class="fas fa-times"></i> Hủy
        </button>
      `;
      break;
    case 'Confirmed':
      buttons = `
        <button class="btn btn-primary btn-sm" onclick="changeOrderStatus(${order.id}, 'Shipped')">
          <i class="fas fa-shipping-fast"></i> Giao hàng
        </button>
      `;
      break;
    case 'Shipped':
      buttons = `
        <button class="btn btn-success btn-sm" onclick="changeOrderStatus(${order.id}, 'Delivered')">
          <i class="fas fa-check-circle"></i> Đã giao
        </button>
      `;
      break;
  }
  
  return buttons;
}

// Hàm render danh sách đơn hàng
function renderOrders(orders = orderData) {
  const tbody = document.querySelector("#orders table tbody");
  
  if (!tbody) {
    console.error("Không tìm thấy tbody");
    return;
  }

  tbody.innerHTML = "";

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Không có đơn hàng nào</td>
      </tr>
    `;
    return;
  }

  // Sắp xếp orders theo OrderDate mới nhất
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.orderDate) - new Date(a.orderDate)
  );

  sortedOrders.forEach((order, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${order.code || "N/A"}</td>
        <td>${order.totalAmount ? order.totalAmount.toLocaleString("vi-VN") : 0}đ</td>
        <td>${order.orderDate ? new Date(order.orderDate).toLocaleString("vi-VN", {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) : "N/A"}</td>
        <td>
          <span class="badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-info btn-sm" onclick="showOrderDetails(${order.id})">
              <i class="fas fa-info-circle"></i> Chi tiết
            </button>
            ${getOrderButtons(order)}
          </div>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Hàm thay đổi trạng thái đơn hàng
function changeOrderStatus(id, newStatus) {
  const token = localStorage.getItem("token");
  
  $.ajax({
    url: `https://localhost:7060/api/Order/ChangeSstatus/${id}?newStatus=${newStatus}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({ newStatus: newStatus }),
    success: function (response) {
      alert("Cập nhật trạng thái thành công!");
      fetchOrders();
    },
    error: function (xhr) {
      if (xhr.status === 400) {
        alert("Không thể chuyển sang trạng thái này!");
      } else {
        alert("Lỗi khi cập nhật trạng thái!");
      }
    }
  });
}
//Nhận xử lý đơn hàng
function assignOrderToMe(orderId) {
  const token = localStorage.getItem("token");
  
  $.ajax({
    url: `https://localhost:7060/api/Order/assign-order/${orderId}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      alert("Đã nhận xử lý đơn hàng!", response);
      fetchOrders();
    },
    error: function (xhr) {
      if (xhr.status === 400) {
        alert("Đơn hàng đã được nhân viên khác xử lý!");
      } else {
        alert("Lỗi khi nhận đơn hàng!");
      }
    }
  });
}

// Hàm hiển thị chi tiết đơn hàng
function showOrderDetails(orderId) {
  const token = localStorage.getItem("token");
  $.ajax({
    url: `https://localhost:7060/api/Order/findId/${orderId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function(order) {
      $.ajax({
        url: `https://localhost:7060/api/Customer/findId/${order.customerId}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        success: function(customer) {
          document.getElementById("orderInfo").innerHTML = `
            <div class="row mb-3">
              <div class="col-md-6">
                <h5>Thông tin đơn hàng</h5>
                <p><strong>Mã đơn hàng:</strong> ${order.code}</p>
                <p><strong>Ngày đặt:</strong> ${new Date(order.orderDate).toLocaleString("vi-VN", {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })}</p>
                <p><strong>Trạng thái:</strong> <span class="badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></p>
                <p><strong>Tổng tiền:</strong> ${order.totalAmount?.toLocaleString("vi-VN")}đ</p>
              </div>
              <div class="col-md-6">
                <h5>Thông tin khách hàng</h5>
                <p><strong>Tên khách hàng:</strong> ${customer.fullName || 'N/A'}</p>
                <p><strong>Số điện thoại:</strong> ${customer.phone || 'N/A'}</p>
                <p><strong>Địa chỉ:</strong> ${customer.address || 'N/A'}</p>
              </div>
            </div>
          `;

          // Lấy chi tiết đơn hàng và thông tin sản phẩm
          loadOrderDetails(orderId);
        },
        error: function(xhr, status, error) {
          console.error("Lỗi khi lấy thông tin khách hàng:", error);
        }
      });
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi lấy thông tin đơn hàng:", error);
    }
  });
}

// Hàm load chi tiết đơn hàng
function loadOrderDetails(orderId) {
  const token = localStorage.getItem("token");
  $.ajax({
    url: "https://localhost:7060/api/OrderDetail/GetAll",
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function(allDetails) {
      const orderDetails = allDetails.filter(detail => detail.orderId === orderId);
      
      const productPromises = orderDetails.map(detail =>
        $.ajax({
          url: `https://localhost:7060/api/ProductDetail/findId/${detail.productDetailId}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      Promise.all(productPromises)
        .then(products => {
          renderOrderDetails(orderDetails, products);
          $("#orderDetailsModal").modal("show");
        })
        .catch(error => {
          console.error("Lỗi khi lấy thông tin sản phẩm:", error);
        });
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    }
  });
}

// Hàm render chi tiết đơn hàng
function renderOrderDetails(details, products) {
  const tbody = document.getElementById("orderDetailsTableBody");
  tbody.innerHTML = "";

  if (!details || details.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Không có sản phẩm nào</td>
      </tr>
    `;
    return;
  }

  details.forEach((detail, index) => {
    const product = products.find(p => p.id === detail.productDetailId);
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${product?.name || "N/A"}</td>
        <td>${detail.quantity}</td>
        <td>${product?.price?.toLocaleString("vi-VN") || "N/A"}đ</td>
        <td>${(product?.price * detail.quantity)?.toLocaleString("vi-VN") || "N/A"}đ</td>
        <td>
          <span class="badge status-${detail.status}">${getStatusText(detail.status)}</span>
        </td>
        <td>
          ${getOrderDetailStatusButtons(detail)}
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Hàm lấy các nút thao tác cho chi tiết đơn hàng
function getOrderDetailStatusButtons(detail) {
  if (detail.status === "Complete") return "";
  
  return `
    <button class="btn btn-success btn-sm" onclick="changeOrderDetailStatus(${detail.id}, 'Complete')">
      <i class="fas fa-check"></i> Hoàn thành
    </button>
  `;
}

// Hàm thay đổi trạng thái chi tiết đơn hàng
function changeOrderDetailStatus(id, newStatus) {
  const token = localStorage.getItem("token");
  $.ajax({
    url: `https://localhost:7060/api/OrderDetail/ChangeSstatus/${id}?newStatus=${newStatus}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      alert("Cập nhật trạng thái thành công!");
      // Refresh chi tiết đơn hàng
      const orderId = $("#orderDetailsModal").data("orderId");
      showOrderDetails(orderId);
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại sau.");
    }
  });
}

// Phiên bản tối ưu hơn - lọc từ dữ liệu có sẵn
function filterByStatus() {
  const selectedStatus = document.getElementById("statusFilter").value;
  console.log("Selected status:", selectedStatus);
  console.log("Available orders:", orderData);
  
  if (selectedStatus) {
    const filteredOrders = orderData.filter(order => {
      console.log(`Comparing: order.status="${order.status}" with selected="${selectedStatus}"`);
      return order.status === selectedStatus;
    });
    console.log("Filtered orders:", filteredOrders);
    renderOrders(filteredOrders);
  } else {
    renderOrders(orderData);
  }
}

// Hàm tìm kiếm đơn hàng
function searchOrders() {
  const searchTerm = document.getElementById("searchOrder").value;
  if (!searchTerm.trim()) {
    fetchOrders();
    return;
  }
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Không tìm thấy token xác thực");
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = "../login.html";
    return;
  }
  $.ajax({
    url: `https://localhost:7060/api/Order/FindByName/${searchTerm}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      const filteredOrders = response.filter(order => 
        order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      renderOrders(filteredOrders);
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi tìm kiếm đơn hàng:", error);
      alert("Không thể tìm kiếm đơn hàng. Vui lòng thử lại sau.");
    }
  });
}

