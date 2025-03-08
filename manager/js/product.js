// Khai báo biến toàn cục
let myWidget = null;
let productWidget = null;

const element = document.getElementById("someId");
if (element) {
  // Thực hiện các thao tác với element
}

// Khởi tạo Cloudinary widgets
function initializeCloudinaryWidgets() {
  myWidget = cloudinary.createUploadWidget(
    {
      cloudName: "dwcih9djc",
      uploadPreset: "ml_default",
      sources: ["local", "url", "camera"],
      multiple: false,
      clientAllowedFormats: ["jpg", "png", "jpeg", "gif"],
      cropping: false,
    },
    (error, result) => {
      if (!error && result && result.event === "success") {
        var imageUrl = result.info.secure_url;
        const previewImage = document.getElementById("preview-image");
        if (previewImage) {
          previewImage.src = imageUrl;
          previewImage.style.display = "block";
        }
        console.log("Ảnh đã được tải lên:", imageUrl);
      } else if (error) {
        console.error("Lỗi Cloudinary:", error);
        alert(
          "Có lỗi xảy ra khi tải lên ảnh. Vui lòng kiểm tra console để biết thêm chi tiết."
        );
      }
    }
  );

  productWidget = cloudinary.createUploadWidget(
    {
      cloudName: "dwcih9djc",
      uploadPreset: "ml_default",
      sources: ["local", "url", "camera"],
      multiple: true,
      clientAllowedFormats: ["jpg", "png", "jpeg", "gif"],
      cropping: false,
    },
    (error, result) => {
      if (!error && result && result.event === "success") {
        var imageUrl = result.info.secure_url;
        const previewContainer = document.getElementById(
          "product-images-preview"
        );
        const imageUrlsInput = document.getElementById("productImageUrls");

        if (previewContainer && imageUrlsInput) {
          // Thêm ảnh preview
          const img = document.createElement("img");
          img.src = imageUrl;
          img.alt = "Preview";
          img.style.maxHeight = "100px";
          img.style.margin = "5px";
          previewContainer.appendChild(img);

          // Cập nhật danh sách URL ảnh
          const currentUrls = imageUrlsInput.value
            ? imageUrlsInput.value.split(",")
            : [];
          currentUrls.push(imageUrl);
          imageUrlsInput.value = currentUrls.join(",");
        }

        console.log("Ảnh sản phẩm đã được tải lên:", imageUrl);
      } else if (error) {
        console.error("Lỗi Cloudinary:", error);
        alert(
          "Có lỗi xảy ra khi tải lên ảnh. Vui lòng kiểm tra console để biết thêm chi tiết."
        );
      }
    }
  );
}

function initializeEventListeners() {
  // Form thêm sản phẩm
  const addProductForm = document.getElementById("addProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const productData = {
        name: document.getElementById("productName").value,
        code: document.getElementById("productCode").value,
        description: document.getElementById("productDescription").value,
        brandId: document.getElementById("productBrand").value,
        categoryId: document.getElementById("productCategory").value,
        imageUrls: document.getElementById("productImageUrl").value
          ? [document.getElementById("productImageUrl").value]
          : [],
      };
      addProduct(productData);
    });
  }

  // Form sửa sản phẩm
  const editProductForm = document.getElementById("editProductForm");
  if (editProductForm) {
    editProductForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const id = document.getElementById("editProductId").value;
      const productData = {
        name: document.getElementById("editProductName").value,
        category: document.getElementById("editProductCategory").value,
        price: document.getElementById("editProductPrice").value,
        imageUrl: document.getElementById("editProductImageUrl").value,
      };
      updateProduct(id, productData);
    });
  }

  // Nút tìm kiếm
  const searchInput = document.getElementById("searchProduct");
  if (searchInput) {
    searchInput.addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        searchProducts();
      }
    });
  }

  const searchButton = document.querySelector('button[onclick="searchProducts()"]');
  if (searchButton) {
    searchButton.addEventListener("click", function () {
      searchProducts();
    });
  }

  // Upload widgets
  const uploadWidget = document.getElementById("upload_widget");
  if (uploadWidget) {
    uploadWidget.addEventListener(
      "click",
      function () {
        myWidget.open();
      },
      false
    );
  }

  const productUploadWidget = document.getElementById("product_upload_widget");
  if (productUploadWidget) {
    productUploadWidget.addEventListener(
      "click",
      function () {
        productWidget.open();
      },
      false
    );
  }

  // Xử lý đăng xuất
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiration");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      window.location.href = "../login.html";
    });
  }

  // Hiển thị tên nhân viên
  const employeeName = localStorage.getItem("userName");
  const employeeNameElement = document.getElementById("employeeName");
  if (employeeName && employeeNameElement) {
    employeeNameElement.textContent = employeeName;
  }
}

