const getAllBrands = 'https://localhost:7060/api/Brand/GetAll'
const getAllEmpolye = 'https://localhost:7060/api/Employee/GetAll'
const getAllProductDetail = 'https://localhost:7060/api/ProductDetail/GetAll'
const getAllProduct = 'https://localhost:7060/api/Product/GetAll'
const getProductImagesByDetailId = "https://localhost:7060/api/ProductImage/productDetailId/"
const getProductByCategoryId = "https://localhost:7060/api/Product/find-product-byCategoryId/"
const getProductByBrandId = "https://localhost:7060/api/Product/find-product-byBrandId/"

var id = 3;
var path = `https://localhost:7060/api/Product/find-product-byCategoryId/${id}`


const mergePath = (baseUrl, id) => {
    return baseUrl + id;
}


var x = mergePath(getProductImagesByDetailId, 3)