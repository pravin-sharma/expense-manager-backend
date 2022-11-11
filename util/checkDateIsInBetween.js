const moment = require('moment')

function checkExpenseDateIsBetween(expense, category) {
    let expenseDate = expense.expenseDate;
    let budgetStartDate = category.budgetStartDate;
    let budgetEndDate = category.budgetEndDate;

    // formating date to moment string
    let expenseDateFormat = moment(new Date(expenseDate)).format(
      "yyyy-MM-DD"
    );
    let budgetStartDateFormat = moment(new Date(budgetStartDate)).format(
      "yyyy-MM-DD"
    );
    let budgetEndDateFormat = moment(new Date(budgetEndDate)).format(
      "yyyy-MM-DD"
    );

    // getting Moment for each moment string
    let expenseDateMoment = moment(expenseDateFormat, "yyyy-MM-DD");
    let budgetStartDateMoment = moment(budgetStartDateFormat, "yyyy-MM-DD");
    let budgetEndDateMoment = moment(budgetEndDateFormat, "yyyy-MM-DD");

    return expenseDateMoment.isBetween(
      budgetStartDateMoment,
      budgetEndDateMoment,
      null,
      []
    );
  }

module.exports = checkExpenseDateIsBetween;