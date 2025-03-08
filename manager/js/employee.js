// Biến lưu trữ dữ liệu
let employeeData = [];

// Khởi tạo widget Cloudinary cho nhân viên
let employeeWidget = null;

function initializeCloudinaryWidget() {
  // Widget cho thêm mới
  employeeWidget = cloudinary.createUploadWidget(
    {
      cloudName: "dwcih9djc",
      uploadPreset: "ml_default",
      sources: ["local", "url", "camera"],
      multiple: false,
      clientAllowedFormats: ["jpg", "png", "jpeg", "gif"],
      maxFileSize: 2000000,
    },
    (error, result) => {
      if (!error && result && result.event === "success") {
        const imageUrl = result.info.secure_url;
        const previewImage = document.getElementById("employee-preview-image");
        if (previewImage) {
          previewImage.src = imageUrl;
          previewImage.style.display = "block";
        }
        document.getElementById("employeeImageUrl").value = imageUrl;
      }
    }
  );

  // Widget cho chỉnh sửa
  const editWidget = cloudinary.createUploadWidget(
    {
      cloudName: "dwcih9djc",
      uploadPreset: "ml_default",
      sources: ["local", "url", "camera"],
      multiple: false,
      clientAllowedFormats: ["jpg", "png", "jpeg", "gif"],
      maxFileSize: 2000000,
    },
    (error, result) => {
      if (!error && result && result.event === "success") {
        const imageUrl = result.info.secure_url;
        const previewImage = document.getElementById("edit-employee-preview-image");
        if (previewImage) {
          previewImage.src = imageUrl;
          previewImage.style.display = "block";
        }
        document.getElementById("editEmployeeImageUrl").value = imageUrl;
      }
    }
  );

  // Event listener cho nút upload trong form thêm mới
  const uploadButton = document.getElementById("employee_upload_widget");
  if (uploadButton) {
    uploadButton.addEventListener(
      "click",
      () => {
        employeeWidget.open();
      },
      false
    );
  }

  // Event listener cho nút upload trong form edit
  const editUploadButton = document.getElementById("edit_employee_upload_widget");
  if (editUploadButton) {
    editUploadButton.addEventListener(
      "click",
      () => {
        editWidget.open();
      },
      false
    );
  }
}

// Khởi tạo khi trang load
document.addEventListener("DOMContentLoaded", function () {
  if (!checkAuth()) return;

  // Khởi tạo widget Cloudinary
  initializeCloudinaryWidget();

  // Thêm UI phân trang
  document.getElementById("employeePaginationContainer").innerHTML =
    Pagination.createPaginationUI("pagination");

  // Thêm event listener cho itemsPerPage
  document
    .getElementById("itemsPerPage")
    ?.addEventListener("change", function (e) {
      Pagination.changeItemsPerPage(e.target.value, () =>
        renderEmployees(
          document.getElementById("searchEmployee")?.value || ""
        )
      );
    });

  // Thêm event listener cho search
  document
    .getElementById("searchEmployee")
    ?.addEventListener("input", function (e) {
      renderEmployees(e.target.value);
    });

  // Thêm event listener cho form thêm nhân viên
  const addEmployeeForm = document.getElementById("addEmployeeForm");
  if (addEmployeeForm) {
    addEmployeeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      // Format ngày tháng theo định dạng yyyy-MM-dd
      const dobInput = document.getElementById("employeeDob").value;
      const dob = new Date(dobInput);
      const formattedDob = dob.toISOString().split('T')[0];
      
      const formData = {
        code: generateEmployeeCode(),
        fullName: document.getElementById("employeeFullName").value,
        email: document.getElementById("employeeEmail").value,
        phone: document.getElementById("employeePhone").value,
        address: document.getElementById("employeeAddress").value,
        city: document.getElementById("employeeCountry").value,
        dob: formattedDob,
        gender: document.getElementById("employeeGender").value,
        image: document.getElementById("employeeImageUrl").value || "",
        status: "Working",
        password: document.getElementById("employeePassword")?.value || "Admin@123",
        role: "Employee"
      };

      // Validate dữ liệu
      if (!formData.fullName || !formData.email || !formData.phone || !formData.address || 
          !formData.city || !formData.dob || !formData.gender) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert("Email không hợp lệ!");
        return;
      }

      // Validate số điện thoại
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        alert("Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số.");
        return;
      }

      // Gọi API thêm nhân viên
      addEmployee(formData);
    });
  }

  // Xử lý form edit
  const editForm = document.getElementById("editEmployeeForm");
  if (editForm) {
    editForm.addEventListener("submit", handleEditFormSubmit);
  }

  // Khởi tạo dữ liệu
  fetchEmployees();
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

// Lấy danh sách nhân viên
function fetchEmployees() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Không tìm thấy token xác thực");
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = "../login.html";
    return;
  }

  $.ajax({
    url: "https://localhost:7060/api/Employee/GetAll",
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      console.log("Dữ liệu nhân viên nhận được:", response);
      employeeData = response;
      renderEmployees();
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      if (xhr.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "../login.html";
      } else {
        alert("Không thể lấy danh sách nhân viên. Vui lòng thử lại sau.");
      }
    },
  });
}

