import {test, expect} from '@playwright/test';
import {LoginPage} from './Pages/LoginPage';
import loginData from '../TestData/loginData.json';

// Only test cases with "run": true in loginData.json are executed
const testCases = loginData.filter(data => data.run === true);

// Run the test cases one by one, in JSON order
test.describe.configure({ mode: 'default' });

for (const data of testCases) {
    test(data.testName, async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.gotoLoginPage();
        await loginPage.login(data.username, data.password);
        if (data.expected === 'success') {
            await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index', { timeout: 30000 });
            await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
            await page.waitForTimeout(10000); // Wait for 10 seconds to ensure the page is fully loaded

        } else {
            await expect(loginPage.errorMessage).toHaveText(data.errorMessage!);
        }
    });
}
