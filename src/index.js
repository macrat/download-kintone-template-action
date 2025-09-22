import { promises as fs } from 'node:fs';
import path from 'node:path';

import playwright from 'playwright';

const {
  BASE_URL,
  APP_ID,
  APP_NAME,
  APP_DESCRIPTION,
  OUTPUT_PATH,
  USERNAME,
  PASSWORD,
  BASIC_AUTH_USERNAME,
  BASIC_AUTH_PASSWORD
} = process.env;

if (!BASE_URL || !APP_ID || !OUTPUT_PATH || !USERNAME || !PASSWORD) {
  console.error('Missing required environment variables. Please set BASE_URL, APP_ID, OUTPUT_PATH, USERNAME, and PASSWORD.');
  process.exit(1);
}

(async () => {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const host = new URL(BASE_URL).host;
    const auth = BASIC_AUTH_USERNAME && BASIC_AUTH_PASSWORD ? `${BASIC_AUTH_USERNAME}:${BASIC_AUTH_PASSWORD}@` : '';

    console.log('Navigating to login page...');
    const url = `https://${auth}${host}/k/admin/app/flow?app=${APP_ID}#section=settings`;
    console.debug(`URL: ${url}`);
    await page.goto(url);

    console.log('Logging in...');
    await page.type('input[name="username"]', USERNAME);
    await page.type('input[name="password"]', PASSWORD);
    await page.click('input[type="submit"]');
    await page.waitForNavigation();

    console.log('Opening download dialog...');
    await page.click('button.gaia-argoui-admin-app-flow-settings-item-templatedownloaditem-button');
    await page.waitForSelector('button[name="ok"]');

    if (APP_NAME) {
      console.log(`Setting app name: ${APP_NAME}`);
      await page.type(
        'input.gaia-argoui-admin-app-flow-settings-templatedownload-templatedownloaddialog-templatename-input',
        APP_NAME,
      );
    }
    if (APP_DESCRIPTION) {
      console.log(`Setting app description: ${APP_DESCRIPTION}`);
      await page.type(
        'textarea.gaia-argoui-admin-app-flow-settings-templatedownload-templatedownloaddialog-templatedescription-textarea',
        APP_DESCRIPTION,
      );
    }

    console.log('Preparing to download...');
    const output = path.resolve(process.cwd(), OUTPUT_PATH);
    console.debug(`Download path: ${output}`);
    await fs.mkdir(path.dirname(output), { recursive: true });

    console.log('Downloading...');
    const download = page.waitForEvent('download');
    await page.click('button[name="ok"]');
    await (await download).saveAs(output);
  } catch (error) {
    console.error('An error occurred:', error);
    console.debug(error.stack);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
