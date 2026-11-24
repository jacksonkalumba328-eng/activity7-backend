require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const recordsRoutes = require("./routes/records");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGINS
        ? process.env.CLIENT_ORIGINS.split(",")
        : "*"
}));

app.use(express.json());

// API DOCUMENTATION HOMEPAGE
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activity 7 - Backend API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: #f1f5f9;
                color: #1e293b;
                margin: 0;
                padding: 30px;
            }
            .container {
                max-width: 1000px;
                margin: auto;
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 15px #0001;
            }
            h1 { color: #1d4ed8; }
            h2 { color: #334155; margin-top: 30px; }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            th, td {
                padding: 12px;
                border: 1px solid #ddd;
                text-align: left;
            }
            th {
                background: #1d4ed8;
                color: white;
            }
            code {
                background: #e2e8f0;
                padding: 3px 6px;
                border-radius: 4px;
            }
            pre {
                background: #0f172a;
                color: white;
                padding: 18px;
                border-radius: 8px;
                overflow-x: auto;
            }
            a { color: #2563eb; }
            .note {
                background: #fef3c7;
                padding: 15px;
                border-radius: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Campus Maintenance Request API</h1>

            <p><strong>Activity:</strong> ICT Activity 7 - Backend Development</p>
            <p><strong>Student Name:</strong> Jackson Kalumba</p>
            <p><strong>Student Number:</strong> 202508492</p>

            <h2>About this API</h2>
            <p>
                This REST API manages campus maintenance requests.
                It allows users to create, view, update and delete
                maintenance records using PostgreSQL.
            </p>

            <h2>API Base URL</h2>
            <p>Local: <code>http://localhost:3000</code></p>
            <p>Hosted URL: To be added after deployment.</p>

            <h2>Useful Links</h2>
            <ul>
                <li><a href="/health">Check API Health</a></li>
                <li><a href="/api/records">View All Records</a></li>
            </ul>

            <h2>Available API Routes</h2>
            <table>
                <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
                <tr><td>GET</td><td>/</td><td>API documentation</td></tr>
                <tr><td>GET</td><td>/health</td><td>Check server and database</td></tr>
                <tr><td>GET</td><td>/api/records</td><td>Get all records</td></tr>
                <tr><td>GET</td><td>/api/records/:id</td><td>Get one record</td></tr>
                <tr><td>POST</td><td>/api/records</td><td>Create a record</td></tr>
                <tr><td>PUT</td><td>/api/records/:id</td><td>Update a record</td></tr>
                <tr><td>DELETE</td><td>/api/records/:id</td><td>Delete a record</td></tr>
            </table>

            <h2>Required Fields</h2>
            <ul>
                <li>Title: 3 to 80 characters</li>
                <li>Category: 2 to 40 characters</li>
                <li>Description: 5 to 300 characters</li>
                <li>Status: Pending, In progress, or Completed</li>
            </ul>

            <h2>POST and PUT Request Example</h2>
            <pre>{
  "title": "Repair classroom lights",
  "category": "Electrical",
  "description": "The lights in classroom 5 are not working.",
  "status": "Pending"
}</pre>

            <h2>Expected HTTP Status Codes</h2>
            <ul>
                <li>200 - Request successful</li>
                <li>201 - Record created</li>
                <li>400 - Invalid input or malformed JSON</li>
                <li>404 - Record or route not found</li>
                <li>500 - Internal server error</li>
                <li>503 - Database unavailable</li>
            </ul>

            <div class="note">
                <strong>Hosting note:</strong>
                A hosted service may go idle after a period of inactivity.
                The first request after inactivity may take longer to respond.
            </div>
        </div>
    </body>
    </html>
    `);
});

// DATABASE HEALTH CHECK
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT NOW()");
        res.status(200).json({
            status: "OK",
            database: "Connected"
        });
    } catch (error) {
        res.status(503).json({
            status: "Error",
            database: "Disconnected"
        });
    }
});

// RECORD ROUTES
app.use("/api/records", recordsRoutes);

// ERROR HANDLING
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON format."
        });
    }

    console.error(err);

    res.status(500).json({
        message: "Internal Server Error"
    });
});

// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});