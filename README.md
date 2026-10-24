# PlayWright_learning

End-to-end and API tests for the [OrangeHRM demo site](https://opensource-demo.orangehrmlive.com), written with Playwright and TypeScript.

Login for the demo site: `Admin` / `admin123`.

## What is tested

| Area      | Spec file                      | Type | What it checks |
|-----------|--------------------------------|------|----------------|
| Login     | `tests/Login_Test.spec.ts`     | UI   | Valid and invalid logins from `TestData/loginData.json` |
| Dashboard | `tests/Dashboard_Test.spec.ts` | UI   | Dashboard and every side-menu link, in one browser window |
| PIM       | `tests/PIMS_Test.spec.ts`      | UI   | Add Employee cases from `TestData/EmployeeData.json` |
| API       | `tests/api_Test.spec.ts`       | API  | GET of the login page, and POST login with the cases from `loginData.json` |

## Setup

You need Node.js (LTS version).

```
npm install
npx playwright install chromium
```

## Run the tests

```
npx playwright test                      # all projects
npx playwright test --project=login
npx playwright test --project=dashboard
npx playwright test --project=pims
npx playwright test --project=api
npx playwright show-report               # open the HTML report
```

- UI tests open a visible Chrome window (`headless: false`).
- API tests do not open a browser.
- The report is written to `playwright-report/`.

## Project structure

```
playwright.config.ts      Projects, run order, globalSetup
global-setup.ts           Runs before every test run, makes new Employee Ids / Usernames
TestData/
  loginData.json          Login test cases (UI and API)
  EmployeeData.json       Add Employee test cases (rewritten by global-setup.ts)
tests/
  Login_Test.spec.ts
  Dashboard_Test.spec.ts
  PIMS_Test.spec.ts
  api_Test.spec.ts
  Pages/                  Page Object Model classes
    LoginPage.ts
    DashboardPage.ts
    PIMSModule.ts
```

## Run order

Each spec file has its own project in `playwright.config.ts`.

| Project     | Depends on |
|-------------|------------|
| `login`     | -          |
| `dashboard` | `login`    |
| `pims`      | `login`    |
| `api`       | -          |

`dashboard` and `pims` run only when all `login` tests pass.

A new spec file runs only when a project's `testMatch` matches its file name. Add a project for every new spec file.

## Test data

Tests are data-driven. Each JSON file in `TestData/` is a flat array of test cases with these shared keys:

| Key            | Meaning |
|----------------|---------|
| `testName`     | Test title in the report |
| `expected`     | `"success"` or `"failure"` |
| `errorMessage` | Expected error text (failure cases only) |
| `run`          | Only cases with `"run": true` are executed |

To turn a case on or off, change its `run` value.

## Unique employee data

The demo site is shared, and it keeps every employee that is created. A reused Employee Id or Username fails with `Employee Id already exists` or `Username already exists`.

To prevent this, `global-setup.ts` runs before every test run and rewrites `TestData/EmployeeData.json` with new values:

- `employeeId` = `E` + last 6 digits of `Date.now()` + 2-digit row number, e.g. `E24520501`
- `username` = `firstname.lastname` + the same digits, in lowercase

Values that are invalid on purpose (Employee Id over 10 characters, Username under 5 characters) are kept.

Because of this, `EmployeeData.json` shows as changed in git after every run.

## API login

The API login test does not use the login form. It sends the same requests as the browser:

1. `GET /web/index.php/auth/login`. The response sets the session cookie and contains a CSRF token in `<auth-login :token="...">`.
2. `POST /web/index.php/auth/validate` with the form fields `_token`, `username` and `password`.

The server answers with `302` (redirect) for valid and invalid logins. The test reads the `location` header to see the result:

- Valid login: `location` contains `/dashboard/index`.
- Invalid login: `location` contains `/auth/login`.

## Notes

- The demo site is slow. Long tests use `test.setTimeout(120000)`, and URL assertions use a 30-60 second timeout.
- Other people use the demo site at the same time, so its data can change between runs.
