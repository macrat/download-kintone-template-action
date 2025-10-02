# Download kintone template action

A GitHub Action to download [kintone](https://www.kintone.com/) app template.

GitHub Actionで[kintone](https://kintone.cybozu.co.jp/)のアプリテンプレートをダウンロードするためのアクション。


## Basic usage

```yaml
name: Download kintone app template
on: [push]

jobs:
  download:
    runs-on: ubuntu-latest
    steps:
      - name: Download kintone app template
        uses: macrat/download-kintone-template-action@v0
        with:
          base-url: ${{ secrets.KINTONE_BASE_URL }}
          username: ${{ secrets.KINTONE_USERNAME }}
          password: ${{ secrets.KINTONE_PASSWORD }}
          app-id: ${{ secrets.KINTONE_APP_ID }}

      - name: Upload as artifact
        uses: actions/upload-artifact@v4
        with:
          name: kintone-app-template
          path: ./template.zip
```


## Inputs

### `base-url` (required)

Base-url of your kintone (e.g. `https://example.cybozu.com`)

kintone環境のベースURL (例: `https://example.cybozu.com`)

### `app-id` (required)

kintone App ID.

kintoneアプリID。

### `username` / `password` (required)

Login username and password.

ログインユーザー名とパスワード。

### `basic-auth-username` / `basic-auth-password`

Basic Auth username and password.
If your kintone is protected by Basic Auth, you need to specify these.

Basic認証のユーザー名とパスワード。
kintoneがBasic認証で保護されている場合、これらを指定する必要があります。

### `name`

App name for displaying on kintone settings screen.

kintone設定画面に表示するアプリ名。

### `description`

App description for displaying on kintone settings screen.

kintone設定画面に表示するアプリの説明。

### `output` 

Path to save downloaded template zip file. (default: `./template.zip`)

ダウンロードしたテンプレートのzipファイルを保存するパス。(デフォルト: `./template.zip`)


## Examples

### Upload customize file, download template, and release

```yaml
name: Release
on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v5

      - name: Upload kintone customize file
        uses: macrat/upload-kintone-customize-action@v1
        with:
          base-url: ${{ secrets.KINTONE_BASE_URL }}
          app-id: ${{ secrets.KINTONE_APP_ID }}
          username: ${{ secrets.KINTONE_USERNAME }}
          password: ${{ secrets.KINTONE_PASSWORD }}
          desktop-js: ./src/desktop.js
          desktop-css: ./src/desktop.css

      - name: Download kintone app template
        uses: macrat/download-kintone-template-action@v0
        with:
          base-url: ${{ secrets.KINTONE_BASE_URL }}
          app-id: ${{ secrets.KINTONE_APP_ID }}
          username: ${{ secrets.KINTONE_USERNAME }}
          password: ${{ secrets.KINTONE_PASSWORD }}

      - name: Create Release
        run: |
          gh release create $GITHUB_REF_NAME ./template.zip --title $GITHUB_REF_NAME --generate-notes
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
