document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các elements
    const fileInput = document.getElementById('file-input');
    const profileImg = document.getElementById('profile-img');
    const saveButton = document.getElementById('saveProfile');
    
    // Xử lý upload ảnh
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImg.src = e.target.result;
                // Lưu ảnh vào localStorage
                localStorage.setItem('profileImage', e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });
    
    // Tải ảnh từ localStorage nếu có
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
        profileImg.src = savedImage;
    }
    
    // Xử lý lưu thông tin
    saveButton.addEventListener('click', function() {
        const profileData = {
            fullName: document.getElementById('fullName').value,
            age: document.getElementById('age').value,
            dob: document.getElementById('dob').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            bio: document.getElementById('bio').value
        };
        
        // Lưu vào localStorage
        localStorage.setItem('profileData', JSON.stringify(profileData));
        
        // Hiển thị thông báo
        alert('Đã lưu thông tin thành công!');
    });
    
    // Tải thông tin từ localStorage nếu có
    const savedData = localStorage.getItem('profileData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('fullName').value = data.fullName || '';
        document.getElementById('age').value = data.age || '';
        document.getElementById('dob').value = data.dob || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('phone').value = data.phone || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('bio').value = data.bio || '';
    }
    
    // Validate form
    function validateForm() {
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Email không hợp lệ!');
            return false;
        }
        
        // Validate phone
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(phone)) {
            alert('Số điện thoại không hợp lệ!');
            return false;
        }
        
        return true;
    }
    
    // Thêm validate trước khi lưu
    saveButton.addEventListener('click', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            return false;
        }
    });
}); 