//Dependencies packages
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const CFonts = require("cfonts");

//Local Connection to MySQL for database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "marchsam1988",
  database: "employee_trackerdb",
});

//When connected use cfonts as a header and then go to the main function to prompt users
connection.connect(function (err) {
  if (err) throw err;
  CFonts.say("Employee|Manager", {
    font: "3d",
    align: "left",
    colors: ["red", "cyan"],
    background: "transparent",
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: "0",
    gradient: false,
    independentGradient: false,
    transitionGradient: false,
    env: "node",
  });
  promptUser();
});

//Main Menu of Employee Manager, asks questions then divert to appropriate function
function promptUser() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "View All Roles",
          "View All Departments",
          "Add Role",
          "Add Employee",
          "Add Department",
          "Remove Employee",
          "Update Employee Role",
          "Done!",
        ],
        name: "userchoice",
      },
    ])
    .then(function (response) {
      switch (response.userchoice) {
        case "View All Employees":
          viewAll();
          break;

        case "View All Roles":
          viewRoles();
          break;

        case "View All Departments":
          viewByDepartment();
          break;

        case "Add Role":
          addRole();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "Done!":
          missionComplete();
          break;
      }
    });
}

//function to view all employees, departments, and roles
function viewAll() {
  let query =
    "SELECT employee.first_name, employee.last_name, role.title, departments.department, role.salary";
  query +=
    " FROM employee INNER JOIN role ON (employee.role_id = role.id) LEFT JOIN departments ON (role.department_id = departments.id)";
  query += " ORDER BY employee.last_name;";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    promptUser();
  });
}

//function to view all roles
function viewRoles() {
  let query = "SELECT role.title, role.salary FROM role;";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    promptUser();
  });
}

//function to view all departments
function viewByDepartment() {
  let query = "SELECT * FROM departments;";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    promptUser();
  });
}

//function to add role to db
function addRole() {
  let departmentArr = [];
  let departmentQuery = "SELECT * FROM departments;";
  connection.query(departmentQuery, function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      departmentArr.push(res[i].department);
    }
    let query = "SELECT role.title, role.salary, departments.department";
    query +=
      " FROM role INNER JOIN departments ON (role.department_id = departments.id);";
    connection.query(query, function (err, res) {
      if (err) throw err;
      console.table(res);
      inquirer
        .prompt([
          {
            type: "input",
            message: "What is the name of the role you want to add?",
            name: "newrole",
          },
          {
            type: "input",
            message: "How much does this role earn per year?",
            name: "newsalary",
          },
          {
            type: "list",
            message: "What department does this role belong to?",
            choices: departmentArr,
            name: "newdepartment",
          },
        ])
        .then(function (response) {
          let addDepartment = response.newdepartment;
          let addDepartmentId = departmentArr.indexOf(addDepartment);
          addDepartmentId++;
          console.log("Adding New Role...\n");
          connection.query(
            "INSERT INTO role SET ?",
            {
              title: response.newrole,
              salary: response.newsalary,
              department_id: addDepartmentId,
            },
            function (err, res) {
              if (err) throw err;
              console.log(res.affectedRows + " Role Created Succesfully\n");
              promptUser();
            }
          );
        });
    });
  });
}

//function to add employees to db
function addEmployee() {
  let roleArr = [];
  let roleQuery = "SELECT role.title FROM role;";
  connection.query(roleQuery, function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      roleArr.push(res[i].title);
    }
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is your employees first name?",
          name: "firstname",
        },
        {
          type: "input",
          message: "What is your employees last name?",
          name: "lastname",
        },
        {
          type: "list",
          message: "Choose your employees role",
          name: "role",
          choices: roleArr,
        },
      ])
      .then(function (response) {
        console.log("Adding New Employee...\n");
        let addEmployeeRole = response.role;
        let addEmployeeRoleId = roleArr.indexOf(addEmployeeRole);
        addEmployeeRoleId++;
        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: response.firstname,
            last_name: response.lastname,
            role_id: addEmployeeRoleId,
          },
          function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " Employee Created Succesfully\n");
            promptUser();
          }
        );
      });
  });
}

//function to add department to db
function addDepartment() {
  let query = "SELECT * FROM departments;";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the name of the department you want to add?",
          name: "newdepartment",
        },
      ])
      .then(function (response) {
        console.log("Adding New Department...\n");
        connection.query(
          "INSERT INTO departments SET ?",
          {
            department: response.newdepartment,
          },
          function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " Department Created Succesfully\n");
            promptUser();
          }
        );
      });
  });
}

//function to delete an employee from the db
function removeEmployee() {
  let employeeArr = [];
  let query =
    "SELECT employee.first_name, employee.last_name, departments.department";
  query +=
    " FROM employee INNER JOIN role ON (employee.role_id = role.id) INNER JOIN departments ON (role.department_id = departments.id)";
  query += " ORDER BY employee.last_name";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    for (i = 0; i < res.length; i++) {
      employeeArr.push(res[i].last_name);
    }
    inquirer
      .prompt([
        {
          type: "list",
          message: "Which employee do you want to remove?",
          choices: employeeArr,
          name: "last_name",
        },
      ])
      .then(function (response) {
        var query = "DELETE FROM employee WHERE (?)";
        connection.query(query, response, function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " Employee Deleted Succesfully\n");
          promptUser();
        });
      });
  });
}

//function to update role of employee
function updateEmployeeRole() {
  let roleArr = [];
  let roleQuery = "SELECT role.title FROM role;";
  connection.query(roleQuery, function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      roleArr.push(res[i].title);
    }
  });
  let updateEmployeeRole = [];
  let query =
    "SELECT employee.first_name, employee.last_name, role.title, departments.department";
  query +=
    " FROM employee INNER JOIN role ON (employee.role_id = role.id) INNER JOIN departments ON (role.department_id = departments.id)";
  query += " ORDER BY employee.last_name";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    for (i = 0; i < res.length; i++) {
      updateEmployeeRole.push(res[i].last_name);
    }
    inquirer
      .prompt([
        {
          type: "list",
          message: "Which employee do you want to update his/her role?",
          choices: updateEmployeeRole,
          name: "last_name",
        },
        {
          type: "list",
          message: "Choose the new role for the employee",
          name: "role",
          choices: roleArr,
        },
      ])
      .then(function (response) {
        console.log("Updating Role for Employee...\n");
        let updateRole = response.role;
        let updateRoleId = roleArr.indexOf(updateRole);
        updateRoleId++;
        var query = "UPDATE employee SET ? WHERE ?";
        connection.query(
          query,
          [
            {
              role_id: updateRoleId,
            },
            {
              last_name: response.last_name,
            },
          ],
          function (err, res) {
            if (err) throw err;
            console.log("Role Successfully Changed!!\n");
            promptUser();
          }
        );
      });
  });
}

//function to end program
function missionComplete() {
  CFonts.say("Goodbye!", {
    font: "block",
    align: "left",
    colors: ["system"],
    background: "transparent",
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: "0",
    gradient: false,
    independentGradient: false,
    transitionGradient: false,
    env: "node",
  });
  connection.end();
}
