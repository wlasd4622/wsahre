let axios = require('axios')
let fs = require('fs')
let list = [];

function sleep() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 3000)
    })
}

async function getFundList(index = 1) {
    if (index > 11) {
        return false;
    }
    console.log('page', index);
    let result = null;
    try {
        //http://fund.eastmoney.com/data/fbsfundranking.html#tct;c0;r;szzf;ddesc;pn50;
        result = await axios.get(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=fb&ft=ct&rs=&gs=0&sc=zzf&st=desc&pi=${index}&pn=50&v=0.3797136626049107`, {
            headers: {
                Referer: 'http://fund.eastmoney.com/data/fundranking.html'
            }
        });
    } catch (err) {
        console.log(err);
    }

    if (result && result.data) {
        let data = eval('(' + `${result.data.replace('var rankData = ', '').replace(/\;$/, '').trim()}` + ')');
        list = [...list, ...data.datas]
    } else {
        console.error('error');
    }
    await sleep()
    index++;
    await getFundList(index)
}

function statistics() {
    console.log('-statistics-');
    let oList = list
    list = [];
    // let content = JSON.parse(fs.readFileSync('./temp/list.json'));
    oList.map(item => {
        let arr = item.split(',')
        let data = {
            code: arr[0],
            name: arr[1],
            py: arr[2],
            date: arr[15],
            type: arr[21],
            '近一周': arr[6],
            '近1月': arr[7],
            '近3月': arr[8],
            '近6月': arr[9],
            '近1年': arr[10],
            '近2年': arr[11],
            '近3年': arr[12],
            '今年来': arr[13],
            '成立来': arr[14]
        }
        if (data['近1年'] && data.type === 'ETF-场内') {
            list.push(data)
        }
    })
    let filter = [
        [],
        [],
        []
    ];
    let max = 10;
    let screenCode = {}
    //排序 成立来
    list.sort((item, item1) => item1['成立来'] - item['成立来']).slice(0, max).map(item => {
        filter[0].push(item.code)
        if (screenCode[item.code]) {
            screenCode[item.code] = screenCode[item.code] + 1
        } else {
            screenCode[item.code] = 1
        }
    })
    //排序 近3年
    list.sort((item, item1) => item1['近3年'] - item['近3年']).slice(0, max).map(item => {
        filter[0].push(item.code)
        if (screenCode[item.code]) {
            screenCode[item.code] = screenCode[item.code] + 1
        } else {
            screenCode[item.code] = 1
        }
    })
    //排序 近2年
    list.sort((item, item1) => item1['近2年'] - item['近2年']).slice(0, max).map(item => {
        filter[0].push(item.code)
        if (screenCode[item.code]) {
            screenCode[item.code] = screenCode[item.code] + 1
        } else {
            screenCode[item.code] = 1
        }
    })
    //排序 近1年
    list.sort((item, item1) => item1['近2年'] - item['近1年']).slice(0, max).map(item => {
        filter[1].push(item.code)
        if (screenCode[item.code]) {
            screenCode[item.code] = screenCode[item.code] + 1
        } else {
            screenCode[item.code] = 1
        }
    })
    //排序 近6月
    list.sort((item, item1) => item1['近6月'] - item['近6月']).slice(0, max).map(item => {
        filter[2].push(item.code)
        if (screenCode[item.code]) {
            screenCode[item.code] = screenCode[item.code] + 1
        } else {
            screenCode[item.code] = 1
        }
    })

    //排序 近3月
    list.sort((item, item1) => item1['近3月'] - item['近3月']).slice(0, max).map(item => {
        filter[2].push(item.code)
        if (screenCode[item.code]) {
            screenCode[item.code] = screenCode[item.code] + 1
        } else {
            screenCode[item.code] = 1
        }
    })

    //筛选出历史成绩较好的基金
    let quality = Object.keys(screenCode).sort((k1, k2) => screenCode[k2] - screenCode[k1]).splice(0, 6);
    //根据筛选出来  的优质基金，再进行近一周排名的排序选出靠前的两支基金
    let newList = [];
    quality.map(code => {
        newList.push(list.find(item => item.code === code));
    })
    //排序历史成绩较好的基金 近1周
    let newCode = []
    newList.sort((item, item1) => item1['近1月'] - item['近1月']).map(item => {
        newCode.push(item.code)
    })
    console.log('优质基金：', newCode);
}

(async () => {
    await getFundList()
    fs.writeFileSync('./temp/list.json', JSON.stringify(list))
    statistics()
    console.log('-END-');
})();


