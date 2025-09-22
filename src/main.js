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

  const host = new URL(baseUrl).host;

  await page.goto(
    `https://${host}/k/admin/app/flow?app=${appId}#section=settings`
  );

  // ログイン
  await page.type('input[name="username"]', username);
  await page.type('input[name="password"]', password);
  await page.click('input[type="submit"]');
  await page.waitForNavigation();

  // 「アプリをテンプレートとしてダウンロード」をクリック
  await page.click('button.gaia-argoui-admin-app-flow-settings-item-templatedownloaditem-button');
  await page.waitForSelector('button[name="ok"]', { visible: true });

  // テンプレート名と説明を入力
  if (appName) {
    await page.type(
      'input.gaia-argoui-admin-app-flow-settings-templatedownload-templatedownloaddialog-templatename-input',
      appName,
    );
  }
  if (appDescription) {
    await page.type(
      'textarea.gaia-argoui-admin-app-flow-settings-templatedownload-templatedownloaddialog-templatedescription-textarea',
      appDescription,
    );
  }

  // ダウンロードフォルダを準備
  const output = path.resolve(process.cwd(), downloadPath);
  await fs.mkdir(path.dirname(output), { recursive: true });

  // ダウンロード
  const download = page.waitForEvent('download');
  await page.click('button[name="ok"]');
  await (await download).saveAs(output);

  await browser.close();
})();
