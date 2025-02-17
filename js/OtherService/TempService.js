/*
    Phương thức GET, truyền url vào tham số 
    và hàm callback để chuyển dữ liệu sau khi call API
*/
function get(url, callback){
    $.ajax({
        url: url, // Địa chỉ API  
        method: 'GET',  
        success: function(data) {  
            callback(null, data); // Gọi lại với data  
        },  
        error: function(xhr, status, error) {  
            callback(error); // Gọi lại với lỗi  
        } 
    });
}

/*
    Phương thức POST, truyền url, object vào tham số 
    và hàm callback để chuyển dữ liệu sau khi call API
*/
function post(url, dataInput, callback){
    $.ajax({
        url: url, // Địa chỉ API  
        data: dataInput,
        method: 'POST',  
        success: function(data) {    
            callback(null, data); // Gọi lại với data  
        },  
        error: function(xhr, status, error) {  
            callback(error); // Gọi lại với lỗi  
        } 
    });
}

/*
    Phương thức PUT, truyền url, object vào tham số 
    và hàm callback để chuyển dữ liệu sau khi call API
*/
function put(url, dataInput, callback){
    $.ajax({
        url: url, // Địa chỉ API  
        data: dataInput,
        method: 'PUT',  
        success: function(data) {  
            callback(null, data); // Gọi lại với data  
        },  
        error: function(xhr, status, error) {  
            callback(error); // Gọi lại với lỗi  
        } 
    });
}

/*
    Phương thức DELETE, truyền url vào tham số 
    và hàm callback để chuyển dữ liệu sau khi call API
*/
function remove(url, callback){
    $.ajax({
        url: url, // Địa chỉ API  
        method: 'DELETE',  
        success: function(data) {  
            callback(null, data); // Gọi lại với data  
        },  
        error: function(xhr, status, error) {  
            callback(error); // Gọi lại với lỗi  
        } 
    });
}