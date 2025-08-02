# Windsurf ホームページ生成プロンプト作成ツール

ユーザーが入力したホームページのテーマや構成情報から、Windsurfで使える詳細で構造化されたホームページ生成用プロンプトを自動生成するWebアプリケーションです。

## 機能

- **入力フォーム**: ホームページのテーマ、ターゲット層、カラー、掲載情報など11項目の詳細設定
- **AI生成**: OpenAI GPT-3.5-turboを使用した動的プロンプト生成
- **フォールバック**: API失敗時の従来ロジックによる詳細プロンプト生成
- **UI機能**: 入力内容の自動保存・復元、コピー機能、クリア機能、通知表示

## セットアップ

### 1. APIキーの設定

`config.js`ファイルでOpenAI APIキーを設定してください：

```javascript
const CONFIG = {
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE', // 実際のAPIキーに置き換えてください
    // ...
};
```

### 2. ローカルサーバーの起動

```bash
# プロジェクトディレクトリに移動
cd HP-prompt-generator

# Pythonの簡易サーバーを起動
python3 -m http.server 8000

# ブラウザでアクセス
# http://localhost:8000
```

## 使用方法

1. **テーマ入力**: ホームページのメインテーマを入力
2. **詳細設定**: ターゲット層、カラー、フォント、アニメーション等を設定
3. **プロンプト生成**: 「プロンプト生成」ボタンをクリック
4. **結果確認**: 生成されたプロンプトを確認・コピー

## 技術仕様

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **API**: OpenAI Chat Completions API (GPT-3.5-turbo)
- **レスポンシブ対応**: モバイル・タブレット・デスクトップ
- **ブラウザサポート**: モダンブラウザ対応

## ファイル構成

```
HP-prompt-generator/
├── index.html          # メインHTML
├── style.css           # スタイルシート
├── script.js           # メインJavaScript
├── config.js           # API設定
└── README.md           # このファイル
```

## 注意事項

- OpenAI APIキーは環境変数での管理を推奨
- APIキーをコードに直接記述しないよう注意
- 本番環境では適切なセキュリティ対策を実施

## ライセンス

MIT License
