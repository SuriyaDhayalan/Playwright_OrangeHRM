import {test, expect} from '@playwright/test';
import {LoginPage} from './Pages/LoginPage';

test('Login Test', async ({page}) => {
    const loginPage = new LoginPage(page);
    await loginPage.gotoLoginPage();
    await loginPage.login('Admin', 'admin123');
    await loginPage.verifyLoginSuccess();
});