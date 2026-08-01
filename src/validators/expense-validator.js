const { AppError } = require('../errors/app-error');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_FIELDS = new Set(['title', 'amount', 'category', 'date']);
const MAX_TITLE_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 100;

function isValidCalendarDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function validateExpenseInput(input) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError('Validation failed', 400, ['request body must be a JSON object']);
  }
  const unknownFields = Object.keys(input).filter((field) => !ALLOWED_FIELDS.has(field));
  if (unknownFields.length) errors.push(`unknown field(s): ${unknownFields.join(', ')}`);

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title) errors.push('title must be a non-empty string');
  else if (title.length > MAX_TITLE_LENGTH) errors.push(`title must not exceed ${MAX_TITLE_LENGTH} characters`);

  const amountInCents = typeof input.amount === 'number' ? input.amount * 100 : NaN;
  if (!Number.isFinite(input.amount) || input.amount <= 0 || !Number.isSafeInteger(amountInCents)) {
    errors.push('amount must be a positive number with at most 2 decimal places');
  }

  const category = typeof input.category === 'string' ? input.category.trim() : '';
  if (!category) errors.push('category must be a non-empty string');
  else if (category.length > MAX_CATEGORY_LENGTH) errors.push(`category must not exceed ${MAX_CATEGORY_LENGTH} characters`);

  if (typeof input.date !== 'string' || !isValidCalendarDate(input.date)) {
    errors.push('date must be a valid ISO date in YYYY-MM-DD format');
  }
  if (errors.length) throw new AppError('Validation failed', 400, errors);

  return {
    title,
    amount: amountInCents / 100,
    category,
    date: input.date
  };
}

module.exports = { validateExpenseInput };