function loadInitialData() {
  loadBrands();
  loadCategories();
  loadColors();
  loadSizes();
  fetchProducts();
}

// Hàm lấy danh sách sản phẩm
function fetchProducts() {
  $.ajax({
    url: "https://localhost:7060/api/Product/GetAll",
    method: "GET",
    success: function (response) {
      console.log("Dữ liệu sản phẩm:", response); // Thêm log để debug
      const tbody = document.querySelector("#products table tbody");
      tbody.innerHTML = "";

      if (!response || response.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center">Không có sản phẩm nào</td>
          </tr>
        `;
        return;
      }

      response.forEach((product, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${product.productName || ""}</td>
            <td>${product.code || ""}</td>
            <td>${product.description || ""}</td>
            <td>
              <span class="badge ${
                product.status === "Available"
                  ? "bg-success"
                  : "bg-danger"
              }">
                ${product.status || "Unavailable"}
              </span>
            </td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editProduct(${
                product.id
              })">
                <i class="fas fa-edit"></i> Sửa
              </button>
                <button class="btn btn-info btn-sm" onclick="showProductDetails(${
                  product.id
                }, '${product.productName}')">
                  <i class="fas fa-list"></i> Chi tiết
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteProduct(${
                product.id
              })">
                <i class="fas fa-trash"></i> Xóa
              </button>
              <button class="btn ${
                product.status === "Available"
                  ? "btn-danger"
                  : "btn-success"
              } btn-sm" 
                      onclick="changeStatus(${product.id}, '${
            product.status === "Available" ? "Unavailable" : "Available"
          }')">
                <i class="fas ${
                  product.status === "Available" ? "fa-times" : "fa-check"
                }"></i>
              </button>
            </td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      console.error("Chi tiết lỗi:", xhr.responseText); // Thêm log chi tiết lỗi
      alert(
        "Không thể lấy danh sách sản phẩm. Vui lòng kiểm tra console để biết thêm chi tiết."
      );
    },
  });
}

// Hàm tìm kiếm sản phẩm
function searchProducts() {
  const searchTerm = document.getElementById("searchProduct").value;
  if (!searchTerm) {
    fetchProducts();
    return;
  }

  $.ajax({
    url: `https://localhost:7060/api/Product/FindByName/${searchTerm}`,
    method: "GET",
    success: function (response) {
      const tbody = document.querySelector("#products table tbody");
      tbody.innerHTML = "";

      response.forEach((product, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${product.productName || ""}</td>
            <td>${product.code || ""}</td>
            <td>${product.description || ""}</td>
            <td>
              <span class="badge ${
                product.status === "Available"
                  ? "bg-success"
                  : "bg-danger"
              }">
                ${product.status || "Unavailable"}
              </span>
            </td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editProduct(${
                product.id
              })">
                <i class="fas fa-edit"></i> Sửa
              </button>
                <button class="btn btn-info btn-sm" onclick="showProductDetails(${
                  product.id
                }, '${product.productName}')">
                  <i class="fas fa-list"></i> Chi tiết
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteProduct(${
                product.id
              })">
                <i class="fas fa-trash"></i> Xóa
              </button>
              <button class="btn ${
                product.status === "Available"
                  ? "btn-danger"
                  : "btn-success"
              } btn-sm" 
                      onclick="changeStatus(${product.id}, '${
            product.status === "Available" ? "Unavailable" : "Available"
          }')">
                <i class="fas ${
                  product.status === "Available" ? "fa-times" : "fa-check"
                }"></i>
              </button>
            </td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      alert("Không thể tìm kiếm sản phẩm. Vui lòng thử lại sau.");
    },
  });
}

