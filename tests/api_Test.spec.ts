import {test, expect} from '@playwright/test';
import loginData from '../TestData/loginData.json';

const baseUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php';
const loginUrl = `${baseUrl}/auth/login`;
const validateUrl = `${baseUrl}/auth/validate`;

test('API Test - GET Login Page', async ({request}) => {
    test.setTimeout(60000);
    const response = await request.get(loginUrl, { timeout: 30000 });

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('text/html');

    const responseBody = await response.text();
    expect(responseBody).toContain('<auth-login');
    expect(responseBody).toContain('OrangeHRM');
});

const testCases = loginData.filter(data => data.run === true);

for (const data of testCases) {
    test(`API Test - POST Login - ${data.testName}`, async ({request}) => {
        test.setTimeout(60000);

        // GET the login page first: it sets the session cookie and holds the CSRF token
        const loginPage = await request.get(loginUrl, { timeout: 30000 });
        expect(loginPage.status()).toBe(200);
        const token = (await loginPage.text()).match(/:token="&quot;(.+?)&quot;"/)?.[1];
        expect(token).toBeTruthy();

        // POST the login form; do not follow the redirect so its target can be checked
        const response = await request.post(validateUrl, {
            form: { _token: token!, username: data.username, password: data.password },
            maxRedirects: 0,
            timeout: 30000,
        });

        expect(response.status()).toBe(302);
        if (data.expected === 'success') {
            expect(response.headers()['location']).toContain('/dashboard/index');
        } else {
            expect(response.headers()['location']).toContain('/auth/login');
        }
    });
}
