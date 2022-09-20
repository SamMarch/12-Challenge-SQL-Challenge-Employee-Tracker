//Dependencies packages
const mysql = require("mysql2");
const inquirer = require("inquirer");
require("console.table");
require("dotenv").config();

const { HOST, PORT, USER, PASSWORD, DATABASE } = process.env;

// Create connection to database
const connection = mysql.createConnection({
  host: HOST,
  port: PORT,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
});

// Main menu, user can select from a list of options
function optionsList() {
  inquirer
    .prompt({
      name: "options",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all employees",
        "View all employees by department",
        "View all employees by manager",
        "Add employee",
        "Remove employee",
        "Update employee role",
        "Update employee manager",
        "View all roles",
        "Add role",
        "Remove role",
        "View all departments",
        "Add department",
        "Remove department",
        "View total utilized budget of a department",
        "Exit",
      ],
    })
    .then(function (response) {
      switch (response.options) {
        case "View all employees":
          viewAllEmployees();
          break;
        case "View all employees by department":
          viewAllEmployeesByDepartment();
          break;
        case "View all employees by manager":
          viewAllEmployeesByManager();
          break;
        case "Add employee":
          addEmployee();
          break;
        case "Remove employee":
          removeEmployee();
          break;
        case "Update employee role":
          updateEmployeeRole();
          break;
        case "Update employee manager":
          updateEmployeeManager();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "Add role":
          addRole();
          break;
        case "Remove role":
          removeRole();
          break;
        case "View all departments":
          viewAllDepartments();
          break;
        case "Add department":
          addDepartment();
          break;
        case "Remove department":
          removeDepartment();
          break;
        case "View total utilized budget of a department":
          viewTotalUtilizedBudget();
          break;
        case "Exit":
          endProgram();
          break;
      }
    });
}

// View all employees
function viewAllEmployees() {
  connection.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      optionsList();
    }
  );
}

// View all employees by department
function viewAllEmployeesByDepartment() {
  connection.query(
    "SELECT department.name AS department, employee.first_name, employee.last_name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY department.name",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      optionsList();
    }
  );
}

// View all employees by manager
function viewAllEmployeesByManager() {
  connection.query(
    "SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, employee.first_name, employee.last_name FROM employee LEFT JOIN employee manager ON manager.id = employee.manager_id ORDER BY manager",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      optionsList();
    }
  );
}

// Add employee
function addEmployee() {
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "first_name",
          type: "input",
          message: "What is the employee's first name?",
        },
        {
          name: "last_name",
          type: "input",
          message: "What is the employee's last name?",
        },
        {
          name: "role",
          type: "rawlist",
          choices: function () {
            let choiceArray = [];
            for (let i = 0; i < res.length; i++) {
              choiceArray.push(res[i].title);
            }
            return choiceArray;
          },
          message: "What is the employee's role?",
        },
      ])
      .then(function (answer) {
        let roleID;
        for (let i = 0; i < res.length; i++) {
          if (res[i].title == answer.role) {
            roleID = res[i].id;
          }
        }
        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answer.first_name,
            last_name: answer.last_name,
            role_id: roleID,
          },
          function (err) {
            if (err) throw err;
            console.log("Employee added successfully!");
            optionsList();
          }
        );
      });
  });
}

// Add role
function addRole() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What is the name of the role?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary of the role?",
        },
        {
          name: "department",
          type: "rawlist",
          choices: function () {
            let choiceArray = [];
            for (let i = 0; i < res.length; i++) {
              choiceArray.push(res[i].name);
            }
            return choiceArray;
          },
          message: "What department does the role belong to?",
        },
      ])
      .then(function (answer) {
        let departmentID;
        for (let i = 0; i < res.length; i++) {
          if (res[i].name == answer.department) {
            departmentID = res[i].id;
          }
        }
        connection.query(
          "INSERT INTO role SET ?",
          {
            title: answer.title,
            salary: answer.salary,
            department_id: departmentID,
          },
          function (err) {
            if (err) throw err;
            console.log("Role added successfully!");
            optionsList();
          }
        );
      });
  });
}

// Add department
function addDepartment() {
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "What is the name of the department?",
      },
    ])
    .then(function (answer) {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.name,
        },
        function (err) {
          if (err) throw err;
          console.log("Department added successfully!");
          optionsList();
        }
      );
    });
}

// Remove employee
function removeEmployee() {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "employee",
          type: "rawlist",
          choices: function () {
            let choiceArray = [];
            for (let i = 0; i < res.length; i++) {
              choiceArray.push(res[i].first_name);
            }
            return choiceArray;
          },
          message: "Which employee would you like to remove?",
        },
      ])
      .then(function (answer) {
        let employeeID;
        for (let i = 0; i < res.length; i++) {
          if (res[i].first_name == answer.employee) {
            employeeID = res[i].id;
          }
        }
        connection.query(
          "DELETE FROM employee WHERE ?",
          {
            id: employeeID,
          },
          function (err) {
            if (err) throw err;
            console.log("Employee removed successfully!");
            optionsList();
          }
        );
      });
  });
}

