import {test, expect, Page} from '@playwright/test';
import {LoginPage} from './Pages/LoginPage';
import {DashboardPage} from './Pages/DashboardPage.ts';
import loginData from '../TestData/loginData.json';

// All tests in this file share ONE browser window, in order:
// login -> dashboard -> verify links -> click every link
test.describe.configure({ mode: 'serial' });

test.describe('Dashboard Tests', () => {
    let page: Page;
    let dashboardPage: DashboardPage;

    // Open one window and log in once; the window stays open for every test below
    test.beforeAll(async ({browser}) => {
        page = await browser.newPage();
        dashboardPage = new DashboardPage(page);

        const validLogin = loginData.find(data => data.expected === 'success')!;
        const loginPage = new LoginPage(page);
        await loginPage.gotoLoginPage();
        await loginPage.login(validLogin.username, validLogin.password);
    });

    // Close the window only after all dashboard tests are finished
    test.afterAll(async () => {
        await page.close();
    });

    test('Login redirects to Dashboard', async () => {
        await expect(page).toHaveURL(/dashboard\/index/, { timeout: 30000 });
        await expect(dashboardPage.dashboardHeading).toBeVisible();
    });

    test('Verify Dashboard Page Elements', async () => {
        await expect(dashboardPage.adminLink).toBeVisible();
        await expect(dashboardPage.PIMLink).toBeVisible();
        await expect(dashboardPage.leaveLink).toBeVisible();
        await expect(dashboardPage.timeLink).toBeVisible();
        await expect(dashboardPage.recruitmentLink).toBeVisible();
        await expect(dashboardPage.myInfoLink).toBeVisible();
        await expect(dashboardPage.performanceLink).toBeVisible();
        await expect(dashboardPage.directoryLink).toBeVisible();
        await expect(dashboardPage.maintenanceLink).toBeVisible();
        await expect(dashboardPage.claimLink).toBeVisible();
        await expect(dashboardPage.buzzLink).toBeVisible();
    });

    test('Click all menu links', async () => {
        test.setTimeout(120000);

        // Each menu link, in menu order, with the URL part its page should open
        const menuLinks = [
            { link: dashboardPage.adminLink, url: /\/admin\// },
            { link: dashboardPage.PIMLink, url: /\/pim\// },
            { link: dashboardPage.leaveLink, url: /\/leave\// },
            { link: dashboardPage.timeLink, url: /\/time\// },
            { link: dashboardPage.recruitmentLink, url: /\/recruitment\// },
            { link: dashboardPage.myInfoLink, url: /\/pim\/viewPersonalDetails/ },
            { link: dashboardPage.performanceLink, url: /\/performance\// },
            { link: dashboardPage.directoryLink, url: /\/directory\// },
            { link: dashboardPage.maintenanceLink, url: /\/maintenance\// },
            { link: dashboardPage.claimLink, url: /\/claim\// },
            { link: dashboardPage.buzzLink, url: /\/buzz\// },
        ];

        for (const menu of menuLinks) {
            await menu.link.click();
            await expect(page).toHaveURL(menu.url, { timeout: 30000 });

            // Maintenance opens a password page without the side menu, so go back
            if (menu.link === dashboardPage.maintenanceLink) {
                await page.goBack();
            }
        }
    });
})
