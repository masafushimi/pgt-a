const fs = require('fs');
const { XMLParser } = require('fast-xml-parser'); // nodeでXMLをパースする用

async function updateNote() {
    const noteUsername = 'tane_mayui438';
    try {
        const response = await fetch(`https://note.com/${noteUsername}/rss`);
        const xmlText = await response.text();

        // XMLのパース
        const parser = new XMLParser({ ignoreAttributes: false });
        const jsonObj = parser.parse(xmlText);
        const items = jsonObj.rss.channel.item;

        // 最新の数件（最大10件）を取得してHTML文字列を生成
        let cardsHtml = '';
        const loopCount = Math.min(items.length, 10);

        for (let i = 0; i < loopCount; i++) {
            const item = items[i];
            const title = item.title;
            const link = item.link;
            // サムネイルURLの取得（環境によってキーが変わるため安全に取得）
            let imgUrl = item['media:thumbnail']?.['#text'] || item['thumbnail'] || 'https://placehold.co/600x338/f1f5f9/0b4c38?text=note';

            cardsHtml += `
            <a href="${link}" target="_blank" rel="noopener noreferrer" class="flex-shrink-0 w-[280px] md:w-[340px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition duration-300 snap-start group">
                <div class="aspect-[16/9] w-full bg-slate-100 overflow-hidden relative">
                    <img src="${imgUrl}" alt="${title}" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
                <div class="p-5 space-y-2">
                    <h3 class="text-sm md:text-base font-bold text-slate-800 line-clamp-2 group-hover:text-brand-orange transition duration-300">${title}</h3>
                    <p class="text-xs text-brand-orange font-semibold flex items-center gap-1 pt-2"><span>noteで読む</span></p>
                </div>
            </a>`;
        }

        // index.htmlの特定の場所を書き換える
        let html = fs.readFileSync('index.html', 'utf8');
        // <div id="noteSlider"...> 〜 </div> の中身を置換する目印をHTMLに入れておく必要があります
        const startTag = '';
        const endTag = '';

        const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`);
        html = html.replace(regex, `${startTag}${cardsHtml}${endTag}`);

        fs.writeFileSync('index.html', html, 'utf8');
        console.log('noteの更新に成功しました。');
    } catch (error) {
        console.error('更新失敗:', error);
        process.exit(1);
    }
}
updateNote();