// Update employee role
function updateEmployeeRole() {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "employee",
          type: "rawlist",
          choices: function () {
            let choiceArray = [];
            for (let i = 0; i < res.length; i++) {
              choiceArray.push(res[i].first_name);
            }
            return choiceArray;
          },
          message: "Which employee would you like to update?",
        },
      ])
      .then(function (answer) {
        let employeeID;
        for (let i = 0; i < res.length; i++) {
          if (res[i].first_name == answer.employee) {
            employeeID = res[i].id;
          }
        }
        connection.query("SELECT * FROM role", function (err, res) {
          if (err) throw err;
          inquirer
            .prompt([
              {
                name: "role",
                type: "rawlist",
                choices: function () {
                  let choiceArray = [];
                  for (let i = 0; i < res.length; i++) {
                    choiceArray.push(res[i].title);
                  }
                  return choiceArray;
                },
                message: "What is the employee's new role?",
              },
            ])
            .then(function (answer) {
              let roleID;
              for (let i = 0; i < res.length; i++) {
                if (res[i].title == answer.role) {
                  roleID = res[i].id;
                }
              }
              connection.query(
                "UPDATE employee SET ? WHERE ?",
                [
                  {
                    role_id: roleID,
                  },
                  {
                    id: employeeID,
                  },
                ],
                function (err) {
                  if (err) throw err;
                  console.log("Employee role updated successfully!");
                  optionsList();
                }
              );
            });
        });
      });
  });
}

// Update employee manager
function updateEmployeeManager() {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "employee",
          type: "rawlist",
          choices: function () {
            let choiceArray = [];
            for (let i = 0; i < res.length; i++) {
              choiceArray.push(res[i].first_name);
            }
            return choiceArray;
          },
          message: "Which employee would you like to update?",
        },
      ])
      .then(function (answer) {
        let employeeID;
        for (let i = 0; i < res.length; i++) {
          if (res[i].first_name == answer.employee) {
            employeeID = res[i].id;
          }
        }
        connection.query("SELECT * FROM employee", function (err, res) {
          if (err) throw err;
          inquirer
            .prompt([
              {
                name: "manager",
                type: "rawlist",
                choices: function () {
                  let choiceArray = [];
                  for (let i = 0; i < res.length; i++) {
                    choiceArray.push(res[i].first_name);
                  }
                  return choiceArray;
                },
                message: "Who is the employee's new manager?",
              },
            ])
            .then(function (answer) {
              let managerID;
              for (let i = 0; i < res.length; i++) {
                if (res[i].first_name == answer.manager) {
                  managerID = res[i].id;
                }
              }
              connection.query(
                "UPDATE employee SET ? WHERE ?",
                [
                  {
                    manager_id: managerID,
                  },
                  {
                    id: employeeID,
                  },
                ],
                function (err) {
                  if (err) throw err;
                  console.log("Employee manager updated successfully!");
                  optionsList();
                }
              );
            });
        });
      });
  });
}

// View all roles
function viewAllRoles() {
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    console.table(res);
    optionsList();
  });
}

// Remove role
function removeRole() {
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "role",
          type: "rawlist",
          choices: function () {
            let choiceArray = [];
            for (let i = 0; i < res.length; i++) {
              choiceArray.push(res[i].title);
            }
            return choiceArray;
          },
          message: "Which role would you like to remove?",
        },
      ])
      .then(function (answer) {
        let roleID;
        for (let i = 0; i < res.length; i++) {
          if (res[i].title == answer.role) {
            roleID = res[i].id;
          }
        }
        connection.query(
          "DELETE FROM role WHERE ?",
          {
            id: roleID,
          },
          function (err) {
            if (err) throw err;
            console.log("Role removed successfully!");
            optionsList();
          }
        );
      });
  });
}

// View all departments
function viewAllDepartments() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    console.table(res);
    optionsList();
  });
}

// Remove department
function removeDepartment() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "department",
          type: "rawlist",
          choices: function () {
            let choiceArray = [];
            for (let i = 0; i < res.length; i++) {
              choiceArray.push(res[i].name);
            }
            return choiceArray;
          },
          message: "Which department would you like to remove?",
        },
      ])
      .then(function (answer) {
        let departmentID;
        for (let i = 0; i < res.length; i++) {
          if (res[i].name == answer.department) {
            departmentID = res[i].id;
          }
        }
        connection.query(
          "DELETE FROM department WHERE ?",
          {
            id: departmentID,
          },
          function (err) {
            if (err) throw err;
            console.log("Department removed successfully!");
            optionsList();
          }
        );
      });
  });
}

// View total utilized budget of a department
function viewTotalUtilizedBudget() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "department",
          type: "rawlist",
          choices: function () {
            let choiceArray = [];
            for (let i = 0; i < res.length; i++) {
              choiceArray.push(res[i].name);
            }
            return choiceArray;
          },
          message: "Which department would you like to view?",
        },
      ])
      .then(function (answer) {
        let departmentID;
        for (let i = 0; i < res.length; i++) {
          if (res[i].name == answer.department) {
            departmentID = res[i].id;
          }
        }
        connection.query(
          "SELECT SUM(salary) AS total FROM role WHERE department_id = ?",
          [departmentID],
          function (err, res) {
            if (err) throw err;
            console.log("Total utilized budget: " + res[0].total);
            optionsList();
          }
        );
      });
  });
}

// Start the application
optionsList();

// End the program
function endProgram() {
  console.log("Goodbye!");
  connection.end();
}
