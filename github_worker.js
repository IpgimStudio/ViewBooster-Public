const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');

// 요청하신 13개 커뮤니티 모듈만 유지
const runInstiz = require('./boosters/instiz');
const runTheqoo = require('./boosters/theqoo');
const runPpomppu = require('./boosters/ppomppu');
const runQuasarzone = require('./boosters/quasarzone');
const runArcalive = require('./boosters/arcalive');
const runDogdrip = require('./boosters/dogdrip');
const runDimitory = require('./boosters/dimitory');
const runEomisae = require('./boosters/eomisae');
const runDealbada = require('./boosters/dealbada');
const runTe31 = require('./boosters/te');
const runZod = require('./boosters/zod');
const runDasaja = require('./boosters/dasaja');
const runDeokjil = require('./boosters/deokjil');
const runFootsell = require('./boosters/footsell');

const stealth = StealthPlugin();
stealth.enabledEvasions.delete('user-agent-override');
puppeteer.use(stealth);

// 13개 커뮤니티 매핑 정보만 유지
const boosters = {
    INSTIZ: runInstiz, 
    THEQOO: runTheqoo, 
    PPOMPPU: runPpomppu,
    QUASARZONE: runQuasarzone, 
    ARCALIVE: runArcalive, 
    DOGDRIP: runDogdrip, 
    DIMITORY: runDimitory, 
    EOMISAE: runEomisae, 
    DEALBADA: runDealbada, 
    TE31: runTe31, 
    ZOD: runZod,
    DASAJA: runDasaja, 
    DEOKJIL: runDeokjil,
    FOOTSELL: runFootsell
};

async function start() {
    const targetUrl = process.argv[2];
    const siteType = process.argv[3];
    const totalCount = parseInt(process.argv[4] || "0");
    const userId = process.argv[5] || "UnknownUser"; 
    const delay = parseInt(process.argv[6] || "5", 10);
    const workerId = parseInt(process.env.WORKER_ID || "1");

    if (!targetUrl || totalCount <= 0) {
        console.log(`[${userId}] 실행 조건 미충족. 종료.`);
        process.exit(0);
    }

    let myIterations = Math.floor(totalCount / 20);
    if (workerId <= (totalCount % 20)) {
        myIterations += 1;
    }

    if (myIterations <= 0) {
        console.log(`[${userId}][Worker ${workerId}] 할당량 없음.`);
        process.exit(0);
    }

    console.log(`🚀 [사용자: ${userId}] 워커 ${workerId} 가동 (대상: ${siteType}, 목표: ${myIterations}회)`);

    const launchBrowser = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                return await puppeteer.launch({
                    executablePath: '/usr/bin/google-chrome',
                    headless: "new",
                    timeout: 60000, 
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-blink-features=AutomationControlled',
                        '--window-size=1280,800',
                        '--disable-gpu',
                        '--no-first-run',
                        '--js-flags="--max-old-space-size=512"'
                    ]
                });
            } catch (e) {
                console.log(`[${userId}][Retry ${i+1}] 브라우저 실행 실패: ${e.message}`);
                if (i === retries - 1) throw e;
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    };

    const browser = await launchBrowser();

    try {
        for (let i = 1; i <= myIterations; i++) {
            try {
                const now = new Date().toLocaleTimeString('ko-KR');
                console.log(`[${now}] [${userId}][W${workerId}] 진행: ${i}/${myIterations}`);

                let context = await browser.createIncognitoBrowserContext().catch(() => browser);
                const page = await (context === browser ? browser.newPage() : context.newPage());
                
                page.setDefaultNavigationTimeout(45000);
                page.setDefaultNavigationTimeout(45000);

                // 무작위 UA 대신 신뢰도 높은 최신 Chrome UA 고정 사용 (Stealth 플러그인과 궁합이 좋음)
                await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

                // 우회를 위한 기본 헤더 추가
                await page.setExtraHTTPHeaders({
                    'referer': 'https://www.google.com/',
                    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
                });

                await page.setRequestInterception(true);
                page.on('request', (req) => {
                    const url = req.url();
                    const type = req.resourceType();
                    const allowedDomains = ['naver.com', 'naver.net', 'daum.net', 'daumcdn.net', 'kakao.com', 'nate.com'];
                    if (allowedDomains.some(domain => url.includes(domain))) return req.continue();
                    if (['image', 'font', 'media'].includes(type)) return req.abort();
                    req.continue();
                });

                const runBooster = boosters[siteType];
                if (runBooster) {
                    await runBooster(page, targetUrl, (msg) => 
                        console.log(`[${userId}][W${workerId}] ${msg}`)
                    ).catch(e => {
                        console.log(`[${userId}][W${workerId}] 시도 실패: ${e.message}`);
                    });
                } else {
                    console.log(`[${userId}][W${workerId}] 미지원 사이트: ${siteType}`);
                    break; 
                }
                
                if (context !== browser) await context.close().catch(() => {});
                else await page.close().catch(() => {});

                await new Promise(r => setTimeout(r, (delay * 1000) + Math.random() * 2000));

            } catch (iterationError) {
                console.error(`[${userId}][W${workerId}] 에러 발생:`, iterationError.message);
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    } catch (e) {
        console.error(`[${userId}][W${workerId}] 치명적 에러:`, e.message);
    } finally {
        if (browser) await browser.close().catch(() => {});
        console.log(`🏁 [${userId}][W${workerId}] 작업 완료 및 종료.`);
        process.exit(0);
    }
}

start();