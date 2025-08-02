// フォーム要素の取得
const form = document.getElementById('promptForm');
const resultSection = document.getElementById('result');
const generatedPromptTextarea = document.getElementById('generatedPrompt');
const generateBtn = document.querySelector('.generate-btn');

// フォーム送信イベントリスナー
form.addEventListener('submit', function(e) {
    e.preventDefault();
    generatePrompt();
});

// プロンプト生成関数
function generatePrompt() {
    // ローディング状態の設定
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    generateBtn.textContent = 'プロンプト';
    
    // クリアボタンも無効化
    const clearButtons = document.querySelectorAll('.clear-btn');
    clearButtons.forEach(btn => btn.disabled = true);
    
    // 入力値の取得
    const formData = new FormData(form);
    const inputs = {
        theme: formData.get('theme'),
        target: formData.get('target'),
        color: formData.get('color'),
        content: formData.get('content'),
        font: formData.get('font'),
        animation: formData.get('animation'),
        pages: formData.get('pages'),
        contact: formData.get('contact'),
        images: formData.get('images'),
        keywords: formData.get('keywords'),
        memo: formData.get('memo')
    };

    // 入力値の検証
    if (!inputs.theme.trim()) {
        showNotification('ホームページのテーマを入力してください', 'error');
        // ローディング状態の解除
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
        generateBtn.textContent = 'プロンプト生成';
        clearButtons.forEach(btn => btn.disabled = false);
        return;
    }

    // AI生成の通知
    showNotification('プロンプト生成中...', 'info');
    
    // プロンプト生成処理（非同期）
    setTimeout(async () => {
        try {
            const prompt = await buildPrompt(inputs);
            displayResult(prompt);
            
            // 成功通知
            showNotification('AIプロンプトの生成が完了しました！', 'success');
            
        } catch (error) {
            console.error('プロンプト生成エラー:', error);
            showNotification('プロンプト生成中にエラーが発生しました', 'error');
        } finally {
            // ローディング状態の解除
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
            generateBtn.textContent = 'プロンプト';
            
            // クリアボタンも有効化
            clearButtons.forEach(btn => btn.disabled = false);
        }
    }, 500);
}

// Gemini APIを使用したプロンプト生成（非同期）
async function buildPrompt(inputs) {
    try {
        // OpenAI APIでプロンプトを生成
        const aiPrompt = await generateWithOpenAI(inputs);
        return aiPrompt;
    } catch (error) {
        console.error('OpenAI APIエラー:', error);
        showNotification('AI生成に失敗しました。従来の方式で生成します。', 'error');
        // フォールバックとして従来のロジックを使用
        return buildPromptFallback(inputs);
    }
}

// OpenAI APIでプロンプト生成
async function generateWithOpenAI(inputs) {
    // ユーザー入力を構造化
    const userRequirements = formatUserRequirements(inputs);
    
    // OpenAI用のシステムプロンプト
    const systemPrompt = `あなたはWebサイト制作の専門家です。ユーザーから提供された要件を基に、Windsurfで使用可能な詳細で実用的なホームページ制作プロンプトを生成してください。

以下の形式で出力してください：

## 基本コンセプト・世界観
- **テーマ**: [キーワードに基づいたテーマ]
- **ターゲット**: [ターゲット層の詳細]
- **サイト名**: [提案するサイト名]
- **キャッチコピー**: [魅力的なキャッチコピー]

## デザイン・UI/UX詳細仕様
### カラーパレット
- **メインカラー**: [具体的な色とカラーコード]
- **アクセントカラー**: [具体的な色とカラーコード]
- **テキストカラー**: [読みやすい色の提案]
- **背景**: [背景の質感や色の提案]

### フォント・タイポグラフィ
- **メインフォント**: [具体的なフォント名]
- **見出し**: [サイズと重要度の指定]
- **本文**: [読みやすさを考慮した設定]

### アイコン・イラスト要素
- **モチーフ**: [テーマに合ったモチーフの提案]
- **スタイル**: [デザインスタイルの詳細]

### アニメーション仕様
[具体的なアニメーション効果の提案]

## ページ構成・コンテンツ詳細
[各ページの構成と内容を詳細に]

## 技術実装詳細
### HTML構造
### CSS設計
### JavaScript機能
### SEO・パフォーマンス対策

## 追加提案・考慮事項
[ターゲットに応じた配慮事項]

## 実装指示
[Windsurfでの実装に関する具体的な指示]

ユーザーの要件を深く理解し、実用的で詳細なプロンプトを生成してください。`;
    
    const userPrompt = `以下のユーザー要件に基づいてプロンプトを生成してください：

${userRequirements}`;
    
    // OpenAI API呼び出し
    const response = await callOpenAI(systemPrompt, userPrompt);
    return response;
}

