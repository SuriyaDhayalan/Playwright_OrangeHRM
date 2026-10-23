import {Page, Locator} from '@playwright/test';

export type EmployeeDetails = {
    firstName: string;
    middleName: string;
    lastName: string;
    employeeId: string;
    createLoginDetails: boolean;
    username?: string;
    password?: string;
    confirmPassword?: string;
    status?: string;
};

export class PIMSModule {
    readonly page: Page;
    readonly pimLink: Locator;
    readonly addEmployeeLink: Locator;
    readonly FirstNameInput: Locator;
    readonly MiddleNameInput: Locator;
    readonly LastNameInput: Locator;
    readonly EmployeeIdInput: Locator;
    readonly CreateLoginDetails: Locator;
    readonly UsernameInput: Locator;
    readonly PasswordInput: Locator;
    readonly ConfirmPasswordInput: Locator;
    readonly SaveButton: Locator;
    readonly SuccessToast: Locator;
    readonly FieldErrorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.pimLink = page.getByRole('link', { name: 'PIM', exact: true });
        this.addEmployeeLink = page.getByRole('link', { name: 'Add Employee', exact: true });
        this.FirstNameInput = page.locator('input[name="firstName"]');
        this.MiddleNameInput = page.locator('input[name="middleName"]');
        this.LastNameInput = page.locator('input[name="lastName"]');
        // Employee Id, Username and Password inputs have no name attribute, so find them by their label
        this.EmployeeIdInput = page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).locator('input');
        this.CreateLoginDetails = page.locator('.oxd-switch-input');
        this.UsernameInput = page.locator('.oxd-input-group').filter({ hasText: 'Username' }).locator('input');
        this.PasswordInput = page.locator('input[type="password"]').first();
        this.ConfirmPasswordInput = page.locator('input[type="password"]').last();
        this.SaveButton = page.getByRole('button', { name: 'Save' });
        this.SuccessToast = page.locator('.oxd-toast').filter({ hasText: 'Successfully Saved' });
        this.FieldErrorMessage = page.locator('.oxd-input-field-error-message');
    }

    async gotoPIMSModule() {
        await this.pimLink.click();
        await this.page.waitForLoadState();
    }
    async gotoAddEmployee() {
        await this.addEmployeeLink.click();
        await this.page.waitForLoadState();
    }

    async addEmployee(employee: EmployeeDetails) {
        await this.FirstNameInput.fill(employee.firstName);
        await this.MiddleNameInput.fill(employee.middleName);
        await this.LastNameInput.fill(employee.lastName);
        await this.EmployeeIdInput.fill(employee.employeeId);

        if (employee.createLoginDetails) {
            await this.CreateLoginDetails.click();
            await this.UsernameInput.fill(employee.username ?? '');
            await this.page.locator('.oxd-radio-wrapper').filter({ hasText: employee.status ?? 'Enabled' }).locator('label').click();
            await this.PasswordInput.fill(employee.password ?? '');
            await this.ConfirmPasswordInput.fill(employee.confirmPassword ?? '');
        }

        await this.SaveButton.click();
    }
}
