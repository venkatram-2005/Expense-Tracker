const { randomUUID } = require('node:crypto');
const { AppError } = require('../errors/app-error');
const { validateExpenseInput } = require('../validators/expense-validator');

class ExpenseService {
  constructor(repository) {
    this.repository = repository;
  }

  addExpense(input) {
    const fields = validateExpenseInput(input);
    return this.repository.create({ id: randomUUID(), ...fields });
  }

  getExpenses(category) {
    if (category !== undefined && (!category.trim())) {
      throw new AppError('category query parameter cannot be empty', 400);
    }
    return this.repository.findAll(category?.trim());
  }

  getTotal(category) {
    const expenses = this.getExpenses(category);
    return {
      category: category?.trim() || null,
      total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      count: expenses.length
    };
  }

  deleteExpense(id) {
    if (!this.repository.findById(id)) throw new AppError('Expense not found', 404);
    this.repository.delete(id);
  }
}

module.exports = { ExpenseService };