// ユーザー要件をフォーマット
function formatUserRequirements(inputs) {
    let requirements = '';
    
    if (inputs.theme) {
        requirements += `**ホームページのテーマ**: ${inputs.theme}\n`;
    }
    
    if (inputs.target) {
        requirements += `**ターゲット層**: ${inputs.target}\n`;
    }
    
    if (inputs.color) {
        requirements += `**カラー・雰囲気**: ${inputs.color}\n`;
    }
    
    if (inputs.content) {
        requirements += `**掲載したい情報**: ${inputs.content}\n`;
    }
    
    if (inputs.font) {
        requirements += `**フォント・スタイル**: ${inputs.font}\n`;
    }
    
    if (inputs.animation) {
        requirements += `**アニメーション**: ${inputs.animation}\n`;
    }
    
    if (inputs.pages) {
        requirements += `**ページ構成**: ${inputs.pages}\n`;
    }
    
    if (inputs.contact) {
        requirements += `**お問い合わせ導線**: ${inputs.contact}\n`;
    }
    
    if (inputs.images) {
        requirements += `**画像・アイコンの雰囲気**: ${inputs.images}\n`;
    }
    
    if (inputs.keywords) {
        requirements += `**世界観・キーワード**: ${inputs.keywords}\n`;
    }
    
    if (inputs.memo) {
        requirements += `**その他の要望**: ${inputs.memo}\n`;
    }
    
    return requirements;
}

