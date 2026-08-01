const { createApp } = require('./app');

const port = process.env.PORT || 3000;
createApp().listen(port, () => console.log(`Smart Expense Tracker API listening on port ${port}`));
