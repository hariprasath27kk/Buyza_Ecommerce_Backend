const express = require('express');
const router = express.Router();
const ProductController = require('../controller/ProductController');
// const multer = require('multer');
// const path = require('path');
const verifyToken = require('../middleware/AuthMiddleware');
const { upload } = require('../middleware/Multer');

// Multer configuration
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./uploads");
//     },

//     filename: (req, file, cb) => {
//         random = Date.now();
//         cb(null, random + path.extname(file.originalname));
//       },
// });

// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 1000000 }, // 1MB limit
//     fileFilter: function (req, file, cb) {
//         checkFileType(file, cb);
//     }
// }).single('file');

// function checkFileType(file, cb) {
//     const filetypes = /jpeg|jpg|png|gif|webp/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//         return cb(null, true);
//     } else {
//         cb('Error: Images Only!');
//     }
// }

 

router.post('/setproducts', upload, ProductController.setProducts);
router.get('/getallproducts', ProductController.getAllProducts);
router.put('/update/:id',verifyToken,upload,ProductController.updateProduct);
router.get('/getproducts/:category', ProductController.getbyCategory);
router.get('/getproducts/:category/:subcategory', ProductController.getbySubCategoryinCategory);
router.get('/search/:searchTerm', ProductController.getProductsByName);
router.delete('/delete/:id',ProductController.deleteproduct)
router.get('/product/:id',ProductController.viewproduct)






module.exports = router;