// OpenAI API呼び出し関数
async function callOpenAI(systemPrompt, userPrompt) {
    try {
        const response = await fetch(CONFIG.OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                max_tokens: CONFIG.MAX_TOKENS,
                temperature: CONFIG.TEMPERATURE
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else {
            throw new Error('Invalid API response format');
        }
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
    }
}

// フォールバック用の従来のプロンプト生成
function buildPromptFallback(inputs) {
    // サイト名とキャッチコピーの自動生成
    const siteInfo = generateSiteInfo(inputs.theme, inputs.keywords);
    
    let prompt = `${inputs.target}をターゲットとした${inputs.theme}のホームページを作成してください。\n\n`;
    
    // 基本コンセプト・世界観
    prompt += "## 基本コンセプト・世界観\n";
    prompt += `- **テーマ**: ${inputs.keywords || '温かみ、親しみやすさ、信頼感'}\n`;
    prompt += `- **ターゲット**: ${inputs.target}\n`;
    prompt += `- **サイト名**: 「${siteInfo.siteName}」（提案）\n`;
    prompt += `- **キャッチコピー**: 「${siteInfo.catchCopy}」\n\n`;
    
    // デザイン・UI/UX詳細仕様
    prompt += "## デザイン・UI/UX詳細仕様\n\n";
    
    // カラーパレット
    const colorPalette = generateColorPalette(inputs.color, inputs.keywords);
    prompt += "### カラーパレット\n";
    prompt += `- **メインカラー**: ${colorPalette.main}\n`;
    prompt += `- **アクセントカラー**: ${colorPalette.accent}\n`;
    prompt += `- **テキストカラー**: ${colorPalette.text}\n`;
    prompt += `- **背景**: ${colorPalette.background}\n\n`;
    
    // フォント・タイポグラフィ
    const fontInfo = generateFontInfo(inputs.font, inputs.target);
    prompt += "### フォント・タイポグラフィ\n";
    prompt += `- **メインフォント**: ${fontInfo.main}\n`;
    prompt += `- **見出し**: ${fontInfo.heading}\n`;
    prompt += `- **本文**: ${fontInfo.body}\n`;
    if (fontInfo.special) {
        prompt += `- **特記事項**: ${fontInfo.special}\n`;
    }
    prompt += "\n";
    
    // アイコン・イラスト要素
    const iconInfo = generateIconInfo(inputs.images, inputs.keywords);
    prompt += "### アイコン・イラスト要素\n";
    prompt += `- **モチーフ**: ${iconInfo.motifs}\n`;
    prompt += `- **スタイル**: ${iconInfo.style}\n\n`;
    
    // アニメーション仕様
    const animationInfo = generateAnimationInfo(inputs.animation, inputs.keywords);
    prompt += "### アニメーション仕様\n";
    animationInfo.forEach(anim => {
        prompt += `- **${anim.element}**: ${anim.description}\n`;
    });
    prompt += "\n";
    
    // ページ構成・コンテンツ詳細
    prompt += "## ページ構成・コンテンツ詳細\n\n";
    const pageStructure = generatePageStructure(inputs.pages, inputs.content, inputs.theme);
    pageStructure.forEach((page, index) => {
        prompt += `### ${index + 1}. ${page.name}\n`;
        page.sections.forEach(section => {
            prompt += `- **${section.title}**: ${section.description}\n`;
        });
        prompt += "\n";
    });
    
    // 技術実装詳細
    prompt += "## 技術実装詳細\n\n";
    
    // HTML構造
    prompt += "### HTML構造\n";
    prompt += "```html\n";
    prompt += "- セマンティックHTML5タグの適切な使用\n";
    prompt += "- <main>, <section>, <article>, <aside>の構造化\n";
    prompt += "- 見出しタグ（h1-h6）の階層的使用\n";
    prompt += "- alt属性の充実（スクリーンリーダー対応）\n";
    prompt += "- lang属性の設定（日本語対応）\n";
    prompt += "```\n\n";
    
    // CSS設計
    prompt += "### CSS設計\n";
    prompt += "- **設計手法**: BEM記法またはCSS Modules\n";
    prompt += "- **レスポンシブ**: Mobile First設計\n";
    prompt += "- **ブレークポイント**: \n";
    prompt += "  - スマートフォン: ~768px\n";
    prompt += "  - タブレット: 768px-1024px\n";
    prompt += "  - PC: 1024px~\n";
    prompt += `- **フォント読み込み**: ${fontInfo.loading}\n`;
    prompt += "- **アニメーション**: CSS3 transform, transition使用\n\n";
    
    // JavaScript機能
    const jsFeatures = generateJSFeatures(inputs.content, inputs.animation);
    prompt += "### JavaScript機能\n";
    jsFeatures.forEach(feature => {
        prompt += `- **${feature.name}**: ${feature.description}\n`;
    });
    prompt += "\n";
    
    // SEO・パフォーマンス対策
    prompt += "### SEO・パフォーマンス対策\n";
    prompt += "- **メタタグ**: title, description, OGP設定\n";
    prompt += "- **構造化データ**: JSON-LD形式で適切なschema設定\n";
    prompt += "- **画像最適化**: WebP形式、適切なサイズ設定\n";
    prompt += "- **Core Web Vitals**: LCP, FID, CLS の最適化\n";
    prompt += "- **サイトマップ**: XML sitemap生成\n\n";
    
    // 追加提案・考慮事項
    const additionalConsiderations = generateAdditionalConsiderations(inputs.target, inputs.theme);
    prompt += "## 追加提案・考慮事項\n\n";
    additionalConsiderations.forEach(consideration => {
        prompt += `### ${consideration.title}\n`;
        consideration.items.forEach(item => {
            prompt += `- **${item.name}**: ${item.description}\n`;
        });
        prompt += "\n";
    });
    
    // お問い合わせ導線
    if (inputs.contact) {
        prompt += "### お問い合わせ導線\n";
        prompt += `- **配置**: ${inputs.contact}\n`;
        prompt += "- **デザイン**: 目立ちすぎず、でも見つけやすい位置に配置\n";
        prompt += "- **フォーム**: 入力しやすく、送信完了まで分かりやすい導線\n\n";
    }
    
    if (inputs.memo) {
        prompt += "## 追加要件・メモ\n";
        prompt += `${inputs.memo}\n\n`;
    }
    
    prompt += "## 実装指示\n";
    prompt += "上記の詳細仕様に基づいて、ターゲットユーザーのニーズを満たす高品質なホームページを作成してください。";
    prompt += "ユーザビリティとアクセシビリティを重視し、コンテンツの魅力が十分に伝わるサイトにしてください。";
    
    return prompt;
}



// 結果表示関数
function displayResult(prompt) {
    generatedPromptTextarea.value = prompt;
    resultSection.style.display = 'block';
    
    // 結果セクションまでスクロール
    resultSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// プロンプトコピー関数
function copyPrompt() {
    const promptText = generatedPromptTextarea.value;
    
    // クリップボードにコピー
    navigator.clipboard.writeText(promptText).then(() => {
        // コピー成功の視覚的フィードバック
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        
        copyBtn.textContent = 'コピー完了！';
        copyBtn.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '#28a745';
        }, 2000);
        
    }).catch(err => {
        console.error('コピーに失敗しました:', err);
        
        // フォールバック: テキストエリアを選択状態にする
        generatedPromptTextarea.select();
        generatedPromptTextarea.setSelectionRange(0, 99999);
        
        alert('プロンプトが選択されました。Ctrl+C（Mac: Cmd+C）でコピーしてください。');
    });
}