// Hàm thêm sản phẩm
function addProduct(productData) {
  const currentDate = new Date().toISOString();
  const data = {
    code: productData.code,
    productName: productData.name,
    description: productData.description,
    createDate: currentDate,
    updateDate: currentDate,
    createdBy: "Admin",
    updateBy: "Admin",
    status: "Available",
    categoryId: parseInt(productData.categoryId),
    brandId: parseInt(productData.brandId),
  };

  console.log("Dữ liệu gửi đi:", data);

  $.ajax({
    url: "https://localhost:7060/api/Product/AddProduct",
    method: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    success: function (response) {
      alert("Thêm sản phẩm thành công!");
      $("#addProductModal").modal("hide");
      fetchProducts();
      document.getElementById("addProductForm").reset();
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      console.error("Chi tiết lỗi:", xhr.responseText);
      alert("Không thể thêm sản phẩm. Vui lòng thử lại sau.");
    },
  });
}

// Hàm sửa sản phẩm
function editProduct(id) {
  $.ajax({
    url: `https://localhost:7060/api/Product/GetAll`,
    method: "GET",
    success: function (response) {
      const product = response.find((p) => p.id === id);
      if (!product) {
        alert("Không tìm thấy sản phẩm!");
        return;
      }

      // Điền dữ liệu vào form sửa
      document.getElementById("editProductId").value = product.id;
      document.getElementById("editProductName").value =
        product.productName;
      document.getElementById("editProductCategory").value = product.code;
      document.getElementById("editProductPrice").value =
        product.description;

      if (product.imageUrl) {
        document.getElementById("editProductPreview").src =
          product.imageUrl;
        document.getElementById("editProductPreview").style.display =
          "block";
        document.getElementById("editProductImageUrl").value =
          product.imageUrl;
      }

      $("#editProductModal").modal("show");
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      alert("Không thể lấy thông tin sản phẩm. Vui lòng thử lại sau.");
    },
  });
}

// Hàm cập nhật sản phẩm
function updateProduct(id, productData) {
  const data = {
    id: parseInt(id),
    productName: productData.name,
    code: productData.category,
    description: productData.price,
    status: "Available",
    imageUrl: productData.imageUrl || "",
    createdBy: "Admin",
  };

  console.log("Dữ liệu cập nhật:", data);

  $.ajax({
    url: `https://localhost:7060/api/Product/Update/${id}`,
    method: "PUT",
    data: JSON.stringify(data),
    contentType: "application/json",
    success: function (response) {
      alert("Cập nhật sản phẩm thành công!");
      $("#editProductModal").modal("hide");
      fetchProducts();
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      console.error("Chi tiết lỗi:", xhr.responseText);
      alert("Không thể cập nhật sản phẩm. Vui lòng thử lại sau.");
    },
  });
}

// Hàm xóa sản phẩm
function deleteProduct(id) {
  if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
    $.ajax({
      url: `https://localhost:7060/api/Product/DeletePermanent/${id}`,
      method: "DELETE",
      success: function (response) {
        alert("Xóa sản phẩm thành công!");
        fetchProducts(); // Tải lại danh sách
      },
      error: function (xhr, status, error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        alert("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
      },
    });
  }
}

// Hàm thay đổi trạng thái sản phẩm
function changeStatus(id, newStatus) {
  $.ajax({
    url: `https://localhost:7060/api/Product/ChangeSstatus/${id}?newStatus=${newStatus}`,
    method: "PUT",
    success: function (response) {
      alert("Cập nhật trạng thái thành công!");
      fetchProducts(); // Tải lại danh sách
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại sau.");
    },
  });
}

