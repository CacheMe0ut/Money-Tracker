import "./App.css";

function App() {
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1 className="logo"> TEST MONEYTRACK</h1>

        <nav>
          <a className="active">Dashboard</a>
          <a>Transactions</a>
          <a>Budgets</a>
          <a>Reports</a>
          <a>Settings</a>
        </nav>

        <div className="sidebar-bottom">
          <p>Personal Finance</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <header className="header">
          <div>
            <h2>Dashboard</h2>
            <p>Welcome back! Here's your financial overview.</p>
          </div>

          <button className="add-button">
            + Add Transaction
          </button>
        </header>

        {/* Summary Cards */}
        <section className="summary">
          <div className="card">
            <p>Total Balance</p>
            <h3>₹24,500</h3>
            <span className="positive">+8.2% this month</span>
          </div>

          <div className="card">
            <p>Total Income</p>
            <h3>₹35,000</h3>
            <span className="positive">+5.4% this month</span>
          </div>

          <div className="card">
            <p>Total Expenses</p>
            <h3>₹10,500</h3>
            <span className="negative">+2.1% this month</span>
          </div>
        </section>

        {/* Dashboard Content */}
        <section className="dashboard-grid">

          {/* Spending Overview */}
          <div className="panel">
            <div className="panel-header">
              <h3>Spending Overview</h3>
              <select>
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>

            <div className="chart-placeholder">
              <div className="bar bar-1"></div>
              <div className="bar bar-2"></div>
              <div className="bar bar-3"></div>
              <div className="bar bar-4"></div>
              <div className="bar bar-5"></div>
              <div className="bar bar-6"></div>
              <div className="bar bar-7"></div>
            </div>

            <div className="chart-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Categories */}
          <div className="panel">
            <h3>Expense Categories</h3>

            <div className="category">
              <div>
                <span>🍔 Food</span>
                <strong>₹4,000</strong>
              </div>
              <div className="progress">
                <div style={{ width: "75%" }}></div>
              </div>
            </div>

            <div className="category">
              <div>
                <span>🛍️ Shopping</span>
                <strong>₹2,000</strong>
              </div>
              <div className="progress">
                <div style={{ width: "50%" }}></div>
              </div>
            </div>

            <div className="category">
              <div>
                <span>🚗 Transport</span>
                <strong>₹1,500</strong>
              </div>
              <div className="progress">
                <div style={{ width: "35%" }}></div>
              </div>
            </div>

            <div className="category">
              <div>
                <span>🎮 Entertainment</span>
                <strong>₹1,000</strong>
              </div>
              <div className="progress">
                <div style={{ width: "25%" }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="panel transactions">
          <div className="panel-header">
            <h3>Recent Transactions</h3>
            <button className="view-button">View All</button>
          </div>

          <div className="transaction">
            <div className="transaction-info">
              <div className="transaction-icon food">🍔</div>
              <div>
                <strong>Food</strong>
                <p>Today, 2:30 PM</p>
              </div>
            </div>
            <strong className="expense">-₹500</strong>
          </div>

          <div className="transaction">
            <div className="transaction-info">
              <div className="transaction-icon salary">💰</div>
              <div>
                <strong>Salary</strong>
                <p>Yesterday</p>
              </div>
            </div>
            <strong className="income">+₹35,000</strong>
          </div>

          <div className="transaction">
            <div className="transaction-info">
              <div className="transaction-icon travel">🚗</div>
              <div>
                <strong>Transport</strong>
                <p>Yesterday</p>
              </div>
            </div>
            <strong className="expense">-₹800</strong>
          </div>

          <div className="transaction">
            <div className="transaction-info">
              <div className="transaction-icon shopping">🛍️</div>
              <div>
                <strong>Shopping</strong>
                <p>2 days ago</p>
              </div>
            </div>
            <strong className="expense">-₹1,200</strong>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;