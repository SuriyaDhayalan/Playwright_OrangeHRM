import fs from 'fs';
import path from 'path';

/**
 * Runs once before every test run.
 * Gives each employee in EmployeeData.json a new Employee Id and Username,
 * so the employees can be created again on the shared OrangeHRM demo site.
 */
export default function globalSetup() {
    const filePath = path.resolve(__dirname, 'TestData/EmployeeData.json');
    const employees = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Last 6 digits of the current time, e.g. "482913"
    const runId = Date.now().toString().slice(-6);

    employees.forEach((employee: any, index: number) => {
        const number = String(index + 1).padStart(2, '0');

        // Keep values that are invalid on purpose (Employee Id over 10 characters, Username under 5 characters)
        if (employee.employeeId.length <= 10) {
            employee.employeeId = `E${runId}${number}`;
        }
        if (employee.username && employee.username.length >= 5) {
            employee.username = `${employee.firstName}.${employee.lastName}${runId}${number}`.toLowerCase();
        }
    });

    fs.writeFileSync(filePath, JSON.stringify(employees, null, 3) + '\n');
    console.log(`EmployeeData.json updated with run id ${runId}`);
}
