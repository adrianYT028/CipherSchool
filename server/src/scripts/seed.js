const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), override: true });
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");

const SAMPLE_ASSIGNMENTS = [
    {
        title: "Select All Employees",
        difficulty: "Easy",
        description:
            "A warm-up query to retrieve every record from the employees table.",
        question:
            "Write a query that returns all columns and all rows from the employees table.",
        sampleTables: [
            {
                tableName: "employees",
                columns: ["id", "name", "department", "salary"],
                rows: [
                    ["1", "Alice", "Engineering", "95000"],
                    ["2", "Bob", "Marketing", "72000"],
                    ["3", "Charlie", "Engineering", "88000"],
                    ["4", "Diana", "Sales", "67000"],
                    ["5", "Eve", "Marketing", "71000"],
                ],
            },
        ],
        expectedOutput: {
            columns: ["id", "name", "department", "salary"],
            rows: [
                ["1", "Alice", "Engineering", "95000"],
                ["2", "Bob", "Marketing", "72000"],
                ["3", "Charlie", "Engineering", "88000"],
                ["4", "Diana", "Sales", "67000"],
                ["5", "Eve", "Marketing", "71000"],
            ],
        },
    },
    {
        title: "Filter by Department",
        difficulty: "Easy",
        description:
            "Practice using the WHERE clause to filter rows based on a condition.",
        question:
            "Write a query that returns the name and salary of all employees in the Engineering department.",
        sampleTables: [
            {
                tableName: "employees",
                columns: ["id", "name", "department", "salary"],
                rows: [
                    ["1", "Alice", "Engineering", "95000"],
                    ["2", "Bob", "Marketing", "72000"],
                    ["3", "Charlie", "Engineering", "88000"],
                    ["4", "Diana", "Sales", "67000"],
                    ["5", "Eve", "Marketing", "71000"],
                ],
            },
        ],
        expectedOutput: {
            columns: ["name", "salary"],
            rows: [
                ["Alice", "95000"],
                ["Charlie", "88000"],
            ],
        },
    },
    {
        title: "Count by Department",
        difficulty: "Medium",
        description:
            "Use aggregate functions and GROUP BY to summarise data.",
        question:
            "Write a query that counts the number of employees in each department. Return the department name and the count, aliased as employee_count.",
        sampleTables: [
            {
                tableName: "employees",
                columns: ["id", "name", "department", "salary"],
                rows: [
                    ["1", "Alice", "Engineering", "95000"],
                    ["2", "Bob", "Marketing", "72000"],
                    ["3", "Charlie", "Engineering", "88000"],
                    ["4", "Diana", "Sales", "67000"],
                    ["5", "Eve", "Marketing", "71000"],
                    ["6", "Frank", "Engineering", "102000"],
                ],
            },
        ],
        expectedOutput: {
            columns: ["department", "employee_count"],
            rows: [
                ["Engineering", "3"],
                ["Marketing", "2"],
                ["Sales", "1"],
            ],
        },
    },
    {
        title: "Order by Salary",
        difficulty: "Easy",
        description:
            "Practice sorting results with the ORDER BY clause.",
        question:
            "Write a query that returns all employee names and salaries, sorted by salary in descending order.",
        sampleTables: [
            {
                tableName: "employees",
                columns: ["id", "name", "department", "salary"],
                rows: [
                    ["1", "Alice", "Engineering", "95000"],
                    ["2", "Bob", "Marketing", "72000"],
                    ["3", "Charlie", "Engineering", "88000"],
                    ["4", "Diana", "Sales", "67000"],
                    ["5", "Eve", "Marketing", "71000"],
                ],
            },
        ],
        expectedOutput: {
            columns: ["name", "salary"],
            rows: [
                ["Alice", "95000"],
                ["Charlie", "88000"],
                ["Bob", "72000"],
                ["Eve", "71000"],
                ["Diana", "67000"],
            ],
        },
    },
    {
        title: "Inner Join Orders and Customers",
        difficulty: "Medium",
        description:
            "Combine rows from two tables using an INNER JOIN.",
        question:
            "Write a query that returns the customer name and order total for every order. Join the orders table with the customers table on customer_id.",
        sampleTables: [
            {
                tableName: "customers",
                columns: ["customer_id", "name", "city"],
                rows: [
                    ["1", "Acme Corp", "New York"],
                    ["2", "Globex Inc", "Chicago"],
                    ["3", "Initech", "Austin"],
                ],
            },
            {
                tableName: "orders",
                columns: ["order_id", "customer_id", "total"],
                rows: [
                    ["101", "1", "250.00"],
                    ["102", "2", "180.50"],
                    ["103", "1", "320.00"],
                    ["104", "3", "99.99"],
                ],
            },
        ],
        expectedOutput: {
            columns: ["name", "total"],
            rows: [
                ["Acme Corp", "250.00"],
                ["Globex Inc", "180.50"],
                ["Acme Corp", "320.00"],
                ["Initech", "99.99"],
            ],
        },
    },
    {
        title: "Average Salary per Department",
        difficulty: "Medium",
        description:
            "Combine GROUP BY with the AVG aggregate function.",
        question:
            "Write a query that returns each department and the average salary of its employees, aliased as avg_salary. Round the result to two decimal places.",
        sampleTables: [
            {
                tableName: "employees",
                columns: ["id", "name", "department", "salary"],
                rows: [
                    ["1", "Alice", "Engineering", "95000"],
                    ["2", "Bob", "Marketing", "72000"],
                    ["3", "Charlie", "Engineering", "88000"],
                    ["4", "Diana", "Sales", "67000"],
                    ["5", "Eve", "Marketing", "71000"],
                    ["6", "Frank", "Engineering", "102000"],
                ],
            },
        ],
        expectedOutput: {
            columns: ["department", "avg_salary"],
            rows: [
                ["Engineering", "95000.00"],
                ["Marketing", "71500.00"],
                ["Sales", "67000.00"],
            ],
        },
    },
    {
        title: "Departments with High Average Salary",
        difficulty: "Hard",
        description:
            "Filter grouped results using the HAVING clause.",
        question:
            "Write a query that returns department names where the average salary exceeds 75000. Include the department and the average salary aliased as avg_salary, rounded to two decimal places.",
        sampleTables: [
            {
                tableName: "employees",
                columns: ["id", "name", "department", "salary"],
                rows: [
                    ["1", "Alice", "Engineering", "95000"],
                    ["2", "Bob", "Marketing", "72000"],
                    ["3", "Charlie", "Engineering", "88000"],
                    ["4", "Diana", "Sales", "67000"],
                    ["5", "Eve", "Marketing", "71000"],
                    ["6", "Frank", "Engineering", "102000"],
                    ["7", "Grace", "Sales", "69000"],
                ],
            },
        ],
        expectedOutput: {
            columns: ["department", "avg_salary"],
            rows: [["Engineering", "95000.00"]],
        },
    },
    {
        title: "Subquery - Above Average Earners",
        difficulty: "Hard",
        description:
            "Use a subquery to compare individual rows against an aggregate value.",
        question:
            "Write a query that returns the name and salary of employees who earn more than the overall average salary across all employees.",
        sampleTables: [
            {
                tableName: "employees",
                columns: ["id", "name", "department", "salary"],
                rows: [
                    ["1", "Alice", "Engineering", "95000"],
                    ["2", "Bob", "Marketing", "72000"],
                    ["3", "Charlie", "Engineering", "88000"],
                    ["4", "Diana", "Sales", "67000"],
                    ["5", "Eve", "Marketing", "71000"],
                    ["6", "Frank", "Engineering", "102000"],
                ],
            },
        ],
        expectedOutput: {
            columns: ["name", "salary"],
            rows: [
                ["Alice", "95000"],
                ["Charlie", "88000"],
                ["Frank", "102000"],
            ],
        },
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { directConnection: true });
        console.log("[seed] Connected to MongoDB");

        await Assignment.deleteMany({});
        console.log("[seed] Cleared old assignments");

        const inserted = await Assignment.insertMany(SAMPLE_ASSIGNMENTS);
        console.log(`[seed] Inserted ${inserted.length} assignments`);

        await mongoose.disconnect();
        console.log("[seed] Done");
    } catch (err) {
        console.error("[seed] Error:", err.message);
        process.exit(1);
    }
}

seed();
