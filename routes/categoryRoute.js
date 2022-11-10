const router = require("express").Router();

const {isAuth} = require('../middleware/isAuth')
const {
  addCategory,
  deleteCategory,
  getAllCategories,
  getOneCategory,
  updateCategory,
} = require("../controller/categoryController");

router.post('/category/add', isAuth, addCategory);
router.delete('/category/delete/:id', isAuth, deleteCategory);
router.get('/category/get/:id', isAuth, getOneCategory);
router.get('/category/getAll', isAuth, getAllCategories);
router.put('/category/update/:id', isAuth, updateCategory);

module.exports = router;