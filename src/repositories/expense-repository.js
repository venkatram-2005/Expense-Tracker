class ExpenseRepository {
  constructor() {
    this.expenses = new Map();
  }

  create(expense) {
    this.expenses.set(expense.id, expense);
    return expense;
  }

  findAll(category) {
    const expenses = Array.from(this.expenses.values());
    return category ? expenses.filter((expense) => expense.category === category) : expenses;
  }

  findById(id) {
    return this.expenses.get(id);
  }

  delete(id) {
    return this.expenses.delete(id);
  }
}

module.exports = { ExpenseRepository };
