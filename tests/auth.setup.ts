import { test as setup } from '@playwright/test';
import fs from 'fs';
import * as process from 'process';

setup('authenticate', async ({ playwright, request }) => {
    let env: CRMConfig = process.env.ENV_VAR_JSON
        ? JSON.parse(process.env.ENV_VAR_JSON)
        : await loadJson();

    const userAuthFile = 'playwright/.auth/user.json';
    const browser = await playwright.chromium.launch();

    const context = await browser.newContext({ storageState: userAuthFile });
    const page = await context.newPage();
    await page.goto(env.CRM_URL);
    let url = page.url();
    if (url.includes('login.microsoftonline.com')) {
        await page.getByRole('textbox').type(env.USER_NAME);
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByPlaceholder('Password').type(env.USER_PASSWORD);
        await page.getByRole('button', { name: 'Sign in' }).click();
        await page.getByRole('button', { name: 'No' }).click();
    }
    await page.context().storageState({ path: userAuthFile });
    await context.close();
});
export interface CRMConfig {
    CRM_URL: string;
    USER_NAME: string;
    USER_PASSWORD: string;
    CONTACT_RECORD_URL: string;
}
export async function loadJson() {
    try {
        return await import('../playwright.env.json');
    } catch (error) {
        console.error('Could not load JSON', error);
    }
}