// 入力値の保存・復元機能（オプション）
function saveFormData() {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    localStorage.setItem('promptGeneratorData', JSON.stringify(data));
}

function loadFormData() {
    const savedData = localStorage.getItem('promptGeneratorData');
    
    if (savedData) {
        const data = JSON.parse(savedData);
        
        for (let [key, value] of Object.entries(data)) {
            const element = form.elements[key];
            if (element && value) {
                element.value = value;
            }
        }
    }
}

// フォームの入力値が変更されたときに自動保存
form.addEventListener('input', saveFormData);

// ページ読み込み時に保存されたデータを復元
document.addEventListener('DOMContentLoaded', loadFormData);

// エンターキーでの送信を防止（テキストエリア以外）
form.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});

// ===== ヘルパー関数群 =====

// サイト名とキャッチコピーの自動生成
function generateSiteInfo(theme, keywords) {
    const themeWords = theme.toLowerCase();
    const keywordList = keywords ? keywords.split(/[、,，]/).map(k => k.trim()) : [];
    
    let siteName = '';
    let catchCopy = '';
    
    // テーマに基づいたサイト名生成
    if (themeWords.includes('絵本')) {
        siteName = 'ゆめのえほんのもり';
        catchCopy = 'こころあたたまる ゆめいっぱいの えほんたち';
    } else if (themeWords.includes('カフェ') || themeWords.includes('喫茶')) {
        siteName = 'ほっとカフェ';
        catchCopy = 'あなたの心に寄り添う、特別なひととき';
    } else if (themeWords.includes('美容') || themeWords.includes('エステ')) {
        siteName = 'ビューティーガーデン';
        catchCopy = 'あなたらしい美しさを、一緒に見つけましょう';
    } else if (themeWords.includes('教室') || themeWords.includes('スクール')) {
        siteName = 'まなびのひろば';
        catchCopy = '新しい自分に出会える場所';
    } else {
        // 汎用的な生成
        const firstKeyword = keywordList[0] || 'やさしさ';
        siteName = `${firstKeyword}の${theme.replace(/サイト|ホームページ|HP/g, '')}`;
        catchCopy = `${firstKeyword}あふれる、心地よい時間をお届けします`;
    }
    
    return { siteName, catchCopy };
}

