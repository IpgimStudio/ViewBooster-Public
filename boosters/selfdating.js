module.exports = async (page, url, addLog) => {
    try {
        // ✅ 1. 페이지 이동
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // 페이지 로드 후 약간의 안정화 대기
        await new Promise(r => setTimeout(r, 2000));

        // ✅ 2. 본문 영역(.con_post) 렌더링 대기
        // CSR(클라이언트 사이드 렌더링) 지연을 고려해 본문 요소가 나타날 때까지 대기합니다.
        await page.waitForSelector('.con_post', { timeout: 15000 }).catch(() => {});

        // ✅ 3. 인간다운 상호작용 (자연스러운 스크롤)
        await page.evaluate(async () => {
            const loops = 3 + Math.floor(Math.random() * 3); // 3~5회 반복
            for (let i = 0; i < loops; i++) {
                // 300px ~ 500px 사이로 랜덤하게 부드러운 스크롤 다운
                window.scrollBy({ top: 300 + Math.random() * 200, behavior: 'smooth' });
                // 스크롤 사이 0.5초 ~ 1초 대기
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
        });

        // ✅ 4. 체류 시간 확보 (조회수 어뷰징 방지 필터 우회 목적)
        // 7초 ~ 10초 사이의 랜덤한 체류 시간을 가집니다.
        const stayTime = 7000 + Math.floor(Math.random() * 3000);
        if (addLog) addLog(`[SELFDATING] 자연스러운 체류 중... (${(stayTime/1000).toFixed(1)}초)`);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (addLog) addLog(`[SELFDATING 모듈 에러]: ${e.message}`);
        console.error("남녀공학 부스터 모듈 에러:", e.message);
        return false;
    }
};