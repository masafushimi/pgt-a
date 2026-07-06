const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

async function updateNote() {
    const noteUsername = 'tane_mayui438';
    try {
        console.log('--- note RSSの取得を開始します ---');
        const response = await fetch(`https://note.com/${noteUsername}/rss`);
        const xmlText = await response.text();
        
        const parser = new XMLParser({ ignoreAttributes: false });
        const jsonObj = parser.parse(xmlText);
        
        let items = jsonObj.rss?.channel?.item;
        if (!items) {
            console.error('RSSのitem要素が見つかりません。');
            process.exit(1);
        }
        
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
            
            let imgUrl = '';
            if (item['media:thumbnail']) {
                imgUrl = item['media:thumbnail']['#text'] || item['media:thumbnail']['@_url'] || item['media:thumbnail'];
            } else if (item['thumbnail']) {
                imgUrl = item['thumbnail']['#text'] || item['thumbnail']['@_url'] || item['thumbnail'];
            }
            
            if (!imgUrl || typeof imgUrl !== 'string') {
                const description = item.description || '';
                const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch && imgMatch[1]) {
                    imgUrl = imgMatch[1];
                }
            }
            
            if (!imgUrl || typeof imgUrl !== 'string') {
                imgUrl = 'https://placehold.co/600x338/f1f5f9/0b4c38?text=note';
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
        
        // 💡 【超重要：絶対の安全ガード】
        // 手動で直したきれいなHTMLがActions側に反映されていない（タグが見つからない）場合、
        // ファイルの書き換えを一切行わず、プロセスを「意図的なエラー(1)」として即座に終了させます。
        // これにより、最上部にねじ込まれるバグが100%発生しなくなります。
        if (!html.includes(startTag) || !html.includes(endTag)) {
            console.error('【安全ガード作動】index.html 内に目印タグが見つかりません。ファイルを破壊しないよう処理を中断します。');
            process.exit(1); 
        }
        
        const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`);
        const newHtml = html.replace(regex, `${startTag}${cardsHtml}${endTag}`);
        
        fs.writeFileSync('index.html', newHtml, 'utf8');
        console.log('--- index.html の書き換えに正常成功しました！ ---');
    } catch (error) {
        console.error('更新失敗:', error);
        process.exit(1);
    }
}
updateNote();
