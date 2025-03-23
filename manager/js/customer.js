// Biến lưu trữ dữ liệu
let customerData = [];

// Khởi tạo khi trang load
document.addEventListener("DOMContentLoaded", function () {
  if (!checkAuth()) return;

  // Thêm UI phân trang
  document.getElementById("customerPaginationContainer").innerHTML =
    Pagination.createPaginationUI("pagination");

  // Thêm event listener cho itemsPerPage
  document
    .getElementById("itemsPerPage")
    ?.addEventListener("change", function (e) {
      Pagination.changeItemsPerPage(e.target.value, () =>
        renderCustomers(
          document.getElementById("searchcustomer")?.value || ""
        )
      );
    });

  // Thêm event listener cho search
  document
    .getElementById("searchcustomer")
    ?.addEventListener("input", function (e) {
      renderCustomers(e.target.value);
    });

  // Khởi tạo dữ liệu
  fetchCustomers();
});

// Kiểm tra xác thực
function checkAuth() {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token || !userRole) {
    alert("Vui lòng đăng nhập để tiếp tục.");
    window.location.href = "../login.html";
    return false;
  }

  // Thêm kiểm tra token hết hạn
  try {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = tokenData.exp * 1000; // Chuyển sang milliseconds
    if (Date.now() >= expirationTime) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      window.location.href = "../login.html";
      return false;
    }
  } catch (e) {
    console.error("Lỗi khi kiểm tra token:", e);
    return false;
  }

  if (userRole !== "Employee") {
    alert("Bạn không có quyền truy cập trang này.");
    window.location.href = "../login.html";
    return false;
  }

  return true;
}

// Lấy danh sách khách hàng
function fetchCustomers() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Không tìm thấy token xác thực");
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = "../login.html";
    return;
  }

  $.ajax({
    url: "https://localhost:7060/api/Customer/GetAll",
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      console.log("Dữ liệu khách hàng nhận được:", response);
      customerData = response;
      renderCustomers();
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy danh sách khách hàng:", error);
      if (xhr.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "../login.html";
      } else {
        alert("Không thể lấy danh sách khách hàng. Vui lòng thử lại sau.");
      }
    },
  });
}

// Render danh sách khách hàng với phân trang
function renderCustomers(searchTerm = "") {
  const tbody = document.querySelector(".customer-table tbody");
  if (!tbody) {
    console.error("Không tìm thấy phần tử tbody trong bảng khách hàng");
    return;
  }

  // Sử dụng hàm paginateData từ pagination.js
  const paginatedResult = Pagination.paginateData(
    customerData,
    searchTerm,
    ["fullName", "code", "email", "phone"]
  );

  tbody.innerHTML = "";

  if (paginatedResult.items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Không có khách hàng nào</td>
      </tr>
    `;
    return;
  }

  paginatedResult.items.forEach((customer, index) => {
    const actualIndex =
      (paginatedResult.currentPage - 1) * paginatedResult.itemsPerPage +
      index +
      1;
    const row = `
      <tr>
        <td>${actualIndex}</td>
        <td>
          <img src="${
            customer.image || "https://via.placeholder.com/80"
          }" 
               alt="${customer.fullName}" 
               class="customer-image"
               onerror="this.src='https://via.placeholder.com/80'">
        </td>
        <td>${customer.fullName || ""}</td>
        <td>${customer.code || ""}</td>
        <td>${customer.email || ""}</td>
        <td>${customer.phone || ""}</td>
        <td>
          <span class="badge ${
            customer.status === "Active" ? "bg-success" : "bg-danger"
          }">
            ${customer.status || "Banned"}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${
              customer.id
            })">
              <i class="fas fa-trash"></i>Xóa
            </button>
            <button class="btn ${
              customer.status === "Active" ? "btn-danger" : "btn-success"
            } btn-sm" 
                    onclick="changeCustomerStatus(${customer.id}, '${
      customer.status === "Active" ? "Banned" : "Active"
    }')">
              <i class="fas ${
                customer.status === "Active" ? "fa-ban" : "fa-check"
              }"></i>
              ${customer.status === "Active" ? "Khóa" : "Mở khóa"}
            </button>
          </div>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });

  // Render phân trang
  Pagination.renderPagination(
    paginatedResult.totalPages,
    "pagination",
    () => renderCustomers(searchTerm)
  );
}

// Xóa khách hàng
function deleteCustomer(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = "../login.html";
    return;
  }

  if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
    $.ajax({
      url: `https://localhost:7060/api/Customer/DeletePermanent/${id}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function (response) {
        alert("Xóa khách hàng thành công!");
        fetchCustomers();
      },
      error: function (xhr, status, error) {
        console.error("Lỗi khi xóa khách hàng:", error);
        if (xhr.status === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "../login.html";
        } else {
          alert("Không thể xóa khách hàng. Vui lòng thử lại sau.");
        }
      },
    });
  }
}

// Thay đổi trạng thái khách hàng
function changeCustomerStatus(id, newStatus) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = "../login.html";
    return;
  }

  $.ajax({
    url: `https://localhost:7060/api/Customer/ChangeSstatus/${id}?newStatus=${newStatus}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    success: function (response) {
      alert("Thay đổi trạng thái thành công!");
      fetchCustomers();
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      if (xhr.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "../login.html";
      } else {
        alert("Không thể thay đổi trạng thái. Vui lòng thử lại sau.");
      }
    },
  });
}

// Kiểm tra định kỳ
setInterval(checkAuth, 5000);

