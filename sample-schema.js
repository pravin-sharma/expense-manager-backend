const userSchema = [
  {
    _id: 10,
    name: "Pravin",
    email: "p@s.com",
    password: "hjbdvbsjkbebvkejwbvkjb@###$$%sdsdf",
    createdAt: Date,
    updatedAt: Date,
  },
];

const categorySchema = [
  {
    _id: h11,
    isDefault: false,
    userId: 10,
    categoryName: Health,
    budget: 10000,
    budgetStartDate: 28 - 10 - 2022,
    budgetEndDate: 31 - 10 - 2022,
    expenseTotal: 1000,
    createdAt: Date,
    updatedAt: Date,
  },
];

const expenseSchema = [
  { 
    _id: c20,
    categoryId: h11,
    item: "meds",
    cost: 1000,
    expenseDate: 31 - 10 - 2022,
    createdAt: Date,
    updatedAt: Date,
  },
];
