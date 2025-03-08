// Biến lưu trữ dữ liệu
let voucherData = [];

// Khởi tạo khi trang load
document.addEventListener("DOMContentLoaded", function () {
  if (!checkAuth()) return;

  // Thêm UI phân trang
  document.getElementById("voucherPaginationContainer").innerHTML =
    Pagination.createPaginationUI("pagination");

  // Thêm event listener cho search
  document
    .getElementById("searchVoucher")
    ?.addEventListener("input", function (e) {
      renderVouchers(e.target.value);
    });

  // Thêm event listener cho form thêm voucher
  const addVoucherForm = document.getElementById("addVoucherForm");
  if (addVoucherForm) {
    addVoucherForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      // Format ngày tháng theo định dạng ISO
      const startDate = new Date(document.getElementById("voucherStartDate").value);
      const endDate = new Date(document.getElementById("voucherEndDate").value);
      
      const formData = {
        code: document.getElementById("voucherCode").value,
        name: document.getElementById("voucherName").value,
        description: document.getElementById("voucherDescription").value,
        quantity: parseInt(document.getElementById("voucherQuantity").value),
        discountValue: Math.round(parseFloat(document.getElementById("voucherDiscountValue").value)),
        minimumOrderValue: parseFloat(document.getElementById("voucherMinimumOrderValue").value),
        maxDiscount: parseFloat(document.getElementById("voucherMaxDiscount").value),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "Active"
      };

      // Validate dữ liệu
      if (!formData.code || !formData.name || !formData.description) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      // Validate ngày
      if (endDate <= startDate) {
        alert("Ngày kết thúc phải sau ngày bắt đầu!");
        return;
      }

      console.log("Dữ liệu gửi đi khi thêm:", formData);
      addVoucher(formData);
    });
  }

  // Xử lý form edit
  const editForm = document.getElementById("editVoucherForm");
  if (editForm) {
    editForm.addEventListener("submit", handleEditFormSubmit);
  }

  // Khởi tạo dữ liệu
  fetchVouchers();
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

  if (userRole !== "Employee") {
    alert("Bạn không có quyền truy cập trang này.");
    window.location.href = "../login.html";
    return false;
  }

  return true;
}

// Lấy danh sách voucher
function fetchVouchers() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Không tìm thấy token xác thực");
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = "../login.html";
    return;
  }

  $.ajax({
    url: "https://localhost:7060/api/Voucher/GetAll",
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      console.log("Dữ liệu voucher nhận được:", response);
      voucherData = response;
      renderVouchers();
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy danh sách voucher:", error);
      if (xhr.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "../login.html";
      } else {
        alert("Không thể lấy danh sách voucher. Vui lòng thử lại sau.");
      }
    },
  });
}

// Render danh sách voucher với phân trang
function renderVouchers(searchTerm = "") {
  const tbody = document.querySelector(".voucher-table tbody");
  if (!tbody) return;

  const paginatedResult = Pagination.paginateData(
    voucherData,
    searchTerm,
    ["code"]
  );

  tbody.innerHTML = "";

  if (paginatedResult.items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Không có voucher nào</td>
      </tr>
    `;
    return;
  }

  paginatedResult.items.forEach((voucher, index) => {
    const actualIndex = (paginatedResult.currentPage - 1) * paginatedResult.itemsPerPage + index + 1;
    
    // Format dates
    const startDate = voucher.startDate ? new Date(voucher.startDate).toLocaleString() : 'N/A';
    const endDate = voucher.endDate ? new Date(voucher.endDate).toLocaleString() : 'N/A';
    
    // Format discountValue với xử lý null/undefined và làm tròn số
    const formattedDiscountValue = voucher.discountValue ? Math.round(voucher.discountValue) : '0';
    
    // Get status badge class
    const statusClass = {
      'Active': 'bg-success',
      'Expired': 'bg-danger',
      'Used': 'bg-warning'
    }[voucher.status] || 'bg-secondary';

    const row = `
      <tr>
        <td>${actualIndex}</td>
        <td>${voucher.code || 'N/A'}</td>
        <td>${voucher.name || 'N/A'}</td>
        <td>${formattedDiscountValue}%</td>
        <td>Tối thiểu: ${voucher.minimumOrderValue?.toLocaleString() || '0'} VNĐ<br>
            Tối đa: ${voucher.maxDiscount?.toLocaleString() || '0'} VNĐ</td>
        <td>${startDate}</td>
        <td>${endDate}</td>
        <td>
          <span class="badge ${statusClass}">
            ${voucher.status || 'N/A'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-warning btn-sm" onclick="editVoucher(${voucher.id})">
              <i class="fas fa-edit"></i> Sửa
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteVoucher(${voucher.id})">
              <i class="fas fa-trash"></i> Xóa
            </button>
            <div class="dropdown d-inline">
              <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fas fa-cog"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" onclick="changeVoucherStatus(${voucher.id}, 'Active')">Kích hoạt</a></li>
                <li><a class="dropdown-item" href="#" onclick="changeVoucherStatus(${voucher.id}, 'Expired')">Hết hạn</a></li>
                <li><a class="dropdown-item" href="#" onclick="changeVoucherStatus(${voucher.id}, 'Used')">Đã sử dụng</a></li>
              </ul>
            </div>
          </div>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });

  Pagination.renderPagination(
    paginatedResult.totalPages,
    "pagination",
    () => renderVouchers(searchTerm)
  );
}