// Render danh sách nhân viên với phân trang
function renderEmployees(searchTerm = "") {
  const tbody = document.querySelector(".employee-table tbody");
  if (!tbody) {
    console.error("Không tìm thấy phần tử tbody trong bảng nhân viên");
    return;
  }

  // Sử dụng hàm paginateData từ pagination.js
  const paginatedResult = Pagination.paginateData(
    employeeData,
    searchTerm,
    ["fullName", "code", "email", "phone"]
  );

  tbody.innerHTML = "";

  if (paginatedResult.items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">Không có nhân viên nào</td>
      </tr>
    `;
    return;
  }

  paginatedResult.items.forEach((employee, index) => {
    const actualIndex =
      (paginatedResult.currentPage - 1) * paginatedResult.itemsPerPage +
      index +
      1;
    const row = `
      <tr>
        <td>${actualIndex}</td>
        <td>
          <img src="${
            employee.image || "https://via.placeholder.com/80"
          }" 
               alt="${employee.fullName}" 
               class="employee-image"
               onerror="this.src='https://via.placeholder.com/80'">
        </td>
        <td>${employee.fullName || ""}</td>
        <td>${employee.code || ""}</td>
        <td>${employee.email || ""}</td>
        <td>${employee.phone || ""}</td>
        <td>
          <span class="badge ${
            employee.status === "Working" ? "bg-success" : "bg-danger"
          }">
            ${employee.status || "Not_Working"}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-warning btn-sm" onclick="editEmployee(${
              employee.id
            })">
              <i class="fas fa-edit"></i>Sửa 
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${
              employee.id
            })">
              <i class="fas fa-trash"></i>Xóa
            </button>
            <button class="btn ${
              employee.status === "Working" ? "btn-danger" : "btn-success"
            } btn-sm" 
                    onclick="changeEmployeeStatus(${employee.id}, '${
      employee.status === "Working" ? "Not_Working" : "Working"
    }')">
              <i class="fas ${
                employee.status === "Working" ? "fa-times" : "fa-check"
              }"></i>
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
    () => renderEmployees(searchTerm)
  );
}

