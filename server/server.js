const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config({
  path: __dirname + "/.env",
});

// =====================================================
// MODELS
// =====================================================

const Transaction = require("./models/Transaction");
const Budget = require("./models/budget");

// =====================================================
// AUTH ROUTES
// =====================================================

const authRoutes = require("./routes/auth");

// =====================================================
// APP
// =====================================================

const app = express();

// Render provides PORT automatically.
// Local computer will use 5000.
const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// =====================================================
// ENVIRONMENT CHECK
// =====================================================

console.log(
  "JWT_SECRET loaded:",
  !!process.env.JWT_SECRET
);

console.log(
  "MONGO_URI loaded:",
  !!process.env.MONGO_URI
);

// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// JWT AUTHENTICATION
// =====================================================

function authenticateToken(
  req,
  res,
  next
) {
  try {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message:
          "Authentication required.",
      });
    }

    const parts =
      authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer"
    ) {
      return res.status(401).json({
        message:
          "Invalid authorization format.",
      });
    }

    const token = parts[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.userId =
      decoded.userId;

    next();
  } catch (error) {
    console.error(
      "JWT ERROR:",
      error.message
    );

    return res.status(401).json({
      message:
        "Invalid or expired token.",
    });
  }
}

// =====================================================
// MONGODB
// =====================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB connected successfully!"
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });

// =====================================================
// HOME / HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "MoneyTrack backend is running!",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message:
      "MoneyTrack API is healthy.",
  });
});

// =====================================================
// TRANSACTIONS
// =====================================================

// GET ALL TRANSACTIONS

app.get(
  "/api/transactions",
  authenticateToken,
  async (req, res) => {
    try {
      const transactions =
        await Transaction.find({
          userId: req.userId,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json(
        transactions
      );
    } catch (error) {
      console.error(
        "GET TRANSACTIONS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to get transactions.",
      });
    }
  }
);

// ADD TRANSACTION

app.post(
  "/api/transactions",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        title,
        amount,
        type,
        category,
      } = req.body;

      if (
        !title ||
        amount === undefined ||
        !type ||
        !category
      ) {
        return res.status(400).json({
          message:
            "Title, amount, type and category are required.",
        });
      }

      const numericAmount =
        Number(amount);

      if (
        Number.isNaN(
          numericAmount
        ) ||
        numericAmount < 0
      ) {
        return res.status(400).json({
          message:
            "Amount must be a valid positive number.",
        });
      }

      if (
        type !== "income" &&
        type !== "expense"
      ) {
        return res.status(400).json({
          message:
            "Transaction type must be income or expense.",
        });
      }

      const transaction =
        new Transaction({
          title:
            title.trim(),

          amount:
            numericAmount,

          type,

          category:
            category.trim(),

          userId:
            req.userId,
        });

      const savedTransaction =
        await transaction.save();

      res.status(201).json(
        savedTransaction
      );
    } catch (error) {
      console.error(
        "ADD TRANSACTION ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to add transaction.",
      });
    }
  }
);

// DELETE TRANSACTION

app.delete(
  "/api/transactions/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const transaction =
        await Transaction.findOne({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!transaction) {
        return res.status(404).json({
          message:
            "Transaction not found.",
        });
      }

      await Transaction.deleteOne({
        _id: req.params.id,
        userId: req.userId,
      });

      res.status(200).json({
        message:
          "Transaction deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE TRANSACTION ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete transaction.",
      });
    }
  }
);

// =====================================================
// BUDGETS
// =====================================================

// GET ALL BUDGETS

app.get(
  "/api/budgets",
  authenticateToken,
  async (req, res) => {
    try {
      const budgets =
        await Budget.find({
          userId: req.userId,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json(
        budgets
      );
    } catch (error) {
      console.error(
        "GET BUDGETS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to get budgets.",
      });
    }
  }
);

// CREATE BUDGET

app.post(
  "/api/budgets",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        category,
        amount,
      } = req.body;

      if (
        !category ||
        amount === undefined
      ) {
        return res.status(400).json({
          message:
            "Category and amount are required.",
        });
      }

      const numericAmount =
        Number(amount);

      if (
        Number.isNaN(
          numericAmount
        ) ||
        numericAmount < 0
      ) {
        return res.status(400).json({
          message:
            "Budget amount must be a valid positive number.",
        });
      }

      const cleanCategory =
        category.trim();

      const existingBudget =
        await Budget.findOne({
          category:
            cleanCategory,
          userId:
            req.userId,
        });

      if (existingBudget) {
        return res.status(409).json({
          message:
            "A budget for this category already exists.",
        });
      }

      const budget =
        new Budget({
          category:
            cleanCategory,

          amount:
            numericAmount,

          userId:
            req.userId,
        });

      const savedBudget =
        await budget.save();

      res.status(201).json(
        savedBudget
      );
    } catch (error) {
      console.error(
        "CREATE BUDGET ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create budget.",
      });
    }
  }
);

// DELETE BUDGET

app.delete(
  "/api/budgets/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const budget =
        await Budget.findOne({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!budget) {
        return res.status(404).json({
          message:
            "Budget not found.",
        });
      }

      await Budget.deleteOne({
        _id: req.params.id,
        userId: req.userId,
      });

      res.status(200).json({
        message:
          "Budget deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE BUDGET ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete budget.",
      });
    }
  }
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use(
  (req, res) => {
    res.status(404).json({
      message:
        "API route not found.",
    });
  }
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error.",
    });
  }
);

// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `MoneyTrack server running on port ${PORT}`
    );
  }
);