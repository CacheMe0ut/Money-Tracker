const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    // The user who owns this budget
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Budget = mongoose.model(
  "Budget",
  budgetSchema
);

module.exports = Budget;