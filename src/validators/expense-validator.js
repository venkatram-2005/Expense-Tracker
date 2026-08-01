const { AppError } = require('../errors/app-error');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidCalendarDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function validateExpenseInput(input) {
  const errors = [];
  if (typeof input.title !== 'string' || !input.title.trim()) errors.push('title must be a non-empty string');
  if (typeof input.amount !== 'number' || !Number.isFinite(input.amount) || input.amount <= 0) {
    errors.push('amount must be a positive number');
  }
  if (typeof input.category !== 'string' || !input.category.trim()) errors.push('category must be a non-empty string');
  if (typeof input.date !== 'string' || !isValidCalendarDate(input.date)) {
    errors.push('date must be a valid ISO date in YYYY-MM-DD format');
  }
  if (errors.length) throw new AppError('Validation failed', 400, errors);

  return {
    title: input.title.trim(),
    amount: input.amount,
    category: input.category.trim(),
    date: input.date
  };
}

module.exports = { validateExpenseInput };
