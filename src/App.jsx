import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  // =====================================================
  // AUTH
  // =====================================================

  const [token, setToken] = useState(
    localStorage.getItem("moneytrack_token")
  );

  const [user, setUser] = useState(() => {
    const saved =
      localStorage.getItem("moneytrack_user");

    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] =
    useState("login");

  const [authLoading, setAuthLoading] =
    useState(false);

  const [authError, setAuthError] =
    useState("");

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // =====================================================
  // PAGE
  // =====================================================

  const [currentPage, setCurrentPage] =
    useState("dashboard");

  // =====================================================
  // TRANSACTIONS
  // =====================================================

  const [transactions, setTransactions] =
    useState([]);

  const [loadingTransactions, setLoadingTransactions] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
  });

  // =====================================================
  // BUDGETS
  // =====================================================

  const [budgets, setBudgets] =
    useState([]);

  const [loadingBudgets, setLoadingBudgets] =
    useState(false);

  const [showBudgetForm, setShowBudgetForm] =
    useState(false);

  const [budgetForm, setBudgetForm] =
    useState({
      category: "Food",
      amount: "",
    });

  // =====================================================
  // SETTINGS
  // =====================================================

  const [currency, setCurrency] =
    useState("INR");

  const [notifications, setNotifications] =
    useState(true);

  const [budgetAlerts, setBudgetAlerts] =
    useState(true);

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const getAuthHeaders = () => {
    const savedToken =
      localStorage.getItem(
        "moneytrack_token"
      );

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${savedToken}`,
    };
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (event) => {
    event.preventDefault();

    setAuthError("");

    if (
      !authData.email ||
      !authData.password
    ) {
      setAuthError(
        "Please enter email and password."
      );
      return;
    }

    try {
      setAuthLoading(true);

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email:
              authData.email.trim(),
            password:
              authData.password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Login failed."
        );
      }

      localStorage.setItem(
        "moneytrack_token",
        data.token
      );

      localStorage.setItem(
        "moneytrack_user",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setUser(data.user);

      setAuthData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setAuthError("");
      setCurrentPage("dashboard");
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setAuthError(
        error.message ||
          "Login failed."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const register = async (event) => {
    event.preventDefault();

    setAuthError("");

    if (
      !authData.name ||
      !authData.email ||
      !authData.password ||
      !authData.confirmPassword
    ) {
      setAuthError(
        "Please fill all fields."
      );
      return;
    }

    if (
      authData.password.length < 6
    ) {
      setAuthError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      authData.password !==
      authData.confirmPassword
    ) {
      setAuthError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setAuthLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name:
              authData.name.trim(),
            email:
              authData.email.trim(),
            password:
              authData.password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Registration failed."
        );
      }

      localStorage.setItem(
        "moneytrack_token",
        data.token
      );

      localStorage.setItem(
        "moneytrack_user",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setUser(data.user);

      setAuthData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setAuthError("");
      setCurrentPage("dashboard");
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      setAuthError(
        error.message ||
          "Registration failed."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem(
      "moneytrack_token"
    );

    localStorage.removeItem(
      "moneytrack_user"
    );

    setToken(null);
    setUser(null);

    setTransactions([]);
    setBudgets([]);

    setAuthMode("login");

    setAuthData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  // =====================================================
  // TRANSACTIONS
  // =====================================================

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);

      const response = await fetch(
        `${API_URL}/transactions`,
        {
          headers:
            getAuthHeaders(),
        }
      );

      if (
        response.status === 401
      ) {
        logout();
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load transactions."
        );
      }

      const formatted =
        data.map(
          (transaction) => ({
            id: transaction._id,
            title:
              transaction.title,
            amount:
              Number(
                transaction.amount
              ),
            type:
              transaction.type,
            category:
              transaction.category,
            date:
              transaction.createdAt
                ? new Date(
                    transaction.createdAt
                  ).toLocaleDateString()
                : "",
          })
        );

      setTransactions(
        formatted
      );
    } catch (error) {
      console.error(
        "TRANSACTIONS ERROR:",
        error
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  const addTransaction = async (
    event
  ) => {
    event.preventDefault();

    if (
      !formData.title ||
      !formData.amount
    ) {
      alert(
        "Please enter title and amount."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/transactions`,
        {
          method: "POST",
          headers:
            getAuthHeaders(),
          body: JSON.stringify({
            title:
              formData.title,
            amount:
              Number(
                formData.amount
              ),
            type:
              formData.type,
            category:
              formData.category,
          }),
        }
      );

      if (
        response.status === 401
      ) {
        logout();
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add transaction."
        );
      }

      setTransactions(
        (previous) => [
          {
            id: data._id,
            title: data.title,
            amount:
              Number(
                data.amount
              ),
            type: data.type,
            category:
              data.category,
            date:
              data.createdAt
                ? new Date(
                    data.createdAt
                  ).toLocaleDateString()
                : "",
          },
          ...previous,
        ]
      );

      setFormData({
        title: "",
        amount: "",
        type: "expense",
        category: "Food",
      });

      setShowForm(false);
    } catch (error) {
      alert(
        error.message ||
          "Could not add transaction."
      );
    }
  };

  const deleteTransaction = async (
    id
  ) => {
    if (
      !window.confirm(
        "Delete this transaction?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/transactions/${id}`,
        {
          method: "DELETE",
          headers:
            getAuthHeaders(),
        }
      );

      if (
        response.status === 401
      ) {
        logout();
        return;
      }

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.message ||
            "Failed to delete transaction."
        );
      }

      setTransactions(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== id
          )
      );
    } catch (error) {
      alert(
        error.message ||
          "Could not delete transaction."
      );
    }
  };

  // =====================================================
  // BUDGETS
  // =====================================================

  const fetchBudgets = async () => {
    try {
      setLoadingBudgets(true);

      const response = await fetch(
        `${API_URL}/budgets`,
        {
          headers:
            getAuthHeaders(),
        }
      );

      if (
        response.status === 401
      ) {
        logout();
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load budgets."
        );
      }

      setBudgets(
        data.map(
          (budget) => ({
            id: budget._id,
            category:
              budget.category,
            amount:
              Number(
                budget.amount
              ),
          })
        )
      );
    } catch (error) {
      console.error(
        "BUDGET ERROR:",
        error
      );
    } finally {
      setLoadingBudgets(false);
    }
  };

  const addBudget = async (
    event
  ) => {
    event.preventDefault();

    if (!budgetForm.amount) {
      alert(
        "Please enter a budget amount."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/budgets`,
        {
          method: "POST",
          headers:
            getAuthHeaders(),
          body: JSON.stringify({
            category:
              budgetForm.category,
            amount:
              Number(
                budgetForm.amount
              ),
          }),
        }
      );

      if (
        response.status === 401
      ) {
        logout();
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create budget."
        );
      }

      setBudgets(
        (previous) => [
          ...previous,
          {
            id: data._id,
            category:
              data.category,
            amount:
              Number(
                data.amount
              ),
          },
        ]
      );

      setBudgetForm({
        category: "Food",
        amount: "",
      });

      setShowBudgetForm(false);
    } catch (error) {
      alert(
        error.message ||
          "Could not create budget."
      );
    }
  };

  const deleteBudget = async (
    id
  ) => {
    if (
      !window.confirm(
        "Delete this budget?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/budgets/${id}`,
        {
          method: "DELETE",
          headers:
            getAuthHeaders(),
        }
      );

      if (
        response.status === 401
      ) {
        logout();
        return;
      }

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.message ||
            "Failed to delete budget."
        );
      }

      setBudgets(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== id
          )
      );
    } catch (error) {
      alert(
        error.message ||
          "Could not delete budget."
      );
    }
  };

  // =====================================================
  // LOAD DATA AFTER LOGIN
  // =====================================================

  useEffect(() => {
    if (token) {
      fetchTransactions();
      fetchBudgets();
    }
  }, [token]);

  // =====================================================
  // MONEY
  // =====================================================

  const formatMoney = (
    amount
  ) => {
    if (currency === "USD") {
      return `$${Number(
        amount
      ).toLocaleString(
        "en-US"
      )}`;
    }

    if (currency === "EUR") {
      return `€${Number(
        amount
      ).toLocaleString(
        "en-US"
      )}`;
    }

    if (currency === "GBP") {
      return `£${Number(
        amount
      ).toLocaleString(
        "en-GB"
      )}`;
    }

    return `₹${Number(
      amount
    ).toLocaleString(
      "en-IN"
    )}`;
  };

  // =====================================================
  // TOTALS
  // =====================================================

  const totalIncome =
    transactions
      .filter(
        (item) =>
          item.type ===
          "income"
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.amount
          ),
        0
      );

  const totalExpenses =
    transactions
      .filter(
        (item) =>
          item.type ===
          "expense"
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.amount
          ),
        0
      );

  const totalBalance =
    totalIncome -
    totalExpenses;

  const getCategorySpent = (
    category
  ) => {
    return transactions
      .filter(
        (item) =>
          item.type ===
            "expense" &&
          item.category ===
            category
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.amount
          ),
        0
      );
  };

  const totalBudget =
    budgets.reduce(
      (total, item) =>
        total +
        Number(item.amount),
      0
    );

  const totalBudgetSpent =
    budgets.reduce(
      (total, item) =>
        total +
        getCategorySpent(
          item.category
        ),
      0
    );

  const totalBudgetRemaining =
    totalBudget -
    totalBudgetSpent;

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: "💳",
    },
    {
      id: "budgets",
      label: "Budgets",
      icon: "🎯",
    },
    {
      id: "reports",
      label: "Reports",
      icon: "📈",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
    },
  ];

  // =====================================================
  // LOGIN / REGISTER SCREEN
  // =====================================================

  if (!token) {
    return (
      <div
        style={{
          minHeight:
            "100vh",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          background:
            "#f4f7fb",
          padding:
            "20px",
        }}
      >
        <div
          style={{
            width:
              "100%",
            maxWidth:
              "430px",
            background:
              "white",
            padding:
              "35px",
            borderRadius:
              "18px",
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              textAlign:
                "center",
              marginBottom:
                "25px",
            }}
          >
            <h1>
              MoneyTrack
            </h1>

            <p>
              Personal Finance Manager
            </p>
          </div>

          <div
            style={{
              display:
                "flex",
              gap:
                "8px",
              marginBottom:
                "25px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode(
                  "login"
                );
                setAuthError("");
              }}
              style={{
                flex: 1,
                padding:
                  "12px",
                border:
                  "none",
                borderRadius:
                  "8px",
                background:
                  authMode ===
                  "login"
                    ? "#2563eb"
                    : "#e5e7eb",
                color:
                  authMode ===
                  "login"
                    ? "white"
                    : "#111",
              }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode(
                  "register"
                );
                setAuthError("");
              }}
              style={{
                flex: 1,
                padding:
                  "12px",
                border:
                  "none",
                borderRadius:
                  "8px",
                background:
                  authMode ===
                  "register"
                    ? "#2563eb"
                    : "#e5e7eb",
                color:
                  authMode ===
                  "register"
                    ? "white"
                    : "#111",
              }}
            >
              Register
            </button>
          </div>

          {authMode ===
            "login" && (
            <form
              onSubmit={
                login
              }
            >
              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={
                  authData.email
                }
                onChange={(
                  event
                ) =>
                  setAuthData({
                    ...authData,
                    email:
                      event.target
                        .value,
                  })
                }
                style={{
                  width:
                    "100%",
                  padding:
                    "12px",
                  margin:
                    "8px 0 18px",
                  boxSizing:
                    "border-box",
                }}
              />

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={
                  authData.password
                }
                onChange={(
                  event
                ) =>
                  setAuthData({
                    ...authData,
                    password:
                      event.target
                        .value,
                  })
                }
                style={{
                  width:
                    "100%",
                  padding:
                    "12px",
                  margin:
                    "8px 0 18px",
                  boxSizing:
                    "border-box",
                }}
              />

              {authError && (
                <p
                  style={{
                    color:
                      "#dc2626",
                  }}
                >
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  authLoading
                }
                style={{
                  width:
                    "100%",
                  padding:
                    "13px",
                  border:
                    "none",
                  borderRadius:
                    "8px",
                  background:
                    "#2563eb",
                  color:
                    "white",
                  fontWeight:
                    "600",
                }}
              >
                {authLoading
                  ? "Logging in..."
                  : "Login"}
              </button>
            </form>
          )}

          {authMode ===
            "register" && (
            <form
              onSubmit={
                register
              }
            >
              <h2>
                Create Account
              </h2>

              <label>
                Name
              </label>

              <input
                type="text"
                placeholder="Your name"
                value={
                  authData.name
                }
                onChange={(
                  event
                ) =>
                  setAuthData({
                    ...authData,
                    name:
                      event.target
                        .value,
                  })
                }
                style={{
                  width:
                    "100%",
                  padding:
                    "12px",
                  margin:
                    "8px 0 18px",
                  boxSizing:
                    "border-box",
                }}
              />

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="your@email.com"
                value={
                  authData.email
                }
                onChange={(
                  event
                ) =>
                  setAuthData({
                    ...authData,
                    email:
                      event.target
                        .value,
                  })
                }
                style={{
                  width:
                    "100%",
                  padding:
                    "12px",
                  margin:
                    "8px 0 18px",
                  boxSizing:
                    "border-box",
                }}
              />

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={
                  authData.password
                }
                onChange={(
                  event
                ) =>
                  setAuthData({
                    ...authData,
                    password:
                      event.target
                        .value,
                  })
                }
                style={{
                  width:
                    "100%",
                  padding:
                    "12px",
                  margin:
                    "8px 0 18px",
                  boxSizing:
                    "border-box",
                }}
              />

              <label>
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Enter password again"
                value={
                  authData.confirmPassword
                }
                onChange={(
                  event
                ) =>
                  setAuthData({
                    ...authData,
                    confirmPassword:
                      event.target
                        .value,
                  })
                }
                style={{
                  width:
                    "100%",
                  padding:
                    "12px",
                  margin:
                    "8px 0 18px",
                  boxSizing:
                    "border-box",
                }}
              />

              {authError && (
                <p
                  style={{
                    color:
                      "#dc2626",
                  }}
                >
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  authLoading
                }
                style={{
                  width:
                    "100%",
                  padding:
                    "13px",
                  border:
                    "none",
                  borderRadius:
                    "8px",
                  background:
                    "#2563eb",
                  color:
                    "white",
                  fontWeight:
                    "600",
                }}
              >
                {authLoading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN APP
  // =====================================================

  return (
    <div className="app">

      <aside className="sidebar">

        <h1 className="logo">
          MoneyTrack
        </h1>

        <nav>
          {navigationItems.map(
            (item) => (
              <a
                key={item.id}
                className={
                  currentPage ===
                  item.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCurrentPage(
                    item.id
                  )
                }
              >
                {item.icon}{" "}
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="sidebar-bottom">

          <strong>
            {user?.name}
          </strong>

          <p>
            {user?.email}
          </p>

          <button
            onClick={
              logout
            }
          >
            Logout
          </button>

        </div>

      </aside>

      <main className="main">

        {/* ================================================= */}
        {/* DASHBOARD */}
        {/* ================================================= */}

        {currentPage ===
          "dashboard" && (
          <>
            <header className="header">

              <div>
                <h2>
                  Dashboard
                </h2>

                <p>
                  Welcome back,{" "}
                  {user?.name}!
                </p>
              </div>

              <button
                className="add-button"
                onClick={() =>
                  setShowForm(
                    true
                  )
                }
              >
                + Add Transaction
              </button>

            </header>

            <section className="summary">

              <div className="card">
                <p>
                  Total Balance
                </p>

                <h3>
                  {formatMoney(
                    totalBalance
                  )}
                </h3>
              </div>

              <div className="card">
                <p>
                  Total Income
                </p>

                <h3>
                  {formatMoney(
                    totalIncome
                  )}
                </h3>
              </div>

              <div className="card">
                <p>
                  Total Expenses
                </p>

                <h3>
                  {formatMoney(
                    totalExpenses
                  )}
                </h3>
              </div>

            </section>

            <section className="panel transactions">

              <div className="panel-header">

                <h3>
                  Recent Transactions
                </h3>

                <button
                  className="view-button"
                  onClick={() =>
                    setCurrentPage(
                      "transactions"
                    )
                  }
                >
                  View All
                </button>

              </div>

              {loadingTransactions ? (
                <p>
                  Loading...
                </p>
              ) : transactions.length ===
                0 ? (
                <p>
                  No transactions yet.
                </p>
              ) : (
                transactions
                  .slice(
                    0,
                    5
                  )
                  .map(
                    (
                      item
                    ) => (
                      <div
                        className="transaction"
                        key={
                          item.id
                        }
                      >
                        <div className="transaction-info">

                          <div className="transaction-icon">
                            {item.type ===
                            "income"
                              ? "💰"
                              : "💸"}
                          </div>

                          <div>
                            <strong>
                              {
                                item.title
                              }
                            </strong>

                            <p>
                              {
                                item.category
                              }{" "}
                              •{" "}
                              {
                                item.date
                              }
                            </p>
                          </div>

                        </div>

                        <strong
                          className={
                            item.type ===
                            "income"
                              ? "income"
                              : "expense"
                          }
                        >
                          {item.type ===
                          "income"
                            ? "+"
                            : "-"}
                          {formatMoney(
                            item.amount
                          )}
                        </strong>
                      </div>
                    )
                  )
              )}

            </section>
          </>
        )}

        {/* ================================================= */}
        {/* TRANSACTIONS */}
        {/* ================================================= */}

        {currentPage ===
          "transactions" && (
          <>
            <header className="header">

              <div>
                <h2>
                  Transactions
                </h2>

                <p>
                  Manage all your
                  income and expenses.
                </p>
              </div>

              <button
                className="add-button"
                onClick={() =>
                  setShowForm(
                    true
                  )
                }
              >
                + Add Transaction
              </button>

            </header>

            <section className="panel">

              <div className="panel-header">

                <h3>
                  All Transactions
                </h3>

                <strong>
                  {
                    transactions.length
                  }{" "}
                  transactions
                </strong>

              </div>

              {loadingTransactions ? (
                <p>
                  Loading...
                </p>
              ) : transactions.length ===
                0 ? (
                <p>
                  No transactions found.
                </p>
              ) : (
                transactions.map(
                  (
                    item
                  ) => (
                    <div
                      className="transaction"
                      key={
                        item.id
                      }
                    >

                      <div className="transaction-info">

                        <div className="transaction-icon">
                          {item.type ===
                          "income"
                            ? "💰"
                            : "💸"}
                        </div>

                        <div>
                          <strong>
                            {
                              item.title
                            }
                          </strong>

                          <p>
                            {
                              item.category
                            }{" "}
                            •{" "}
                            {
                              item.date
                            }
                          </p>
                        </div>

                      </div>

                      <div>

                        <strong
                          className={
                            item.type ===
                            "income"
                              ? "income"
                              : "expense"
                          }
                        >
                          {item.type ===
                          "income"
                            ? "+"
                            : "-"}
                          {formatMoney(
                            item.amount
                          )}
                        </strong>

                        <button
                          className="view-button"
                          onClick={() =>
                            deleteTransaction(
                              item.id
                            )
                          }
                          style={{
                            marginLeft:
                              "15px",
                          }}
                        >
                          Delete
                        </button>

                      </div>

                    </div>
                  )
                )
              )}

            </section>
          </>
        )}

        {/* ================================================= */}
        {/* BUDGETS */}
        {/* ================================================= */}

        {currentPage ===
          "budgets" && (
          <>
            <header className="header">

              <div>
                <h2>
                  Budgets
                </h2>

                <p>
                  Plan your spending.
                </p>
              </div>

              <button
                className="add-button"
                onClick={() =>
                  setShowBudgetForm(
                    true
                  )
                }
              >
                + Create Budget
              </button>

            </header>

            <section className="summary">

              <div className="card">
                <p>
                  Total Budget
                </p>

                <h3>
                  {formatMoney(
                    totalBudget
                  )}
                </h3>
              </div>

              <div className="card">
                <p>
                  Total Spent
                </p>

                <h3>
                  {formatMoney(
                    totalBudgetSpent
                  )}
                </h3>
              </div>

              <div className="card">
                <p>
                  Remaining
                </p>

                <h3>
                  {formatMoney(
                    totalBudgetRemaining
                  )}
                </h3>
              </div>

            </section>

            <section className="panel">

              {loadingBudgets ? (
                <p>
                  Loading...
                </p>
              ) : budgets.length ===
                0 ? (
                <p>
                  No budgets yet.
                </p>
              ) : (
                budgets.map(
                  (budget) => {

                    const spent =
                      getCategorySpent(
                        budget.category
                      );

                    const percentage =
                      budget.amount >
                      0
                        ? Math.min(
                            100,
                            (spent /
                              budget.amount) *
                              100
                          )
                        : 0;

                    return (
                      <div
                        className="category"
                        key={
                          budget.id
                        }
                      >

                        <div>
                          <span>
                            {
                              budget.category
                            }
                          </span>

                          <strong>
                            {formatMoney(
                              spent
                            )}{" "}
                            /{" "}
                            {formatMoney(
                              budget.amount
                            )}
                          </strong>
                        </div>

                        <div className="progress">

                          <div
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>

                        <button
                          className="view-button"
                          onClick={() =>
                            deleteBudget(
                              budget.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>
                    );
                  }
                )
              )}

            </section>
          </>
        )}

        {/* ================================================= */}
        {/* REPORTS */}
        {/* ================================================= */}

        {currentPage ===
          "reports" && (
          <>
            <header className="header">
              <div>
                <h2>
                  Reports
                </h2>

                <p>
                  Your financial overview.
                </p>
              </div>
            </header>

            <section className="summary">

              <div className="card">
                <p>
                  Income
                </p>

                <h3>
                  {formatMoney(
                    totalIncome
                  )}
                </h3>
              </div>

              <div className="card">
                <p>
                  Expenses
                </p>

                <h3>
                  {formatMoney(
                    totalExpenses
                  )}
                </h3>
              </div>

              <div className="card">
                <p>
                  Balance
                </p>

                <h3>
                  {formatMoney(
                    totalBalance
                  )}
                </h3>
              </div>

            </section>

            <section className="panel">

              <h3>
                Expense Categories
              </h3>

              {[
                "Food",
                "Shopping",
                "Transport",
                "Entertainment",
                "Other",
              ].map(
                (category) => {

                  const spent =
                    getCategorySpent(
                      category
                    );

                  return (
                    <div
                      className="category"
                      key={
                        category
                      }
                    >

                      <div>
                        <span>
                          {category}
                        </span>

                        <strong>
                          {formatMoney(
                            spent
                          )}
                        </strong>
                      </div>

                    </div>
                  );
                }
              )}

            </section>
          </>
        )}

        {/* ================================================= */}
        {/* SETTINGS */}
        {/* ================================================= */}

        {currentPage ===
          "settings" && (
          <>
            <header className="header">

              <div>
                <h2>
                  Settings
                </h2>

                <p>
                  Manage your account.
                </p>
              </div>

            </header>

            <section className="panel">

              <h3>
                Account
              </h3>

              <p>
                <strong>
                  Name:
                </strong>{" "}
                {user?.name}
              </p>

              <p>
                <strong>
                  Email:
                </strong>{" "}
                {user?.email}
              </p>

              <button
                onClick={
                  logout
                }
              >
                Logout
              </button>

            </section>

            <section className="panel">

              <h3>
                Preferences
              </h3>

              <div className="setting-row">

                <strong>
                  Currency
                </strong>

                <select
                  value={
                    currency
                  }
                  onChange={(
                    event
                  ) =>
                    setCurrency(
                      event.target
                        .value
                    )
                  }
                >

                  <option value="INR">
                    ₹ INR
                  </option>

                  <option value="USD">
                    $ USD
                  </option>

                  <option value="EUR">
                    € EUR
                  </option>

                  <option value="GBP">
                    £ GBP
                  </option>

                </select>

              </div>

              <div className="setting-row">

                <strong>
                  Notifications
                </strong>

                <input
                  type="checkbox"
                  checked={
                    notifications
                  }
                  onChange={() =>
                    setNotifications(
                      !notifications
                    )
                  }
                />

              </div>

              <div className="setting-row">

                <strong>
                  Budget Alerts
                </strong>

                <input
                  type="checkbox"
                  checked={
                    budgetAlerts
                  }
                  onChange={() =>
                    setBudgetAlerts(
                      !budgetAlerts
                    )
                  }
                />

              </div>

            </section>
          </>
        )}

      </main>

      {/* ================================================= */}
      {/* ADD TRANSACTION MODAL */}
      {/* ================================================= */}

      {showForm && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.5)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            zIndex: 1000,
          }}
        >

          <form
            onSubmit={
              addTransaction
            }
            style={{
              background:
                "white",
              padding:
                "30px",
              borderRadius:
                "15px",
              width:
                "400px",
              maxWidth:
                "90%",
            }}
          >

            <h2>
              Add Transaction
            </h2>

            <input
              type="text"
              placeholder="Transaction name"
              value={
                formData.title
              }
              onChange={(
                event
              ) =>
                setFormData({
                  ...formData,
                  title:
                    event.target
                      .value,
                })
              }
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                margin:
                  "8px 0",
              }}
            />

            <input
              type="number"
              placeholder="Amount"
              value={
                formData.amount
              }
              onChange={(
                event
              ) =>
                setFormData({
                  ...formData,
                  amount:
                    event.target
                      .value,
                })
              }
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                margin:
                  "8px 0",
                boxSizing:
                  "border-box",
              }}
            />

            <select
              value={
                formData.type
              }
              onChange={(
                event
              ) =>
                setFormData({
                  ...formData,
                  type:
                    event.target
                      .value,
                })
              }
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                margin:
                  "8px 0",
              }}
            >

              <option value="expense">
                Expense
              </option>

              <option value="income">
                Income
              </option>

            </select>

            <select
              value={
                formData.category
              }
              onChange={(
                event
              ) =>
                setFormData({
                  ...formData,
                  category:
                    event.target
                      .value,
                })
              }
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                margin:
                  "8px 0 20px",
              }}
            >

              <option>
                Food
              </option>

              <option>
                Shopping
              </option>

              <option>
                Transport
              </option>

              <option>
                Entertainment
              </option>

              <option>
                Salary
              </option>

              <option>
                Other
              </option>

            </select>

            <button
              type="submit"
              className="add-button"
            >
              Add
            </button>

            <button
              type="button"
              className="view-button"
              onClick={() =>
                setShowForm(
                  false
                )
              }
              style={{
                marginLeft:
                  "10px",
              }}
            >
              Cancel
            </button>

          </form>

        </div>
      )}

      {/* ================================================= */}
      {/* ADD BUDGET MODAL */}
      {/* ================================================= */}

      {showBudgetForm && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.5)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            zIndex: 1000,
          }}
        >

          <form
            onSubmit={
              addBudget
            }
            style={{
              background:
                "white",
              padding:
                "30px",
              borderRadius:
                "15px",
              width:
                "400px",
              maxWidth:
                "90%",
            }}
          >

            <h2>
              Create Budget
            </h2>

            <select
              value={
                budgetForm.category
              }
              onChange={(
                event
              ) =>
                setBudgetForm({
                  ...budgetForm,
                  category:
                    event.target
                      .value,
                })
              }
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                margin:
                  "8px 0",
              }}
            >

              <option>
                Food
              </option>

              <option>
                Shopping
              </option>

              <option>
                Transport
              </option>

              <option>
                Entertainment
              </option>

              <option>
                Other
              </option>

            </select>

            <input
              type="number"
              placeholder="Budget amount"
              value={
                budgetForm.amount
              }
              onChange={(
                event
              ) =>
                setBudgetForm({
                  ...budgetForm,
                  amount:
                    event.target
                      .value,
                })
              }
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                margin:
                  "8px 0 20px",
                boxSizing:
                  "border-box",
              }}
            />

            <button
              type="submit"
              className="add-button"
            >
              Create
            </button>

            <button
              type="button"
              className="view-button"
              onClick={() =>
                setShowBudgetForm(
                  false
                )
              }
              style={{
                marginLeft:
                  "10px",
              }}
            >
              Cancel
            </button>

          </form>

        </div>
      )}

    </div>
  );
}

export default App;