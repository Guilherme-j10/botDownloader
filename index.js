const bot = require('puppeteer');
const ym = require('youtube-music-api');

const api = new ym();
const baseUrl = 'https://youtube.com/watch?v=';
const converterUrl = 'https://yt1s.com/youtube-to-mp3/pt';
(async()=>{

  await api.initalize();
  const browser = await bot.launch({ headless: false });

  try {

    let missing = [];
    let urls = [];
    const result = await api.getPlaylist('PL-RmX3NgwMKWANc-6qlHNGRrTtJbUQGZx');
    result.content.map(items => {
      if(items.videoId == ''){
        missing.push({
          nome: items.name,
          videoId: items.videoId
        });
      }else{
        urls.push(items.videoId !== '' ? `${baseUrl}${items.videoId}` : null);
      }
    });

    if(missing.length > 0){
      console.log("/**======= GUILHERME - BOT DOWNLOADER =======**/");
      console.log("================================================");
      console.log(`${missing.length} items não encontrados.`);
      missing.map((item, index) => {
        console.log(`(${index} - ${item.nome})`);
      })
      console.log("================================================");
    }

    let execute = 1;
    const returnData = () => {
      const data = new Date();
      if(execute == 1){
        return `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
      }else{
        return;
      }
    }

    const diffHour = (i, f, qtd) => {
      const log = (v) => console.log(v);
      const vd = (inicialMin, finalMin) => {
        let totalMin = Number(finalMin - inicialMin);
        return (Math.trunc(totalMin / 3600).toString() + ":" + Math.floor(totalMin / 60)+":"+(() => {
          const sub = (Number(i.split(':')[2]) - Number(f.split(':')[2]));
          if(sub < 0){
            return sub * -1;
          }else{
            return sub;
          }
        })());
      }
      let inicial = i;
      let final = f;
      let splInicial = inicial.split(":");
      let splFinal = final.split(":");
      let inicialMin = (Number(splInicial[0] * 3600)) + Number(splInicial[1] * 60) + Number(splInicial[2]);
      let finalMin = (Number(splFinal[0] * 3600)) + Number(splFinal[1] * 60) + Number(splFinal[2]);
      const t = vd(inicialMin, finalMin).split(':');
      if(t[1] !== 0){
        const h = ((qtd*t[1]) / 60).toFixed(2).split('.');
        log(`tempo total para finalização: ${h[0]}h ${Number(h[1]) + Number(t[2])}m`);
        log('================================================');
      }
    }
    
    const page = await browser.newPage();
    await page.goto('http://google.com'); 
    setTimeout(() => {
      (down = async (i) => {
        const initial = returnData();
        const pageScreen = await browser.newPage();
        await pageScreen.goto(converterUrl);
        await pageScreen.type('#s_input', `${urls[i]}`, { delay: 90 });
        setTimeout(async() => {
          await pageScreen.click('button.btn-red');
          setTimeout(async() => {
            await pageScreen.click('#asuccess');
            const final = returnData();
            if(execute == 1){
              diffHour(initial, final, urls.length);
              execute = 2;
            }
            console.log(`${i}.Baixado - ${urls[i]}`);
            await pageScreen.close();
            if(i > 0){
              --i;
              down(i);
            }else{
              browser.close();
            }
          }, 20000)
        }, 2000);
      })(urls.length-1);
    }, 20000)

  } catch (error) {
    console.log(error);
  }
})();
