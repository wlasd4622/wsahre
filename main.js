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
    if (index >= 10) {
        return false;
    }
    console.log('index', index);
    let result = null;
    try {
        result = await axios.get(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=fb&ft=ct&rs=&gs=0&sc=zzf&st=desc&pi=${index}&pn=50&v=0.8834870984739347`);
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
    let list = JSON.parse(fs.readFileSync('./temp/list.json'));
    list.map(item => {
        console.log(item.split(','));
        console.log('------------');
        let data
    })
    let arr = list[0].split(',')
    console.log(arr);
    let data = {
        code: arr[0],
        name: arr[1],
        py:arr[2],
        date: arr[15],
        type:arr[21],
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
    console.log(data);
}

(async () => {
    // await getFundList()
    // fs.writeFileSync('./temp/list.json', JSON.stringify(list))
    statistics()
    console.log('-END-');
})();