// カラーパレット生成
function generateColorPalette(colorInput, keywords) {
    const keywordList = keywords ? keywords.toLowerCase() : '';
    const colorText = colorInput ? colorInput.toLowerCase() : '';
    
    let palette = {
        main: '',
        accent: '',
        text: '濃いブラウン (#5D4037) - 目に優しく読みやすい',
        background: '紙の質感を表現した温かみのあるテクスチャ'
    };
    
    // キーワードや色指定に基づいた色選択
    if (keywordList.includes('ファンタジー') || keywordList.includes('魔法')) {
        palette.main = 'パステルピンク (#FFE4E6)、クリーム色 (#FFF8DC)';
        palette.accent = 'やわらかい水色 (#E6F3FF)、薄紫 (#F0E6FF)';
    } else if (keywordList.includes('北欧') || keywordList.includes('ナチュラル')) {
        palette.main = '白 (#FFFFFF)、ベージュ (#F5F5DC)';
        palette.accent = 'ソフトグリーン (#E8F5E8)、ライトグレー (#F8F8F8)';
    } else if (colorText.includes('青') || colorText.includes('ブルー')) {
        palette.main = 'ライトブルー (#E3F2FD)、ホワイト (#FFFFFF)';
        palette.accent = 'ネイビー (#1565C0)、アクアブルー (#00BCD4)';
    } else if (colorText.includes('緑') || colorText.includes('グリーン')) {
        palette.main = 'ライトグリーン (#E8F5E8)、クリーム (#FFFEF7)';
        palette.accent = 'フォレストグリーン (#2E7D32)、イエローグリーン (#8BC34A)';
    } else {
        // デフォルト（温かみのある色合い）
        palette.main = 'ソフトベージュ (#FAF0E6)、オフホワイト (#FEFEFE)';
        palette.accent = 'ウォームピンク (#FFE4E1)、ライトブラウン (#D2B48C)';
    }
    
    return palette;
}

// フォント情報生成
function generateFontInfo(fontInput, target) {
    const targetText = target ? target.toLowerCase() : '';
    const fontText = fontInput ? fontInput.toLowerCase() : '';
    
    let fontInfo = {
        main: '',
        heading: '',
        body: '',
        loading: '',
        special: ''
    };
    
    // ターゲットに基づいたフォント選択
    if (targetText.includes('子ども') || targetText.includes('主婦')) {
        fontInfo.main = "'Kosugi Maru', 'Hiragino Kaku Gothic ProN' - 丸みのある優しいフォント";
        fontInfo.heading = '大きめサイズ（24px-32px）、ひらがな中心';
        fontInfo.body = '16px以上、行間1.8で読みやすく';
        fontInfo.loading = 'Google Fonts（Kosugi Maru）';
        fontInfo.special = '小学校低学年レベルまで、難しい漢字にはふりがな';
    } else if (targetText.includes('ビジネス') || targetText.includes('企業')) {
        fontInfo.main = "'Noto Sans JP', 'Hiragino Kaku Gothic ProN' - 信頼感のあるフォント";
        fontInfo.heading = 'ボールド（600-700）、24px-36px';
        fontInfo.body = '16px、行間1.6で読みやすく';
        fontInfo.loading = 'Google Fonts（Noto Sans JP）';
    } else {
        // 汎用的な設定
        fontInfo.main = "'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif";
        fontInfo.heading = '見出し用：20px-28px、ウェイト500-600';
        fontInfo.body = '本文用：16px、行間1.7';
        fontInfo.loading = 'システムフォント優先、Webフォント補完';
    }
    
    return fontInfo;
}

// アイコン・イラスト情報生成
function generateIconInfo(imageInput, keywords) {
    const keywordList = keywords ? keywords.toLowerCase() : '';
    const imageText = imageInput ? imageInput.toLowerCase() : '';
    
    let iconInfo = {
        motifs: '',
        style: ''
    };
    
    // キーワードに基づいたモチーフ選択
    if (keywordList.includes('ファンタジー') || keywordList.includes('魔法')) {
        iconInfo.motifs = '雲、星、森、木、花、虹、うさぎ、ねこ、ことり、ちょうちょ、きらきら、ハート、魔法の杖';
        iconInfo.style = '手書き風SVGアイコン、線画+パステル塗り';
    } else if (keywordList.includes('北欧') || keywordList.includes('ナチュラル')) {
        iconInfo.motifs = '木、葉っぱ、花、鳥、家、コーヒーカップ、本';
        iconInfo.style = 'ミニマルなライン画、シンプルで洗練されたデザイン';
    } else if (keywordList.includes('ビジネス') || keywordList.includes('企業')) {
        iconInfo.motifs = 'チェックマーク、矢印、グラフ、人物シルエット、建物';
        iconInfo.style = 'モダンでクリーンなアイコン、単色またはグラデーション';
    } else {
        // 汎用的な設定
        iconInfo.motifs = '花、葉っぱ、ハート、星、チェックマーク';
        iconInfo.style = '親しみやすく、分かりやすいデザイン';
    }
    
    return iconInfo;
}

