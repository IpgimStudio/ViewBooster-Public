module.exports = async (page, url) => {
    try {
        // 1. 페이지 로드
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 2000));

        // 2. 본문 렌더링 대기 (조회수 컨테이너 기준)
        await page.waitForSelector('#view_hit', { timeout: 15000 }).catch(() => {});

        // 3. 봇 감지 우회를 위한 사람과 유사한 스크롤 액션
        await page.evaluate(async () => {
            const loops = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < loops; i++) {
                window.scrollBy({ top: 300 + Math.random() * 200, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
        });

        // 4. 비동기 통신이 완료되도록 충분한 체류 시간 확보
        const stayTime = 5000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("풋셀 부스터 모듈 에러:", e.message);
        return false;
    }
};