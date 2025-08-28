const express = require("express");
const app = express();
const invoicesRoutes = require("./routes/invoices");

app.use(express.json()); // For parsing application/json
app.use("/api/invoices", invoicesRoutes); // Mount invoice routes at /api/invoices

// 404 handler for routes not found
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  return next(err);
});

// Generic error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  return res.json({ 
    error: err,
    message: err.message
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});