// Thêm voucher mới
function addVoucher(data) {
  const token = localStorage.getItem("token");
  if (!token) return;

  $.ajax({
    url: "https://localhost:7060/api/Voucher/AddVoucher",
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    data: JSON.stringify(data),
    success: function(response) {
      alert("Thêm voucher thành công!");
      $("#addVoucherModal").modal("hide");
      document.getElementById("addVoucherForm").reset();
      fetchVouchers();
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi thêm voucher:", error);
      console.error("Status:", xhr.status);
      console.error("Response:", xhr.responseText);
      
      let errorMessage = "Không thể thêm voucher: ";
      if (xhr.responseText) {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          errorMessage += errorResponse.message || xhr.responseText;
        } catch {
          errorMessage += xhr.responseText;
        }
      }
      alert(errorMessage);
    }
  });
}

// Sửa voucher
function editVoucher(id) {
  const token = localStorage.getItem("token");
  if (!token) return;

  $.ajax({
    url: `https://localhost:7060/api/Voucher/findId/${id}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      fillEditForm(response);
      $("#editVoucherModal").modal("show");
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy thông tin voucher:", error);
      alert("Không thể lấy thông tin voucher. Vui lòng thử lại sau.");
    },
  });
}

// Điền form sửa
function fillEditForm(voucher) {
  document.getElementById("editVoucherId").value = voucher.id;
  document.getElementById("editVoucherCode").value = voucher.code;
  document.getElementById("editVoucherName").value = voucher.name;
  document.getElementById("editVoucherDescription").value = voucher.description;
  document.getElementById("editVoucherQuantity").value = voucher.quantity;
  document.getElementById("editVoucherDiscountValue").value = voucher.discountValue;
  document.getElementById("editVoucherMinimumOrderValue").value = voucher.minimumOrderValue;
  document.getElementById("editVoucherMaxDiscount").value = voucher.maxDiscount;
  
  // Format dates for datetime-local input - giữ nguyên giờ
  const startDate = new Date(voucher.startDate);
  const endDate = new Date(voucher.endDate);
  
  // Format theo định dạng YYYY-MM-DDThh:mm
  document.getElementById("editVoucherStartDate").value = startDate.toISOString().slice(0, 16);
  document.getElementById("editVoucherEndDate").value = endDate.toISOString().slice(0, 16);
}

// Xử lý submit form sửa
function handleEditFormSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const id = document.getElementById("editVoucherId").value;
    const currentVoucher = voucherData.find(v => v.id === parseInt(id));
    if (!currentVoucher) throw new Error("Không tìm thấy thông tin voucher");

    // Lấy giá trị ngày từ form
    const startDateStr = document.getElementById("editVoucherStartDate").value;
    const endDateStr = document.getElementById("editVoucherEndDate").value;

    // Chuyển đổi sang đối tượng Date và giữ nguyên giờ từ input
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Validate ngày
    if (startDate >= endDate) {
      alert("Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }

    const formData = {
      id: parseInt(id),
      code: document.getElementById("editVoucherCode").value,
      name: document.getElementById("editVoucherName").value,
      description: document.getElementById("editVoucherDescription").value,
      quantity: parseInt(document.getElementById("editVoucherQuantity").value),
      discountValue: Math.round(parseFloat(document.getElementById("editVoucherDiscountValue").value)),
      minimumOrderValue: parseFloat(document.getElementById("editVoucherMinimumOrderValue").value),
      maxDiscount: parseFloat(document.getElementById("editVoucherMaxDiscount").value),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: currentVoucher.status
    };

    // Validate dữ liệu cơ bản
    if (!formData.code || !formData.name || !formData.description) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    console.log("Dữ liệu gửi đi khi cập nhật:", formData);
    updateVoucher(formData);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu form:", error);
    alert("Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
  }
}

// Cập nhật voucher
function updateVoucher(formData) {
  const token = localStorage.getItem("token");
  if (!token) return;

  $.ajax({
    url: `https://localhost:7060/api/Voucher/Update/${formData.id}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(formData),
    success: function (response) {
      alert("Cập nhật voucher thành công!");
      $("#editVoucherModal").modal("hide");
      fetchVouchers();
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi cập nhật:", error);
      console.error("Status:", xhr.status);
      console.error("Response:", xhr.responseText);
      
      let errorMessage = "Không thể cập nhật voucher: ";
      if (xhr.responseText) {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          errorMessage += errorResponse.message || xhr.responseText;
        } catch {
          errorMessage += xhr.responseText;
        }
      }
      alert(errorMessage);
    }
  });
}

// Xóa voucher
function deleteVoucher(id) {
  const token = localStorage.getItem("token");
  if (!token) return;

  if (confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
    $.ajax({
      url: `https://localhost:7060/api/Voucher/DeletePermanent/${id}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function (response) {
        alert("Xóa voucher thành công!");
        fetchVouchers();
      },
      error: function (xhr, status, error) {
        console.error("Lỗi khi xóa voucher:", error);
        alert("Không thể xóa voucher. Vui lòng thử lại sau.");
      },
    });
  }
}

// Thay đổi trạng thái voucher
function changeVoucherStatus(id, newStatus) {
  const token = localStorage.getItem("token");
  if (!token) return;

  $.ajax({
    url: `https://localhost:7060/api/Voucher/ChangeSstatus/${id}?newStatus=${newStatus}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    success: function (response) {
      alert("Thay đổi trạng thái thành công!");
      fetchVouchers();
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      alert("Không thể thay đổi trạng thái. Vui lòng thử lại sau.");
    },
  });
}

// Tìm kiếm voucher
function searchVouchers() {
  const searchTerm = document.getElementById("searchVoucher").value;
  renderVouchers(searchTerm);
}

// Kiểm tra định kỳ
setInterval(checkAuth, 5000);
