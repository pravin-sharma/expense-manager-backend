const router = require("express").Router();

const {
  addExpense,
  deleteExpense,
  getAllExpenses,
  getAllExpensesByCategory,
  getOneExpense,
  updateExpense,
  getAll,
} = require("../controller/expenseController");
const { isAuth } = require("../middleware/isAuth");

//new getAll api with period and category filter
router.get("/expense", isAuth, getAll);
router.post("/expense/add", isAuth, addExpense);
router.get("/expense/get/:id", isAuth, getOneExpense);
router.put("/expense/update/:id", isAuth, updateExpense);
router.delete("/expense/delete/:id", isAuth, deleteExpense);

module.exports = router;
