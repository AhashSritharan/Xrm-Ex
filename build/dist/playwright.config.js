import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (!fs.existsSync(__dirname + '/playwright/.auth/user.json'))
    fs.writeFileSync(__dirname + '/playwright/.auth/user.json', '{}', 'utf8');
export const STORAGE_STATE = 'playwright/.auth/user.json';
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },
    /* Configure projects for major browsers */
    projects: [
        { name: 'setup', testMatch: /.*\.setup\.ts/ },
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: STORAGE_STATE
            },
            dependencies: ['setup'],
        },
        /*
    
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
    
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
        */
        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },
        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],
    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheXdyaWdodC5jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9wbGF5d3JpZ2h0LmNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3pELE9BQU8sS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3pCLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQ3BDLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDM0MsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLDZCQUE2QixDQUFDO0lBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsNkJBQTZCLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3pJLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyw0QkFBNEIsQ0FBQztBQUMxRDs7R0FFRztBQUNILGVBQWUsWUFBWSxDQUFDO0lBQzFCLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLG9DQUFvQztJQUNwQyxhQUFhLEVBQUUsSUFBSTtJQUNuQixpRkFBaUY7SUFDakYsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7SUFDNUIsc0JBQXNCO0lBQ3RCLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9CLHNDQUFzQztJQUN0QyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztJQUN2QyxxRUFBcUU7SUFDckUsUUFBUSxFQUFFLE1BQU07SUFDaEIsd0dBQXdHO0lBQ3hHLEdBQUcsRUFBRTtRQUNILDZEQUE2RDtRQUM3RCxvQ0FBb0M7UUFFcEMsK0ZBQStGO1FBQy9GLEtBQUssRUFBRSxnQkFBZ0I7S0FDeEI7SUFFRCwyQ0FBMkM7SUFDM0MsUUFBUSxFQUFFO1FBQ1IsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUU7UUFDN0M7WUFDRSxJQUFJLEVBQUUsVUFBVTtZQUNoQixHQUFHLEVBQUU7Z0JBQ0gsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzVCLFlBQVksRUFBRSxhQUFhO2FBQzVCO1lBQ0QsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDO1NBQ3hCO1FBQ0Q7Ozs7Ozs7Ozs7O1VBV0U7UUFFRixvQ0FBb0M7UUFDcEMsSUFBSTtRQUNKLDJCQUEyQjtRQUMzQixvQ0FBb0M7UUFDcEMsS0FBSztRQUNMLElBQUk7UUFDSiwyQkFBMkI7UUFDM0Isc0NBQXNDO1FBQ3RDLEtBQUs7UUFFTCxvQ0FBb0M7UUFDcEMsSUFBSTtRQUNKLDRCQUE0QjtRQUM1Qiw0REFBNEQ7UUFDNUQsS0FBSztRQUNMLElBQUk7UUFDSiwyQkFBMkI7UUFDM0IsOERBQThEO1FBQzlELEtBQUs7S0FDTjtJQUVELHlEQUF5RDtJQUN6RCxlQUFlO0lBQ2YsOEJBQThCO0lBQzlCLGtDQUFrQztJQUNsQywwQ0FBMEM7SUFDMUMsS0FBSztDQUNOLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZUNvbmZpZywgZGV2aWNlcyB9IGZyb20gJ0BwbGF5d3JpZ2h0L3Rlc3QnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoX19maWxlbmFtZSk7XG5pZiAoIWZzLmV4aXN0c1N5bmMoX19kaXJuYW1lICsgJy9wbGF5d3JpZ2h0Ly5hdXRoL3VzZXIuanNvbicpKSBmcy53cml0ZUZpbGVTeW5jKF9fZGlybmFtZSArICcvcGxheXdyaWdodC8uYXV0aC91c2VyLmpzb24nLCAne30nLCAndXRmOCcpO1xuZXhwb3J0IGNvbnN0IFNUT1JBR0VfU1RBVEUgPSAncGxheXdyaWdodC8uYXV0aC91c2VyLmpzb24nO1xuLyoqXG4gKiBTZWUgaHR0cHM6Ly9wbGF5d3JpZ2h0LmRldi9kb2NzL3Rlc3QtY29uZmlndXJhdGlvbi5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgdGVzdERpcjogJy4vdGVzdHMnLFxuICAvKiBSdW4gdGVzdHMgaW4gZmlsZXMgaW4gcGFyYWxsZWwgKi9cbiAgZnVsbHlQYXJhbGxlbDogdHJ1ZSxcbiAgLyogRmFpbCB0aGUgYnVpbGQgb24gQ0kgaWYgeW91IGFjY2lkZW50YWxseSBsZWZ0IHRlc3Qub25seSBpbiB0aGUgc291cmNlIGNvZGUuICovXG4gIGZvcmJpZE9ubHk6ICEhcHJvY2Vzcy5lbnYuQ0ksXG4gIC8qIFJldHJ5IG9uIENJIG9ubHkgKi9cbiAgcmV0cmllczogcHJvY2Vzcy5lbnYuQ0kgPyAyIDogMCxcbiAgLyogT3B0IG91dCBvZiBwYXJhbGxlbCB0ZXN0cyBvbiBDSS4gKi9cbiAgd29ya2VyczogcHJvY2Vzcy5lbnYuQ0kgPyAxIDogdW5kZWZpbmVkLFxuICAvKiBSZXBvcnRlciB0byB1c2UuIFNlZSBodHRwczovL3BsYXl3cmlnaHQuZGV2L2RvY3MvdGVzdC1yZXBvcnRlcnMgKi9cbiAgcmVwb3J0ZXI6ICdodG1sJyxcbiAgLyogU2hhcmVkIHNldHRpbmdzIGZvciBhbGwgdGhlIHByb2plY3RzIGJlbG93LiBTZWUgaHR0cHM6Ly9wbGF5d3JpZ2h0LmRldi9kb2NzL2FwaS9jbGFzcy10ZXN0b3B0aW9ucy4gKi9cbiAgdXNlOiB7XG4gICAgLyogQmFzZSBVUkwgdG8gdXNlIGluIGFjdGlvbnMgbGlrZSBgYXdhaXQgcGFnZS5nb3RvKCcvJylgLiAqL1xuICAgIC8vIGJhc2VVUkw6ICdodHRwOi8vMTI3LjAuMC4xOjMwMDAnLFxuXG4gICAgLyogQ29sbGVjdCB0cmFjZSB3aGVuIHJldHJ5aW5nIHRoZSBmYWlsZWQgdGVzdC4gU2VlIGh0dHBzOi8vcGxheXdyaWdodC5kZXYvZG9jcy90cmFjZS12aWV3ZXIgKi9cbiAgICB0cmFjZTogJ29uLWZpcnN0LXJldHJ5JyxcbiAgfSxcblxuICAvKiBDb25maWd1cmUgcHJvamVjdHMgZm9yIG1ham9yIGJyb3dzZXJzICovXG4gIHByb2plY3RzOiBbXG4gICAgeyBuYW1lOiAnc2V0dXAnLCB0ZXN0TWF0Y2g6IC8uKlxcLnNldHVwXFwudHMvIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2Nocm9taXVtJyxcbiAgICAgIHVzZToge1xuICAgICAgICAuLi5kZXZpY2VzWydEZXNrdG9wIENocm9tZSddLFxuICAgICAgICBzdG9yYWdlU3RhdGU6IFNUT1JBR0VfU1RBVEVcbiAgICAgIH0sXG4gICAgICBkZXBlbmRlbmNpZXM6IFsnc2V0dXAnXSxcbiAgICB9LFxuICAgIC8qXG5cbiAgICB7XG4gICAgICBuYW1lOiAnZmlyZWZveCcsXG4gICAgICB1c2U6IHsgLi4uZGV2aWNlc1snRGVza3RvcCBGaXJlZm94J10gfSxcbiAgICB9LFxuXG4gICAge1xuICAgICAgbmFtZTogJ3dlYmtpdCcsXG4gICAgICB1c2U6IHsgLi4uZGV2aWNlc1snRGVza3RvcCBTYWZhcmknXSB9LFxuICAgIH0sXG4gICAgKi9cblxuICAgIC8qIFRlc3QgYWdhaW5zdCBtb2JpbGUgdmlld3BvcnRzLiAqL1xuICAgIC8vIHtcbiAgICAvLyAgIG5hbWU6ICdNb2JpbGUgQ2hyb21lJyxcbiAgICAvLyAgIHVzZTogeyAuLi5kZXZpY2VzWydQaXhlbCA1J10gfSxcbiAgICAvLyB9LFxuICAgIC8vIHtcbiAgICAvLyAgIG5hbWU6ICdNb2JpbGUgU2FmYXJpJyxcbiAgICAvLyAgIHVzZTogeyAuLi5kZXZpY2VzWydpUGhvbmUgMTInXSB9LFxuICAgIC8vIH0sXG5cbiAgICAvKiBUZXN0IGFnYWluc3QgYnJhbmRlZCBicm93c2Vycy4gKi9cbiAgICAvLyB7XG4gICAgLy8gICBuYW1lOiAnTWljcm9zb2Z0IEVkZ2UnLFxuICAgIC8vICAgdXNlOiB7IC4uLmRldmljZXNbJ0Rlc2t0b3AgRWRnZSddLCBjaGFubmVsOiAnbXNlZGdlJyB9LFxuICAgIC8vIH0sXG4gICAgLy8ge1xuICAgIC8vICAgbmFtZTogJ0dvb2dsZSBDaHJvbWUnLFxuICAgIC8vICAgdXNlOiB7IC4uLmRldmljZXNbJ0Rlc2t0b3AgQ2hyb21lJ10sIGNoYW5uZWw6ICdjaHJvbWUnIH0sXG4gICAgLy8gfSxcbiAgXSxcblxuICAvKiBSdW4geW91ciBsb2NhbCBkZXYgc2VydmVyIGJlZm9yZSBzdGFydGluZyB0aGUgdGVzdHMgKi9cbiAgLy8gd2ViU2VydmVyOiB7XG4gIC8vICAgY29tbWFuZDogJ25wbSBydW4gc3RhcnQnLFxuICAvLyAgIHVybDogJ2h0dHA6Ly8xMjcuMC4wLjE6MzAwMCcsXG4gIC8vICAgcmV1c2VFeGlzdGluZ1NlcnZlcjogIXByb2Nlc3MuZW52LkNJLFxuICAvLyB9LFxufSk7XG4iXX0=