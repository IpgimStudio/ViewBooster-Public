module.exports = async (page, url, addLog) => {
    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        // 1. 페이지 로드 (충분히 기다림)
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // [중요] X는 리액트 렌더링이 늦습니다. 트윗이 완전히 뜰 때까지 대기
        await new Promise(r => setTimeout(r, 3000));

        const tweetSelector = 'article[data-testid="tweet"]';
        const isLoaded = await page.$(tweetSelector).catch(() => null);

        if (!isLoaded) {
            if (addLog) addLog("⚠️ [TWITTER] 트윗 본문 로드 실패 (로그인 풀림 또는 로딩 지연)");
            return false;
        }

        // 2. 조회수 핑(Ping) 전송을 위한 정밀 스크롤
        await page.evaluate(async (selector) => {
            const tweetElements = document.querySelectorAll(selector);
            if (tweetElements.length > 0) {
                const targetTweet = tweetElements[0];
                
                // 트윗을 화면 정중앙에 위치시킴
                targetTweet.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, tweetSelector);

        // 3. [가장 중요] 트윗을 보고 있는 상태로 최소 8초 이상 체류해야 뷰로 인정됨
        const stayTime = 8000 + Math.floor(Math.random() * 5000); 
        if (addLog) addLog(`[TWITTER] 트윗 열람 중... 뷰 인식 대기 (${(stayTime/1000).toFixed(1)}초)`);
        await new Promise(r => setTimeout(r, stayTime));

        // 4. 이탈 전 살짝 스크롤 (봇 탐지 회피용)
        await page.mouse.wheel({ deltaY: 200 });
        await new Promise(r => setTimeout(r, 1000));

        return true;
    } catch (e) {
        console.error("X(트위터) 부스터 모듈 에러:", e.message);
        return false;
    }
};