// アニメーション情報生成
function generateAnimationInfo(animationInput, keywords) {
    const keywordList = keywords ? keywords.toLowerCase() : '';
    
    let animations = [];
    
    if (keywordList.includes('ファンタジー') || keywordList.includes('魔法')) {
        animations = [
            { element: '雲', description: 'ゆっくりと左右に揺れる（3-5秒周期）' },
            { element: '星', description: 'ランダムに瞬く（opacity 0.5-1.0）' },
            { element: 'ページ遷移', description: 'フェードイン・アウト（0.5秒）' },
            { element: 'ボタンホバー', description: 'ふわっと浮き上がる効果' },
            { element: 'スクロール', description: 'パララックス効果で背景要素がゆっくり動く' }
        ];
    } else if (keywordList.includes('ビジネス') || keywordList.includes('企業')) {
        animations = [
            { element: 'ページ遷移', description: 'スムーズなスライド（0.3秒）' },
            { element: 'ボタンホバー', description: '色変化とわずかな拡大（0.2秒）' },
            { element: 'スクロール', description: 'コンテンツのフェードイン表示' }
        ];
    } else {
        // 汎用的な設定
        animations = [
            { element: 'ページ遷移', description: 'ソフトなフェード効果（0.4秒）' },
            { element: 'ボタンホバー', description: '優しい色変化と軽い浮き上がり' },
            { element: 'スクロール', description: 'コンテンツが下から上にスライドイン' }
        ];
    }
    
    return animations;
}

// ページ構成生成
function generatePageStructure(pagesInput, contentInput, theme) {
    const themeText = theme.toLowerCase();
    let pages = [];
    
    if (themeText.includes('絵本')) {
        pages = [
            {
                name: 'トップページ',
                sections: [
                    { title: 'ヒーローセクション', description: 'メインビジュアル（森の中の絵本を読む親子のイラスト）、サイトタイトル・キャッチコピー、「えほんをさがす」ボタン' },
                    { title: 'おすすめえほん', description: '3-4冊のピックアップ表示' },
                    { title: 'あたらしいえほん', description: '最新追加された絵本' },
                    { title: 'みんなのこえ', description: '読者レビューのハイライト' }
                ]
            },
            {
                name: 'えほんしょうかい（絵本一覧・詳細）',
                sections: [
                    { title: '絵本カード表示', description: '表紙画像、タイトル、対象年齢、簡単なあらすじ、「くわしくみる」ボタン' },
                    { title: '絞り込み機能', description: '年齢別、ジャンル別、テーマ別' },
                    { title: '絵本詳細ページ', description: '大きな表紙画像、あらすじ（100-150文字）、対象年齢・読み聞かせ時間、作者・出版社情報' }
                ]
            },
            {
                name: 'つくったひと（制作者紹介）',
                sections: [
                    { title: 'プロフィール', description: '温かみのある手書き風フレーム、自己紹介文' },
                    { title: '制作への想い', description: '絵本に込めた願い' },
                    { title: '制作過程', description: 'イラスト制作風景の写真' }
                ]
            }
        ];
    } else if (themeText.includes('カフェ')) {
        pages = [
            {
                name: 'トップページ',
                sections: [
                    { title: 'ヒーローセクション', description: '店内の温かい雰囲気の写真、店名・キャッチコピー' },
                    { title: 'おすすめメニュー', description: '人気商品の紹介' },
                    { title: '店舗情報', description: '営業時間・アクセス・雰囲気' }
                ]
            },
            {
                name: 'メニュー',
                sections: [
                    { title: 'ドリンクメニュー', description: 'コーヒー、紅茶、その他ドリンク' },
                    { title: 'フードメニュー', description: 'ケーキ、軽食、季節限定メニュー' }
                ]
            }
        ];
    } else {
        // 汎用的なページ構成
        pages = [
            {
                name: 'トップページ',
                sections: [
                    { title: 'ヒーローセクション', description: 'メインビジュアル、サイトタイトル・キャッチコピー、メインCTA' },
                    { title: 'サービス紹介', description: '主要なサービス・商品の概要' },
                    { title: 'お客様の声', description: '利用者の感想・レビュー' }
                ]
            },
            {
                name: 'サービス詳細',
                sections: [
                    { title: 'サービス一覧', description: '提供するサービスの詳細説明' },
                    { title: '料金体系', description: '分かりやすい料金表示' }
                ]
            }
        ];
    }
    
    // お問い合わせページを追加
    pages.push({
        name: 'おといあわせ',
        sections: [
            { title: '連絡フォーム', description: 'お名前、メールアドレス、お問い合わせ内容' },
            { title: 'よくあるしつもん', description: 'FAQ形式' },
            { title: 'SNSリンク', description: 'Instagram、Twitter等のソーシャルメディア' }
        ]
    });
    
    return pages;
}

