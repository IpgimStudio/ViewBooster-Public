module.exports = async (page, url, addLog) => {
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 2000));

        // DVDPrime 본문 렌더링 대기 (본문 컨테이너)
        await page.waitForSelector('#resContents', { timeout: 15000 }).catch(() => {});

        // 인간다운 상호작용 (스크롤)
        await page.evaluate(async () => {
            const loops = 3 + Math.floor(Math.random() * 2);
            for (let i = 0; i < loops; i++) {
                window.scrollBy({ top: 250 + Math.random() * 200, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
            }
        });

        // 체류 시간 유지
        const stayTime = 5000 + Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, stayTime));

        return true;
    } catch (e) {
        if (addLog) addLog(`[DVDPRIME 에러]: ${e.message}`);
        return false;
    }
};