const router = require("express").Router();

const {
  addExpense,
  deleteExpense,
  getAllExpenses,
  getAllExpensesByCategory,
  getOneExpense,
  updateExpense,
} = require("../controller/expenseController");
const { isAuth } = require("../middleware/isAuth");

router.post("/expense/add", isAuth, addExpense);
router.get("/expense/get/:id", isAuth, getOneExpense);
router.get("/expense/getAll", isAuth, getAllExpenses);
router.get("/expense/getAllByCategory", isAuth, getAllExpensesByCategory);
router.put("/expense/update/:id", isAuth, updateExpense);
router.delete("/expense/delete/:id", isAuth, deleteExpense);

module.exports = router;
