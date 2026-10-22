import {Page, Locator} from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly username: Locator;
    readonly password: Locator;
    readonly loginButton:Locator;


constructor(page: Page) {
    this.page = page;
    this.username = page.locator('input[name="username"]');
    this.password = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
}

async gotoLoginPage() {
    await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
}

async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click({ force: true });
}
async verifyLoginSuccess() {
    await this.page.waitForURL('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
    await this.page.waitForTimeout(2000);
}

}