// Hàm load danh sách thương hiệu
function loadBrands() {
  $.ajax({
    url: "https://localhost:7060/api/Brand/GetAll",
    method: "GET",
    success: function (response) {
      console.log("Dữ liệu thương hiệu:", response); // Log để debug
      const brandSelect = document.getElementById("productBrand");
      brandSelect.innerHTML =
        '<option value="">Chọn thương hiệu</option>';

      if (Array.isArray(response)) {
        response.forEach((brand) => {
          brandSelect.innerHTML += `<option value="${brand.id}">${brand.brandName}</option>`;
        });
      } else {
        console.error(
          "Dữ liệu thương hiệu không phải là mảng:",
          response
        );
      }
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy danh sách thương hiệu:", error);
      console.error("Chi tiết lỗi:", xhr.responseText);
    },
  });
}

// Hàm load danh sách danh mục
function loadCategories() {
  $.ajax({
    url: "https://localhost:7060/api/Category/GetAll",
    method: "GET",
    success: function (response) {
      console.log("Dữ liệu danh mục:", response); // Log để debug
      const categorySelect = document.getElementById("productCategory");
      categorySelect.innerHTML =
        '<option value="">Chọn danh mục</option>';

      if (Array.isArray(response)) {
        response.forEach((category) => {
          categorySelect.innerHTML += `<option value="${category.id}">${category.categoryName}</option>`;
        });
      } else {
        console.error("Dữ liệu danh mục không phải là mảng:", response);
      }
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      console.error("Chi tiết lỗi:", xhr.responseText);
    },
  });
}

// Hàm load danh sách màu sắc
function loadColors() {
  $.ajax({
    url: "https://localhost:7060/api/Color/GetAll",
    method: "GET",
    success: function (response) {
      console.log("Dữ liệu màu sắc:", response);
      const colorSelects = document.querySelectorAll(
        "#colorId, #editColorId"
      );
      colorSelects.forEach((select) => {
        select.innerHTML = '<option value="">Chọn màu sắc</option>';
        if (Array.isArray(response)) {
          response.forEach((color) => {
            select.innerHTML += `<option value="${color.id}">${color.colorName}</option>`;
          });
        }
      });
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy danh sách màu sắc:", error);
    },
  });
}

// Hàm load danh sách kích cỡ
function loadSizes() {
  $.ajax({
    url: "https://localhost:7060/api/Size/GetAll",
    method: "GET",
    success: function (response) {
      console.log("Dữ liệu kích cỡ:", response);
      const sizeSelects = document.querySelectorAll(
        "#sizeId, #editSizeId"
      );
      sizeSelects.forEach((select) => {
        select.innerHTML = '<option value="">Chọn kích cỡ</option>';
        if (Array.isArray(response)) {
          response.forEach((size) => {
            select.innerHTML += `<option value="${size.id}">${size.sizeCode}</option>`;
          });
        }
      });
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi lấy danh sách kích cỡ:", error);
    },
  });
}

// Hàm hiển thị modal chi tiết sản phẩm
function showProductDetails(productId, productName) {
  // Cập nhật tiêu đề modal
  document.getElementById(
    "productDetailsModalTitle"
  ).textContent = `Chi tiết sản phẩm: ${productName}`;

  // Lưu productId vào modal
  $("#productDetailsModal").data("productId", productId);

  // Lấy tất cả dữ liệu cần thiết
  Promise.all([
    $.ajax({
      url: `https://localhost:7060/api/ProductDetail/GetAll`,
      method: "GET",
    }),
    $.ajax({
      url: "https://localhost:7060/api/Color/GetAll",
      method: "GET",
    }),
    $.ajax({
      url: "https://localhost:7060/api/Size/GetAll",
      method: "GET",
    }),
  ])
    .then(([productDetails, colors, sizes]) => {
      // Lọc chi tiết theo productId
      const filteredDetails = productDetails.filter(
        (detail) => detail.productId === parseInt(productId)
      );

      const tbody = document.getElementById("productDetailsTableBody");
      tbody.innerHTML = "";

      if (filteredDetails.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">Không có chi tiết sản phẩm nào</td>
      </tr>
    `;
        return;
      }

      filteredDetails.forEach((detail, index) => {
        // Tìm tên màu sắc và kích thước tương ứng
        const color = colors.find((c) => c.id === detail.colorId);
        const size = sizes.find((s) => s.id === detail.sizeId);

        const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${detail.name || ""}</td>
        <td>${detail.code || ""}</td>
        <td>${detail.price?.toLocaleString("vi-VN")}đ</td>
        <td>${size ? size.sizeCode : ""}</td>
        <td>${color ? color.colorName : ""}</td>
        <td>
          <span class="badge ${
            detail.status === "Available" ? "bg-success" : "bg-danger"
          }">
            ${detail.status === "Available" ? "Available" : "OutOfStock"}
          </span>
        </td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editProductDetail(${
            detail.id
          })">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteProductDetail(${
            detail.id
          })">
            <i class="fas fa-trash"></i>
          </button>
          <button class="btn ${
            detail.status === "Available"
              ? "btn-danger"
              : "btn-success"
          } btn-sm" 
                  onclick="changeProductDetailStatus(${detail.id}, '${
          detail.status === "Available" ? "OutOfStock" : "Available"
        }')">
            <i class="fas ${
              detail.status === "Available" ? "fa-times" : "fa-check"
            }"></i>
          </button>
        </td>
      </tr>
    `;
        tbody.innerHTML += row;
      });
    })
    .catch((error) => {
      console.error("Lỗi khi lấy dữ liệu:", error);
      alert("Không thể lấy dữ liệu. Vui lòng thử lại sau.");
    });

  // Hiển thị modal
  $("#productDetailsModal").modal("show");
}

