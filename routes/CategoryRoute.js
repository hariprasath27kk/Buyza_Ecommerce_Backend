const express = require('express');
const CategoryController = require('../controller/CategoryController');
const verifyToken = require('../middleware/AuthMiddleware');

const router = express.Router();


router.post('/category',CategoryController.AddCategory)
router.get('/category',CategoryController.getCategory)
router.put('/category/update/:id',verifyToken,CategoryController.updateCategory)
router.delete('/category/delete/:id',CategoryController.deleteCategory)

router.post('/subcategory',CategoryController.addSubCategory)
router.get('/subcategory',CategoryController.getSubCategory)
router.put('/subcategory/update/:id',CategoryController.updateSubCategory)
router.delete('/subcategory/delete/:id',CategoryController.deleteSubCategory);

router.get('/category/search',CategoryController.searchCategory)

module.exports = router;