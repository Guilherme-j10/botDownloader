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
      console.log("===========================================");
      console.log(`${missing.length} items não encontrados.`);
      missing.map((item, index) => {
        console.log(`(${index} - ${item.nome})`);
      })
      console.log("===========================================");
    }
    
    const page = await browser.newPage();
    await page.goto('http://google.com'); 
    setTimeout(() => {
      (down = async (i) => {
        const pageScreen = await browser.newPage();
        await pageScreen.goto(converterUrl);
        await pageScreen.type('#s_input', `${urls[i]}`, { delay: 90 });
        setTimeout(async() => {
          await pageScreen.click('button.btn-red');
          setTimeout(async() => {
            await pageScreen.click('#asuccess');
            console.log(`${i}.Baixado - ${urls[i]}`);
            await pageScreen.close();
            if(i > 0){
              --i;
              down(i);
            }
          }, 20000)
        }, 2000);
      })(urls.length-1);
    }, 20000) 

  } catch (error) {
    console.log(error);
  }
})();
