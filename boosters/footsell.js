module.exports = async (page, url, addLog) => {
    try {
        // 1. 페이지 로드
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 2000));

        // 2. 본문 렌더링 대기 (조회수 컨테이너 기준)
        await page.waitForSelector('#view_hit', { timeout: 15000 }).catch(() => {});

        // 3. 💡 봇 감지 우회를 위한 마우스 이동 액션 추가
        await page.mouse.move(100 + Math.random() * 300, 100 + Math.random() * 300);

        // 4. 💡 사람처럼 본문을 읽어 내리는 스크롤 액션 추가 (Intersection Observer 우회)
        await page.evaluate(async () => {
            const loops = 3 + Math.floor(Math.random() * 3); // 3~5회 무작위 반복
            for (let i = 0; i < loops; i++) {
                window.scrollBy({ top: 300 + Math.random() * 200, behavior: 'smooth' });
                // 스크롤 사이사이 랜덤 대기 (0.5초 ~ 1초)
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
        });

        // 5. 💡 비동기 핑(Ajax/Tracking)이 서버에 닿을 수 있도록 체류 시간 강제 유지
        const stayTime = 5000 + Math.floor(Math.random() * 3000); // 5~8초 체류
        if (typeof addLog === 'function') {
            addLog(`풋셀 본문 체류 중... (${(stayTime/1000).toFixed(1)}초)`);
        }
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        console.error("풋셀 부스터 모듈 에러:", e.message);
        return false;
    }
};