// Hàm hiển thị modal thêm chi tiết sản phẩm
function showAddProductDetailModal() {
  const productId = $("#productDetailsModal").data("productId");
  const productName = document
    .getElementById("productDetailsModalTitle")
    .textContent.split(": ")[1];

  // Ẩn modal chi tiết trước khi hiện modal thêm mới
  $("#productDetailsModal").modal("hide");

  // Đợi modal chi tiết ẩn hoàn toàn rồi mới hiện modal thêm mới
  $("#productDetailsModal").on("hidden.bs.modal", function () {
    // Cập nhật form thêm mới
    document.getElementById("productId").value = productId;
    document.getElementById("productName").value = productName;
    document.getElementById("productName").disabled = true;

    // Hiển thị modal thêm mới
    $("#addProductDetailModal").modal("show");
    // Xóa event listener để tránh gọi nhiều lần
    $(this).off("hidden.bs.modal");
  });
}

// Cập nhật các hàm xử lý chi tiết sản phẩm để refresh modal
function refreshProductDetails() {
  const productId = $("#productDetailsModal").data("productId");
  const productName = document
    .getElementById("productDetailsModalTitle")
    .textContent.split(": ")[1];
  showProductDetails(productId, productName);
}

// Cập nhật các hàm thêm, sửa, xóa để gọi refreshProductDetails
function addProductDetail(data) {
  $.ajax({
    url: "https://localhost:7060/api/ProductDetail/AddProductDetail",
    method: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    success: function (response) {
      alert("Thêm chi tiết sản phẩm thành công!");
      $("#addProductDetailModal").modal("hide");

      // Đợi modal thêm mới ẩn hoàn toàn
      $("#addProductDetailModal").on("hidden.bs.modal", function () {
        // Hiện lại modal chi tiết và refresh data
        const productId = $("#productDetailsModal").data("productId");
        const productName = document
          .getElementById("productDetailsModalTitle")
          .textContent.split(": ")[1];
        $("#productDetailsModal").modal("show");
        showProductDetails(productId, productName);
        // Xóa event listener
        $(this).off("hidden.bs.modal");
      });

      // Reset form
      document.getElementById("addProductDetailForm").reset();
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi thêm chi tiết sản phẩm:", error);
      console.error("Chi tiết response:", xhr.responseText);
      alert(
        "Không thể thêm chi tiết sản phẩm. Vui lòng kiểm tra console để biết thêm chi tiết."
      );
    },
  });
}

