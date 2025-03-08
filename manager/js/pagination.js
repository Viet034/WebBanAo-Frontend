// Các biến phân trang
let currentPage = 1;
let itemsPerPage = 10;
let totalItems = 0;

// Hàm render phân trang
function renderPagination(totalPages, containerId = 'pagination', onPageChange) {
    const pagination = document.getElementById(containerId);
    if (!pagination) return;

    let paginationHTML = '';
    
    // Nút Previous
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="handlePageChange(${currentPage - 1}, '${containerId}', ${onPageChange})">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;

    // Các nút số trang
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || // Trang đầu
            i === totalPages || // Trang cuối
            (i >= currentPage - 1 && i <= currentPage + 1) // Các trang xung quanh trang hiện tại
        ) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="handlePageChange(${i}, '${containerId}', ${onPageChange})">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `
                <li class="page-item disabled">
                    <a class="page-link" href="#">...</a>
                </li>
            `;
        }
    }

    // Nút Next
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="handlePageChange(${currentPage + 1}, '${containerId}', ${onPageChange})">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;

    pagination.innerHTML = paginationHTML;
}

// Hàm xử lý chuyển trang
function handlePageChange(page, containerId, callback) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    if (typeof callback === 'function') {
        callback(currentPage);
    }
}

// Hàm thay đổi số item mỗi trang
function changeItemsPerPage(value, callback) {
    itemsPerPage = parseInt(value);
    currentPage = 1; // Reset về trang 1
    if (typeof callback === 'function') {
        callback();
    }
}

// Hàm phân trang dữ liệu
function paginateData(data, searchTerm = '', searchFields = []) {
    // Lọc dữ liệu nếu có searchTerm
    let filteredData = data;
    if (searchTerm) {
        searchTerm = searchTerm.toLowerCase();
        filteredData = data.filter(item => {
            return searchFields.some(field => {
                const fieldValue = item[field];
                return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm);
            });
        });
    }

    // Cập nhật tổng số items
    totalItems = filteredData.length;

    // Tính toán phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
        items: filteredData.slice(startIndex, endIndex),
        totalPages: Math.ceil(totalItems / itemsPerPage),
        totalItems: totalItems,
        currentPage: currentPage,
        itemsPerPage: itemsPerPage
    };
}

// Hàm tạo UI phân trang
function createPaginationUI(containerId = 'paginationContainer') {
    return `
        <div class="d-flex justify-content-between align-items-center mt-4">
            <div class="d-flex align-items-center gap-2">
                <label for="itemsPerPage" class="form-label mb-0">Số dòng mỗi trang:</label>
                <select id="itemsPerPage" class="form-select" style="width: auto;">
                    <option value="5">5</option>
                    <option value="10" selected>10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>
            <nav aria-label="Page navigation">
                <ul class="pagination mb-0" id="${containerId}">
                    <!-- Các nút phân trang sẽ được thêm vào đây -->
                </ul>
            </nav>
        </div>
    `;
}

// Export các hàm và biến để sử dụng
window.Pagination = {
    currentPage,
    itemsPerPage,
    totalItems,
    renderPagination,
    handlePageChange,
    changeItemsPerPage,
    paginateData,
    createPaginationUI
}; 