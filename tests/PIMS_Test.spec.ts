import {test, expect} from '@playwright/test';
import {LoginPage} from './Pages/LoginPage';
import {PIMSModule} from './Pages/PIMSModule';
import employeeData from '../TestData/EmployeeData.json';

// Only employees with "run": true in EmployeeData.json are created
const testCases = employeeData.filter(data => data.run === true);

// Create the employees one by one, in JSON order
test.describe.configure({ mode: 'default' });

test.describe('PIMS Module - Add Employee', () => {
    // The demo site is slow: allow 2 minutes for login + creating one employee
    test.setTimeout(120000);

    test.beforeEach(async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.gotoLoginPage();
        await loginPage.login('Admin', 'admin123');
        await expect(page).toHaveURL(/\/dashboard\/index/, { timeout: 30000 });
    });

    for (const data of testCases) {
        test(data.testName, async ({page}) => {
            const pimsModule = new PIMSModule(page);
            await pimsModule.gotoPIMSModule();
            await expect(page).toHaveURL(/\/pim\//, { timeout: 60000 });
            await pimsModule.gotoAddEmployee();
            await expect(pimsModule.FirstNameInput).toBeVisible();

            await pimsModule.addEmployee(data);

            if (data.expected === 'success') {
                // Saved employee opens the Personal Details page
                await expect(page).toHaveURL(/\/pim\/viewPersonalDetails\/empNumber\//, { timeout: 60000 });
            } else {
                await expect(pimsModule.FieldErrorMessage.first()).toHaveText(data.errorMessage!);
            }
        });
    }
});