function deleteProductDetail(id) {
  if (confirm("Bạn có chắc chắn muốn xóa chi tiết sản phẩm này?")) {
    $.ajax({
      url: `https://localhost:7060/api/ProductDetail/DeletePermanent/${id}`,
      method: "DELETE",
      success: function (response) {
        alert("Xóa chi tiết sản phẩm thành công!");
        // Refresh data ngay lập tức
        const productId = $("#productDetailsModal").data("productId");
        const productName = document
          .getElementById("productDetailsModalTitle")
          .textContent.split(": ")[1];
        showProductDetails(productId, productName);
      },
      error: function (xhr, status, error) {
        console.error("Lỗi khi xóa chi tiết sản phẩm:", error);
        alert("Không thể xóa chi tiết sản phẩm. Vui lòng thử lại sau.");
      },
    });
  }
}

// Thêm xử lý khi đóng modal
$("#addProductDetailModal, #editProductDetailModal").on(
  "hidden.bs.modal",
  function () {
    // Khi đóng modal thêm/sửa, hiện lại modal chi tiết
    const productId = $("#productDetailsModal").data("productId");
    const productName = document
      .getElementById("productDetailsModalTitle")
      .textContent.split(": ")[1];
    $("#productDetailsModal").modal("show");
    showProductDetails(productId, productName);
  }
);

// Hàm thay đổi trạng thái chi tiết sản phẩm
function changeProductDetailStatus(id, newStatus) {
  $.ajax({
    url: `https://localhost:7060/api/ProductDetail/ChangeStatus/${id}?newStatus=${newStatus}`,
    method: "PUT",
    contentType: "application/json",
    success: function (response) {
      console.log("Phản hồi từ server:", response);
      alert("Thay đổi trạng thái thành công!");

      // Refresh lại dữ liệu trong modal
      const productId = $("#productDetailsModal").data("productId");
      const productName = document
        .getElementById("productDetailsModalTitle")
        .textContent.split(": ")[1];
      showProductDetails(productId, productName);
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      console.error("Chi tiết lỗi:", xhr.responseText);
      alert("Không thể thay đổi trạng thái. Vui lòng thử lại!");
    },
  });
}

// Hàm sửa chi tiết sản phẩm
function editProductDetail(id) {
  // Ẩn modal chi tiết trước khi hiện modal edit
  $("#productDetailsModal").modal("hide");

  // Đợi modal chi tiết ẩn hoàn toàn rồi mới hiện modal edit
  $("#productDetailsModal").on("hidden.bs.modal", function () {
    Promise.all([
      $.ajax({
        url: "https://localhost:7060/api/Color/GetAll",
        method: "GET",
      }),
      $.ajax({
        url: "https://localhost:7060/api/Size/GetAll",
        method: "GET",
      }),
      $.ajax({
        url: `https://localhost:7060/api/ProductDetail/GetAll`,
        method: "GET",
      })
    ]).then(([colors, sizes, productDetails]) => {
      const detail = productDetails.find((d) => d.id === id);
      if (!detail) {
        alert("Không tìm thấy chi tiết sản phẩm!");
        return;
      }

      console.log("Chi tiết sản phẩm được tìm thấy:", detail);

      // Điền dữ liệu vào form
      document.getElementById("editProductDetailId").value = detail.id;
      document.getElementById("editProductId").value = detail.productId;
      document.getElementById("editProductDetailName").value = detail.name || "";
      document.getElementById("editProductDetailCode").value = detail.code || "";
      document.getElementById("editPrice").value = detail.price || 0;

      // Điền dữ liệu cho combobox màu sắc
      const colorSelect = document.getElementById("editColorId");
      colorSelect.innerHTML = '<option value="">Chọn màu sắc</option>';
      colors.forEach((color) => {
        colorSelect.innerHTML += `<option value="${color.id}" ${
          color.id === detail.colorId ? "selected" : ""
        }>${color.colorName}</option>`;
      });

      // Điền dữ liệu cho combobox kích thước
      const sizeSelect = document.getElementById("editSizeId");
      sizeSelect.innerHTML = '<option value="">Chọn kích thước</option>';
      sizes.forEach((size) => {
        sizeSelect.innerHTML += `<option value="${size.id}" ${
          size.id === detail.sizeId ? "selected" : ""
        }>${size.sizeCode}</option>`;
      });

      // Hiển thị modal chỉnh sửa
      $("#editProductDetailModal").modal("show");
    }).catch(error => {
      console.error("Lỗi khi lấy dữ liệu:", error);
      alert("Không thể lấy dữ liệu. Vui lòng thử lại sau.");
    });

    // Xóa event listener để tránh gọi nhiều lần
    $(this).off("hidden.bs.modal");
  });
}

