<h1 align="center">💰 Personal Finance Tracker</h1>

<p align="center">
A full stack web application to manage income, expenses, and view financial analytics.<br>
Built with <strong>React</strong>, <strong>Node.js</strong>, <strong>Express</strong>, <strong>PostgreSQL/MySQL</strong>, and <strong>Redis</strong>.
</p>

<hr>

<h2>🚀 Features</h2>

<h3>User Authentication</h3>
<ul>
  <li>JWT-based authentication</li>
  <li>Role-Based Access Control (<code>admin</code>, <code>user</code>, <code>read-only</code>)</li>
  <li>Protected routes and conditional UI rendering</li>
</ul>

<h3>Transaction Management</h3>
<ul>
  <li>Add, edit, delete, and categorize transactions (income/expense)</li>
  <li>Search and filter transactions</li>
  <li>Pagination and virtual scrolling for large lists</li>
</ul>

<h3>Dashboard & Analytics</h3>
<ul>
  <li>Monthly/yearly spending overview</li>
  <li>Category-wise expense breakdown</li>
  <li>Income vs Expense trends</li>
  <li>Interactive charts: Pie, Line, Bar</li>
</ul>

<h3>Performance & Security</h3>
<ul>
  <li>Redis caching for analytics and category lists</li>
  <li>API rate limiting</li>
  <li>Protection against XSS and SQL Injection</li>
</ul>

<hr>

<h2>🛠️ Tech Stack</h2>
<ul>
  <li><strong>Frontend:</strong> React 18+, Vite, TypeScript, Chart.js / Recharts, Tailwind CSS</li>
  <li><strong>Backend:</strong> Node.js, Express.js, TypeScript</li>
  <li><strong>Database:</strong> PostgreSQL / MySQL</li>
  <li><strong>Caching:</strong> Redis</li>
  <li><strong>API Docs:</strong> Swagger / OpenAPI</li>
</ul>

<hr>

<h2>📁 Project Structure</h2>

<pre>
/frontend   → React app  
/backend    → Node.js + Express API  
/README.md  → Project overview and setup  
</pre>

<hr>

<h2>⚙️ Getting Started</h2>

<h3>Prerequisites</h3>
<ul>
  <li>Node.js (v18+)</li>
  <li>npm or yarn</li>
  <li>PostgreSQL or MySQL</li>
  <li>Redis</li>
</ul>

<h3>Setup</h3>

<pre>
1. Clone the repository
   git clone https://github.com/imudaynigam/finance-tracker.git
   cd finance-tracker

2. Frontend
   cd frontend
   npm install
   npm run dev

3. Backend
   cd backend
   npm install
   npm run dev

4. Database
   - Create a database in PostgreSQL/MySQL
   - Run migrations (see backend README or scripts)
</pre>

<hr>

<h2>📘 API Documentation</h2>
<p>Swagger UI available at: <a href="http://localhost:5000/api/docs">http://localhost:5000/api/docs</a></p>

<hr>

<h2>🔐 Demo Credentials</h2>

<table>
  <thead>
    <tr>
      <th>Role</th>
      <th>Username</th>
      <th>Password</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Admin</td>
      <td>admin@demo.com</td>
      <td>admin123</td>
    </tr>
    <tr>
      <td>User</td>
      <td>user@demo.com</td>
      <td>user123</td>
    </tr>
    <tr>
      <td>Read-only</td>
      <td>view@demo.com</td>
      <td>view123</td>
    </tr>
  </tbody>
</table>

<hr>

<h2>⚡ Performance</h2>
<ul>
  <li>Analytics data cached for 15 minutes</li>
  <li>Category list cached for 1 hour</li>
  <li>Rate Limits:</li>
  <ul>
    <li>Auth: 5 requests per 15 minutes</li>
    <li>Transactions: 100 requests per hour</li>
    <li>Analytics: 50 requests per hour</li>
  </ul>
</ul>


<h4 align="center">Made with ❤️ by Uday Nigam</h4>
