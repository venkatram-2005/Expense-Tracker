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
    if (category !== undefined) {
      if (typeof category !== 'string' || !category.trim()) throw new AppError('category query parameter cannot be empty', 400);
      if (category.trim().length > 100) throw new AppError('category query parameter must not exceed 100 characters', 400);
    }
    return this.repository.findAll(category?.trim());
  }

  getTotal(category) {
    const expenses = this.getExpenses(category);
    return {
      category: category?.trim() || null,
      total: expenses.reduce((sum, expense) => sum + Math.round(expense.amount * 100), 0) / 100,
      count: expenses.length
    };
  }

  deleteExpense(id) {
    if (!this.repository.findById(id)) throw new AppError('Expense not found', 404);
    this.repository.delete(id);
  }
}

module.exports = { ExpenseService };
