import { promises as fs } from 'node:fs';
import path from 'node:path';

import playwright from 'playwright';
import * as core from "@actions/core";

const baseUrl = core.getInput('base-url', { required: true });
const appId = core.getInput('app-id', { required: true });
const username = core.getInput('username', { required: true });
const password = core.getInput('password', { required: true });
const appName = core.getInput('name');
const appDescription = core.getInput('description');
const downloadPath = core.getInput('path') || './download.zip';

(async () => {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const host = new URL(baseUrl).host;

    core.info('Navigating to login page...');
    const url = `https://${host}/k/admin/app/flow?app=${appId}#section=settings`;
    core.debug(`URL: ${url}`);
    await page.goto(url);

    core.info('Logging in...');
    await page.type('input[name="username"]', username);
    await page.type('input[name="password"]', password);
    await page.click('input[type="submit"]');
    await page.waitForNavigation();

    core.info('Opening download dialog...');
    await page.click('button.gaia-argoui-admin-app-flow-settings-item-templatedownloaditem-button');
    await page.waitForSelector('button[name="ok"]');

    if (appName) {
      core.info(`Setting app name: ${appName}`);
      await page.type(
        'input.gaia-argoui-admin-app-flow-settings-templatedownload-templatedownloaddialog-templatename-input',
        appName,
      );
    }
    if (appDescription) {
      core.info(`Setting app description: ${appDescription}`);
      await page.type(
        'textarea.gaia-argoui-admin-app-flow-settings-templatedownload-templatedownloaddialog-templatedescription-textarea',
        appDescription,
      );
    }

    core.info('Preparing to download...');
    const output = path.resolve(process.cwd(), downloadPath);
    core.debug(`Download path: ${output}`);
    await fs.mkdir(path.dirname(output), { recursive: true });

    core.info('Downloading...');
    const download = page.waitForEvent('download');
    await page.click('button[name="ok"]');
    await (await download).saveAs(output);
  } catch (error) {
    core.setFailed(error.message);
    if (core.isDebug()) {
      console.log('Error details:');
      console.log(error.stack);
      await page.screenshot({ path: 'error.png' });
      const dataURL = await fs.readFile('error.png', { encoding: 'base64' }).then(data => `data:image/png;base64,${data}`);
      console.log('Screenshot saved as error.png');
      console.log(dataURL);
    }
  }

  await browser.close();
})();