// Xóa nhân viên
function deleteEmployee(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = "../login.html";
    return;
  }

  if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
    $.ajax({
      url: `https://localhost:7060/api/Employee/DeletePermanent/${id}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function (response) {
        alert("Xóa nhân viên thành công!");
        fetchEmployees();
      },
      error: function (xhr, status, error) {
        console.error("Lỗi khi xóa nhân viên:", error);
        if (xhr.status === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "../login.html";
        } else {
          alert("Không thể xóa nhân viên. Vui lòng thử lại sau.");
        }
      },
    });
  }
}

// Thay đổi trạng thái nhân viên
function changeEmployeeStatus(id, newStatus) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = "../login.html";
    return;
  }

  $.ajax({
    url: `https://localhost:7060/api/Employee/ChangeSstatus/${id}?newStatus=${newStatus}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    success: function (response) {
      alert("Thay đổi trạng thái thành công!");
      fetchEmployees();
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

// Sửa thông tin nhân viên
function editEmployee(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = "../login.html";
    return;
  }

  $.ajax({
    url: `https://localhost:7060/api/Employee/findId/${id}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      // Điền thông tin vào form
      fillEditForm(response);
      $("#editEmployeeModal").modal("show");
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy thông tin nhân viên:", error);
      if (xhr.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "../login.html";
      } else {
        alert("Không thể lấy thông tin nhân viên. Vui lòng thử lại sau.");
      }
    },
  });
}

// Điền thông tin vào form sửa
function fillEditForm(employee) {
  console.log("Dữ liệu nhân viên cần edit:", employee);

  try {
    // Các trường ẩn
    document.getElementById("editEmployeeId").value = employee.id;
    document.getElementById("editEmployeeCode").value = employee.code;
    document.getElementById("editEmployeeAddress").value = employee.address;
    document.getElementById("editEmployeeCountry").value = employee.city;

    // Các trường hiển thị
    document.getElementById("editEmployeeFullName").value = employee.fullName;
    document.getElementById("editEmployeeEmail").value = employee.email;
    document.getElementById("editEmployeePhone").value = employee.phone;
    
    // Format lại ngày tháng
    const dobDate = new Date(employee.dob);
    const formattedDob = dobDate.toISOString().split('T')[0];
    document.getElementById("editEmployeeDob").value = formattedDob;
    
    document.getElementById("editEmployeeGender").value = employee.gender;

    // Ảnh
    const previewImage = document.getElementById("edit-employee-preview-image");
    if (employee.image) {
      previewImage.src = employee.image;
      previewImage.style.display = "block";
      document.getElementById("editEmployeeImageUrl").value = employee.image;
    } else {
      previewImage.src = "https://via.placeholder.com/80";
      previewImage.style.display = "block";
      document.getElementById("editEmployeeImageUrl").value = "";
    }

    console.log("Đã điền xong form");
  } catch (error) {
    console.error("Lỗi khi điền form:", error);
  }
}

// Tách riêng hàm xử lý submit
function handleEditFormSubmit(e) {
  e.preventDefault();
  console.log("Đang xử lý form edit...");

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = "../login.html";
    return;
  }

  try {
    const id = document.getElementById("editEmployeeId").value;
    const currentEmployee = employeeData.find(emp => emp.id === parseInt(id));
    if (!currentEmployee) {
      throw new Error("Không tìm thấy thông tin nhân viên");
    }

    const formData = {
      id: parseInt(id),
      code: document.getElementById("editEmployeeCode").value,
      fullName: document.getElementById("editEmployeeFullName").value,
      email: document.getElementById("editEmployeeEmail").value,
      phone: document.getElementById("editEmployeePhone").value,
      address: document.getElementById("editEmployeeAddress").value,
      city: document.getElementById("editEmployeeCountry").value,
      dob: document.getElementById("editEmployeeDob").value,
      gender: document.getElementById("editEmployeeGender").value,
      image: document.getElementById("editEmployeeImageUrl").value || "",
      status: currentEmployee.status,
      role: "Employee",
      password: "********",
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
      createdBy: "Admin",
      updateBy: "Admin"
    };

    // Validate dữ liệu cơ bản
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Email không hợp lệ!");
      return;
    }

    // Validate số điện thoại format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số.");
      return;
    }

   

    console.log("Dữ liệu sẽ gửi đi:", formData);

    // Gọi API cập nhật
    updateEmployee(formData);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu form:", error);
    alert("Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
  }
}

// Tách riêng hàm gọi API update
function updateEmployee(formData) {
  const token = localStorage.getItem("token");
  
  $.ajax({
    url: `https://localhost:7060/api/Employee/Update/${formData.id}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(formData),
    success: function (response) {
      console.log("Cập nhật thành công:", response);
      alert("Cập nhật thông tin nhân viên thành công!");
      $("#editEmployeeModal").modal("hide");
      fetchEmployees();
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi cập nhật:", error);
      console.error("Status:", xhr.status);
      console.error("Response:", xhr.responseText);
      
      if (xhr.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "../login.html";
        return;
      }
      
      let errorMessage = "Lỗi khi cập nhật thông tin nhân viên: ";
      if (xhr.responseText && xhr.responseText.includes("System.Exception")) {
        const match = xhr.responseText.match(/System\.Exception: (.*?)\r?\n/);
        if (match && match[1]) {
          errorMessage += match[1];
        }
      }
      alert(errorMessage);
    }
  });
}

// Kiểm tra định kỳ
setInterval(checkAuth, 5000);

// Hàm tạo mã nhân viên tự động
function generateEmployeeCode() {
  return 'EMP' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
}

// Hàm thêm nhân viên mới
function addEmployee(data) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = "../login.html";
    return;
  }

  // Validate ngày sinh không được là tương lai
  const dobDate = new Date(data.dob);
  const today = new Date();
  if (dobDate > today) {
    alert("Ngày sinh không thể là ngày trong tương lai!");
    return;
  }

  // Format ngày tháng
  const currentDate = new Date().toISOString().split('T')[0];
  const employeeData = {
    ...data,
    dob: data.dob,
    createDate: currentDate,
    updateDate: currentDate,
    createdBy: "Admin",
    updateBy: "Admin"
  };

  console.log("Dữ liệu gửi đi:", employeeData);

  $.ajax({
    url: "https://localhost:7060/api/Employee/AddEmployee",
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    data: JSON.stringify(employeeData),
    success: function(response) {
      alert("Thêm nhân viên thành công!");
      $("#addEmployeeModal").modal("hide");
      document.getElementById("addEmployeeForm").reset();
      document.getElementById("employee-preview-image").style.display = "none";
      fetchEmployees();
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi thêm nhân viên:", error);
      console.error("Status:", xhr.status);
      console.error("Response text:", xhr.responseText);
      
      if (xhr.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        window.location.href = "../login.html";
        return;
      }
      
      // Xử lý message lỗi từ backend
      if (xhr.responseText && xhr.responseText.includes("System.Exception")) {
        const match = xhr.responseText.match(/System\.Exception: (.*?)\r?\n/);
        if (match && match[1]) {
          alert(match[1]);
          return;
        }
      }
      
      alert("Không thể thêm nhân viên. Vui lòng thử lại sau.");
    }
  });
}

function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  return $.ajax({
    url: "https://localhost:7060/api/Auth/RefreshToken",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: JSON.stringify({ refreshToken: refreshToken }),
    success: function(response) {
      localStorage.setItem("token", response.token);
      return true;
    },
    error: function() {
      return false;
    }
  });
} 