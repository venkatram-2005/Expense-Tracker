function createExpenseController(service) {
  return {
    create: (req) => ({ data: service.addExpense(req.body) }),
    list: (req) => ({ data: service.getExpenses(req.query.category) }),
    total: (req) => ({ data: service.getTotal(req.query.category) }),
    remove: (req) => {
      service.deleteExpense(req.params.id);
    }
  };
}

module.exports = { createExpenseController };