// Thêm event listener cho form thêm chi tiết sản phẩm
document.addEventListener("DOMContentLoaded", function() {
  const addProductDetailForm = document.getElementById("addProductDetailForm");
  if (addProductDetailForm) {
    addProductDetailForm.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const formData = {
        productId: parseInt(document.getElementById("productId").value),
        name: document.getElementById("productDetailName").value,
        code: generateProductDetailCode(),
        price: parseFloat(document.getElementById("price").value),
        sizeId: parseInt(document.getElementById("sizeId").value),
        colorId: parseInt(document.getElementById("colorId").value),
        status: "Available",
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
        createdBy: "Admin",
        updateBy: "Admin"
      };

      if (!formData.productId || !formData.name || !formData.sizeId || !formData.colorId || isNaN(formData.price)) {
        alert("Vui lòng điền đầy đủ thông tin và đảm bảo giá hợp lệ!");
        return;
      }

      addProductDetail(formData);
    });
  }

  // Thêm event listener cho form sửa
  const editProductDetailForm = document.getElementById("editProductDetailForm");
  if (editProductDetailForm) {
    editProductDetailForm.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const formData = {
        id: parseInt(document.getElementById("editProductDetailId").value),
        productId: parseInt(document.getElementById("editProductId").value),
        name: document.getElementById("editProductDetailName").value,
        code: document.getElementById("editProductDetailCode").value,
        price: parseFloat(document.getElementById("editPrice").value),
        sizeId: parseInt(document.getElementById("editSizeId").value),
        colorId: parseInt(document.getElementById("editColorId").value),
        status: "Available",
        updateDate: new Date().toISOString(),
        updateBy: "Admin"
      };

      if (!formData.productId || !formData.name || !formData.sizeId || !formData.colorId || isNaN(formData.price)) {
        alert("Vui lòng điền đầy đủ thông tin và đảm bảo giá hợp lệ!");
        return;
      }

      updateProductDetail(formData);
    });
  }
});

// Thêm hàm cập nhật chi tiết sản phẩm
function updateProductDetail(data) {
  $.ajax({
    url: `https://localhost:7060/api/ProductDetail/Update/${data.id}`,
    method: "PUT",
    data: JSON.stringify(data),
    contentType: "application/json",
    success: function(response) {
      alert("Cập nhật chi tiết sản phẩm thành công!");
      $("#editProductDetailModal").modal("hide");
      
      // Đợi modal sửa ẩn hoàn toàn
      $("#editProductDetailModal").on("hidden.bs.modal", function() {
        // Hiện lại modal chi tiết và refresh data
        const productId = $("#productDetailsModal").data("productId");
        const productName = document.getElementById("productDetailsModalTitle").textContent.split(": ")[1];
        $("#productDetailsModal").modal("show");
        showProductDetails(productId, productName);
        // Xóa event listener
        $(this).off("hidden.bs.modal");
      });
    },
    error: function(xhr, status, error) {
      console.error("Lỗi khi cập nhật chi tiết sản phẩm:", error);
      console.error("Chi tiết lỗi:", xhr.responseText);
      alert("Không thể cập nhật chi tiết sản phẩm. Vui lòng thử lại sau.");
    }
  });
}

// Hàm tạo mã chi tiết sản phẩm tự động
function generateProductDetailCode() {
  return 'PD' + Date.now().toString().slice(-6);
}

// Tải danh sách sản phẩm khi trang được load
document.addEventListener("DOMContentLoaded", function () {
  initializeCloudinaryWidgets();
  initializeEventListeners();
  loadInitialData();
});

// Kiểm tra quyền truy cập
function checkAccess() {
  const userRole = localStorage.getItem("userRole");
  if (!userRole || userRole !== "Employee") {
    alert("Bạn không có quyền truy cập trang này!");
    window.location.href = "../login.html";
  }
}

// Kiểm tra định kỳ
setInterval(checkAccess, 5000);
    