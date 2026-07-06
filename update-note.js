const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

async function updateNote() {
    const noteUsername = 'tane_mayui438';
    try {
        const response = await fetch(`https://note.com/${noteUsername}/rss`);
        const xmlText = await response.text();
        
        const parser = new XMLParser({ ignoreAttributes: false });
        const jsonObj = parser.parse(xmlText);
        
        // 記事が1件だけか複数件かで配列の構造が変わる対策
        let items = jsonObj.rss.channel.item;
        if (!Array.isArray(items)) {
            items = [items];
        }
        
        let cardsHtml = '\n';
        const loopCount = Math.min(items.length, 10);
        
        for (let i = 0; i < loopCount; i++) {
            const item = items[i];
            if (!item) continue;
            
            const title = item.title;
            const link = item.link;
            let imgUrl = item['media:thumbnail']?.['#text'] || item['thumbnail'] || 'https://placehold.co/600x338/f1f5f9/0b4c38?text=note';
            if (typeof imgUrl === 'object') {
                imgUrl = imgUrl['@_url'] || 'https://placehold.co/600x338/f1f5f9/0b4c38?text=note';
            }

            cardsHtml += `            <a href="${link}" target="_blank" rel="noopener noreferrer" class="flex-shrink-0 w-[280px] md:w-[340px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition duration-300 snap-start group">
                <div class="aspect-[16/9] w-full bg-slate-100 overflow-hidden relative">
                    <img src="${imgUrl}" alt="${title}" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
                <div class="p-5 space-y-2">
                    <h3 class="text-sm md:text-base font-bold text-slate-800 line-clamp-2 group-hover:text-brand-orange transition duration-300">${title}</h3>
                    <p class="text-xs text-brand-orange font-semibold flex items-center gap-1 pt-2"><span>noteで読む</span></p>
                </div>
            </a>\n`;
        }
        cardsHtml += '            ';

        let html = fs.readFileSync('index.html', 'utf8');
        
        const startTag = '';
        const endTag = '';
        
        // 💡 密着していても、改行が入っていても100%確実に特定できるように検索処理を強化
        if (!html.includes(startTag) || !html.includes(endTag)) {
            console.error('エラー: HTML内に NOTE_START または NOTE_END が見つかりません。');
            process.exit(1);
        }
        
        const startIndex = html.indexOf(startTag) + startTag.length;
        const endIndex = html.indexOf(endTag);
        
        // タグの間の文字（古い記事カードなど）をそっくり入れ替える
        const newHtml = html.substring(0, startIndex) + cardsHtml + html.substring(endIndex);
        
        fs.writeFileSync('index.html', newHtml, 'utf8');
        console.log('note記事のスライダー更新に成功しました！');
    } catch (error) {
        console.error('更新失敗:', error);
        process.exit(1);
    }
}
updateNote();
