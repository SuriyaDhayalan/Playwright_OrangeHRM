# PlayWright_learning

Playwright + TypeScript end-to-end tests for the OrangeHRM demo site:
https://opensource-demo.orangehrmlive.com (login: `Admin` / `admin123`).

## Project layout

```
playwright.config.ts      Projects, run order, globalSetup
global-setup.ts           Runs before every test run (new Employee Ids / Usernames)
TestData/
  loginData.json          Login test cases
  EmployeeData.json       Add Employee test cases (rewritten by global-setup.ts)
tests/
  Login_Test.spec.ts      Data-driven login tests
  Dashboard_Test.spec.ts  Dashboard + side-menu links, one shared browser window
  PIMS_Test.spec.ts       Data-driven Add Employee tests
  Pages/                  Page Object Model classes
    LoginPage.ts
    DashboardPage.ts
    PIMSModule.ts
```

## Run tests

```
npx playwright test                    # all projects
npx playwright test --project=login
npx playwright test --project=dashboard
npx playwright test --project=pims
npx playwright show-report
```

- Browser runs headed (`headless: false`), Desktop Chrome only.
- Reporter is `html`.

## Projects and run order (playwright.config.ts)

Each spec file has its own project, matched with `testMatch`:

| Project     | File                     | Depends on |
|-------------|--------------------------|------------|
| `login`     | `Login_Test.spec.ts`     | -          |
| `dashboard` | `Dashboard_Test.spec.ts` | `login`    |
| `pims`      | `PIMS_Test.spec.ts`      | `login`    |

A new spec file runs only if a project's `testMatch` matches its name. Add a project for every new spec file.

## Conventions

### Page Object Model

- One class per page in `tests/Pages/`, exported by name: `export class PIMSModule`.
- Locators are `readonly` fields, set in `constructor(page: Page)`. Spell it `constructor` (lowercase): a `Constructor` method never runs and leaves every locator undefined.
- Navigation methods: `gotoXxx()` = click or `page.goto(...)`, then `await this.page.waitForLoadState()`.
- Action methods take the test data object, e.g. `addEmployee(employee: EmployeeDetails)`.
- Prefer `getByRole` with `exact: true`. Scope side-menu links to `page.locator('aside')`.

### Data-driven tests (JSON in TestData/)

Every test case is one object in a flat JSON array, with these shared keys:

- `testName` - used as the Playwright test title
- `expected` - `"success"` or `"failure"`
- `errorMessage` - expected error text (failure cases only)
- `run` - only cases with `"run": true` are executed

Spec pattern:

```ts
import employeeData from '../TestData/EmployeeData.json';

const testCases = employeeData.filter(data => data.run === true);
test.describe.configure({ mode: 'default' });   // one by one, JSON order

for (const data of testCases) {
    test(data.testName, async ({page}) => {
        // ... act
        if (data.expected === 'success') { /* assert success */ }
        else { await expect(errorLocator).toHaveText(data.errorMessage!); }
    });
}
```

### Timeouts

The demo site is slow. Use `test.setTimeout(120000)` for long tests, and `{ timeout: 30000-60000 }` on URL assertions.

## OrangeHRM notes

### Login
- Inputs: `input[name="username"]`, `input[name="password"]`, `button[type="submit"]`.
- Success URL: `/web/index.php/dashboard/index`. Error text: `Invalid credentials`.

### Dashboard
- The Maintenance link opens a password page with no side menu. Call `page.goBack()` after it.
- My Info opens `/pim/viewPersonalDetails`.

### PIM - Add Employee (PIMSModule.ts)
- Path: side menu `PIM` -> top menu `Add Employee`.
- `firstName`, `middleName`, `lastName` inputs have a `name` attribute.
- Employee Id, Username and Password have no `name`. Find them by label:
  `page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).locator('input')`.
  Password / Confirm Password = `input[type="password"]` first / last.
- Create Login Details toggle: `.oxd-switch-input`. Status radio: `.oxd-radio-wrapper` filtered by `Enabled` / `Disabled`.
- Save succeeds when the URL changes to `/pim/viewPersonalDetails/empNumber/<n>`. Assert the URL, not the toast: the toast disappears fast.
- Field errors: `.oxd-input-field-error-message`. Known messages:
  `Required`, `Should not exceed 30 characters` (names), `Should not exceed 10 characters` (Employee Id),
  `Employee Id already exists`, `Should be at least 5 characters` (Username),
  `Should have at least 7 characters` (Password), `Passwords do not match`.

### Shared demo data - unique Employee Id / Username
The demo site is shared and keeps created employees. A reused Employee Id or Username fails with `Employee Id already exists` or `Username already exists`.

`global-setup.ts` runs before every `npx playwright test` and rewrites `TestData/EmployeeData.json`:
- `employeeId` = `E` + last 6 digits of `Date.now()` + 2-digit row number, e.g. `E24520501` (10 characters max).
- `username` = `firstname.lastname` + the same digits, lowercase.
- Values that are invalid on purpose are kept: Employee Id over 10 characters, Username under 5 characters.

So `EmployeeData.json` shows as changed in git after every run.

## Adding a new module test (checklist)

1. Add test data JSON in `TestData/` with `testName`, `expected`, `errorMessage`, `run`.
2. Add a Page Object in `tests/Pages/` with a lowercase `constructor`.
3. Add `tests/<Module>_Test.spec.ts`: log in in `beforeEach` (or `beforeAll` for one shared window), filter `run === true`, loop the cases.
4. Add a project in `playwright.config.ts` with `testMatch` and `dependencies: ['login']`.
5. If the module creates records on the demo site, make unique values in `global-setup.ts`.
