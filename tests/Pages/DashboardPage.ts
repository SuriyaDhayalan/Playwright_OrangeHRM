import {Page, Locator} from '@playwright/test';

 export class DashboardPage {
    readonly page: Page;
    readonly dashboardHeading: Locator;
    readonly adminLink: Locator;
    readonly PIMLink: Locator;
    readonly leaveLink: Locator;
    readonly timeLink: Locator;
    readonly recruitmentLink: Locator;
    readonly myInfoLink: Locator;
    readonly performanceLink: Locator;
    readonly directoryLink: Locator;
    readonly maintenanceLink: Locator;
    readonly claimLink: Locator;
    readonly buzzLink: Locator;


    constructor(page: Page) {
        this.page = page;
        this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
        // Menu links are looked up only inside the left side menu
        const sideMenu = page.locator('aside');
        this.adminLink = sideMenu.getByRole('link', { name: 'Admin', exact: true });
        this.PIMLink = sideMenu.getByRole('link', { name: 'PIM', exact: true });
        this.leaveLink = sideMenu.getByRole('link', { name: 'Leave', exact: true });
        this.timeLink = sideMenu.getByRole('link', { name: 'Time', exact: true });
        this.recruitmentLink = sideMenu.getByRole('link', { name: 'Recruitment', exact: true });
        this.myInfoLink = sideMenu.getByRole('link', { name: 'My Info', exact: true });
        this.performanceLink = sideMenu.getByRole('link', { name: 'Performance', exact: true });
        this.directoryLink = sideMenu.getByRole('link', { name: 'Directory', exact: true });
        this.maintenanceLink = sideMenu.getByRole('link', { name: 'Maintenance', exact: true });
        this.claimLink = sideMenu.getByRole('link', { name: 'Claim', exact: true });
        this.buzzLink = sideMenu.getByRole('link', { name: 'Buzz', exact: true });
    }

    async gotoDashboardPage() {
        await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
        await this.page.waitForLoadState();
    }
}
