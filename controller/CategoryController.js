const Category = require('../models/CategoryModel')
const SubCategory = require('../models/SubCategory')

exports.AddCategory = async (req, res) => {
    const { category } = req.body;
    console.log("body in cate add meh", req.body);

    try {
        // console.log("categoryy", category);
        console.log("cate add method");

        if (!category) {
            return res.status(200).json({ error: "Category name is required", status: false })
        }

        // Check if the category already exists
        const existingCategory = await Category.findOne({ Category: category });

        if (existingCategory) {
            console.log("Category already exists", existingCategory);
            return res.status(200).json({ error: "Category already exists in the table", status: false });
        }

        // If the category does not exist, create a new one
        const newCategory = new Category({ Category: category });
        await newCategory.save();

        console.log("Category added", newCategory);
        res.status(200).json({ message: "Category added successfully", category: newCategory, status: true });
    } catch (error) {
        console.error("Error adding category", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const categories = await Category.find();

        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: "No categories found" });
        }

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        console.log("Updating category with data:", data);

        // Find the category by ID and update it with the new data
        const updatedCategory = await Category.findByIdAndUpdate(id, data.selectedCategory, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        console.log("Updated category:", updatedCategory);
        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        console.error("Error updating category", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.searchCategory = async (req, res) => {
    try {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return res.status(400).json({ message: "Search term is required" });
        }

        const categories = await Category.find({
            Category: { $regex: searchTerm, $options: 'i' }  // Case-insensitive search
        });

        if (categories.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories", error);
        res.status(500).json({ message: "Server error" });
    }
};

// exports.deleteCategory = async (req, res) => {
//     try {
//         const id = req.params.id;
//         console.log("id--------------",id);

//         const result =await Category.findByIdAndDelete(id);

//         if (result) {
//             console.log("Category deleted successfull")
//             res.status(200).json({ message: "Category deleted successfully" });
//         } else {
//             console.log("category not deltetd");
//             res.status(404).json({ message: "Category not found" });
//         }
//     } catch (err) {
//         console.error("Error deleting category:", err);
//         res.status(500).json({ message: "Error deleting category", error: err });
//     }


// }


exports.deleteCategory = async (req, res) => {
    try {
        const {id} = req.params;
        
        const result = await Category.findByIdAndDelete(id);

        if (result) {
            res.status(200).json({ message: "Category deleted successfully" });
        } else {
            console.log("Category not found");
            res.status(404).json({ message: "Category not found" });
        }
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ message: "Error deleting category", error: err });
    }
};


//sub category

exports.addSubCategory = async (req, res) => {
    const { selectedCategory, selectedSubCategory } = req.body;
    
    // console.log('body', req.body);
    // console.log("cate", selectedCategory);
    // console.log('sub', selectedSubCategory);
    const categoryId = selectedCategory;
    const subCategory = selectedSubCategory;

    try {
        const existingSubCategory = await SubCategory.findOne({ categoryId, subCategory });

        if (existingSubCategory) {
            return res.status(200).json({ error: 'Subcategory already exists for this category',status:false });
        }

        // If not, create a new subcategory
        const newSubCategory = new SubCategory({ categoryId, subCategory });
        await newSubCategory.save();

        res.status(200).json({ message: 'Subcategory added successfully', subcategory: newSubCategory,status:true });
    } catch (error) {
        console.error('Error adding subcategory:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSubCategory = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate('categoryId');

        if (!subCategories || subCategories.length === 0) {
            return res.status(404).json({ message: "No subcategories found" });
        }

        res.status(200).json(subCategories);
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateSubCategory = async (req, res) => {
    try {
        const { selectedCategoryId, selectedSubCategory } = req.body;
        const { id } = req.params;
        console.log('body', req.body);
        console.log("cate", selectedCategoryId);
        console.log('sub', selectedSubCategory);

        const subCategory = await SubCategory.findById(id)

        if (!subCategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        const categoryExists = await Category.findById(selectedCategoryId);

        if (!categoryExists) {
            return res.status(400).json({ message: 'Category does not exist' });
        }

        // Update the subcategory
        subCategory.categoryId = selectedCategoryId;
        subCategory.subCategory = selectedSubCategory;

        // Save the updated subcategory
        const updatedSubCategory = await subCategory.save();

        res.status(200).json({ message: 'Subcategory updated successfully', subcategory: updatedSubCategory });

        // console.log("selectedCategory",selectedCategory)
        // console.log('selectedSubCategory',selectedSubCategory)
        // console.log("id",id)
    } catch (error) {
        console.error('Error updating subcategory:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteSubCategory= async(req,res)=>{
    try {
        const {id} = req.params;
        
        const result = await SubCategory.findByIdAndDelete(id);

        if (result) {
            res.status(200).json({ message: "Category deleted successfully" });
        } else {
            console.log("Category not found");
            res.status(404).json({ message: "Category not found" });
        }
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ message: "Error deleting category", error: err });
    }
}



