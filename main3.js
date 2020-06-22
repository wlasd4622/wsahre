let axios = require('axios')
let fs = require('fs')
let cheerio = require('cheerio')




async function getShateInfo() {
  let catchData = JSON.parse((fs.readFileSync('./catch/main3.json').toString() || '{}'))
  let list = JSON.parse(fs.readFileSync('./temp/list.json'));
  for (let i = 0; i < list.length; i++) {
    const code = list[i].split(',')[0];
    console.log(`${i + 1}/${list.length}`);
    if (!catchData[code]) {
      let r = await axios.get(`http://fund.eastmoney.com/${code}.html`)
      let $ = cheerio.load(r.data)
      let shareList = [];
      let type = $('.fundDetail-tit').text();
      let 基金规模 = parseFloat($('.infoOfFund td:contains(基金规模)').text().split('：')[1].split('（')[0])
      $('#position_shares tbody tr').map((i, item) => {
        if (i > 0) {
          let name = $($(item).find('td')[0]).text().trim();
          let 持仓占比 = $($(item).find('td')[1]).text().trim();
          shareList.push({ name, 持仓占比, type, 基金规模 })
        }
      });
      catchData[code] = shareList;
      fs.writeFileSync('./catch/main3.json', JSON.stringify(catchData))
    }
  }
}

function viewData() {
  let catchData = JSON.parse((fs.readFileSync('./catch/main3.json').toString() || '{}'));
  let gList = []
  for (let k in catchData) {
    gList.push(...catchData[k])
  }

  let obj = {};
  gList.map(item => {
    let { name, 持仓占比 } = item;
    if (!obj[name]) {
      obj[name] = 0
    }
    obj[name] += parseFloat(持仓占比.replace('%'))
  });

  let arr = []
  for (let key in obj) {
    if (key !== '暂无数据')
      arr.push({ name: key, value: parseFloat(parseFloat(obj[key]).toFixed(2)) })
  }
  arr = arr.sort((a, b) => b.value - a.value)
  // console.log(arr);
  // let content = JSON.parse(fs.readFileSync('./temp/list.json'));
  fs.writeFileSync('./基金股票排名（2020-06-22）.json', JSON.stringify(arr))
}

async function main() {
  // await getShateInfo();
  viewData()
}


main();