// JavaScript機能生成
function generateJSFeatures(contentInput, animationInput) {
    let features = [
        { name: 'スムーススクロール', description: 'ナビゲーション連動' },
        { name: '画像遅延読み込み', description: 'Intersection Observer API' },
        { name: 'フォームバリデーション', description: 'リアルタイム入力チェック' }
    ];
    
    if (contentInput && contentInput.includes('感想')) {
        features.push({ name: '感想投稿', description: 'LocalStorage活用（デモ用）' });
    }
    
    if (contentInput && (contentInput.includes('検索') || contentInput.includes('絞り込み'))) {
        features.push({ name: '検索・フィルタリング', description: 'コンテンツの動的表示' });
    }
    
    return features;
}

// 追加考慮事項生成
function generateAdditionalConsiderations(target, theme) {
    const targetText = target ? target.toLowerCase() : '';
    const themeText = theme.toLowerCase();
    
    let considerations = [
        {
            title: 'アクセシビリティ',
            items: [
                { name: 'カラーコントラスト', description: 'WCAG AA準拠' },
                { name: 'キーボードナビゲーション', description: 'Tab順序の最適化' },
                { name: '音声読み上げ', description: 'aria-label, aria-describedby設定' }
            ]
        }
    ];
    
    if (targetText.includes('子ども') || targetText.includes('主婦')) {
        considerations.push({
            title: '子ども・家族向け配慮',
            items: [
                { name: 'ボタンサイズ', description: 'タップしやすい大きさ（44px以上）' },
                { name: '誤操作防止', description: '確認ダイアログの実装' },
                { name: '文字サイズ', description: 'ユーザーが拡大可能' }
            ]
        });
    }
    
    if (targetText.includes('主婦') || targetText.includes('女性')) {
        considerations.push({
            title: '女性ユーザー向け機能',
            items: [
                { name: 'SNS連携', description: 'Instagram、Pinterest等での共有機能' },
                { name: 'お気に入り機能', description: '気になる商品・情報の保存' },
                { name: 'レビュー・口コミ', description: '他のユーザーの意見を参考にできる仕組み' }
            ]
        });
    }
    
    return considerations;
}

// ===== クリア機能 =====

// 入力内容をクリア
function clearInputs() {
    // 確認ダイアログを表示
    if (confirm('入力した内容をすべてクリアします。よろしいですか？')) {
        // すべての入力フィールドをクリア
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.value = '';
        });
        
        // LocalStorageから保存されたデータを削除
        localStorage.removeItem('promptGeneratorData');
        
        // 視覚的フィードバック
        showNotification('入力内容をクリアしました', 'success');
        
        // フォーカスを最初の入力欄に移動
        document.getElementById('theme').focus();
    }
}

// 生成結果をクリア
function clearResult() {
    if (resultSection.style.display === 'none' || !generatedPromptTextarea.value) {
        showNotification('クリアする結果がありません', 'info');
        return;
    }
    
    if (confirm('生成されたプロンプトを削除します。よろしいですか？')) {
        // 結果エリアを非表示
        resultSection.style.display = 'none';
        
        // テキストエリアをクリア
        generatedPromptTextarea.value = '';
        
        // 視覚的フィードバック
        showNotification('生成結果をクリアしました', 'success');
    }
}

// 通知表示機能
function showNotification(message, type = 'info') {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 通知要素を作成
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // スタイルを設定
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // タイプ別の背景色設定
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'info':
        default:
            notification.style.backgroundColor = '#17a2b8';
            break;
    }
    
    // DOMに追加
    document.body.appendChild(notification);
    
    // アニメーションで表示
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 3秒後に自動で非表示
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
