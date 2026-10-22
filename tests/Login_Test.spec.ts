import {test, expect} from '@playwright/test';
import {LoginPage} from './Pages/LoginPage';
import loginData from './TestData/loginData.json';

test('Login Test', async ({page}) => {
    const loginPage = new LoginPage(page);
    await loginPage.gotoLoginPage();
    //await loginPage.login('Admin', 'admin123');
    await loginPage.login(loginData.validLogin.username, loginData.validLogin.password);
    //await loginPage.verifyLoginSuccess();
    await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
});