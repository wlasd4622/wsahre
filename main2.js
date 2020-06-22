let axios = require('axios')
let fs = require('fs')
let cheerio = require('cheerio')
let list = [];
// http://fundf10.eastmoney.com/jdzf_150230.html
async function getFundList(index = 1) {
    if (index >= 10) {
        return false;
    }
    console.log('page', index);
    let result = null;
    try {
        //http://fund.eastmoney.com/data/fbsfundranking.html#tct;c0;r;szzf;ddesc;pn50;
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

function sleep() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 3000)
    })
}

async function writeHandle() {
    await getFundList();
    let newList = [];
    list.map(item => {
        if (item.includes('ETF-场内')) {
            newList.push(item.split(',')[0])
        }
    })
    fs.writeFileSync('./list.json', JSON.stringify(newList))
}

function init() {
    list = JSON.parse(fs.readFileSync('./list.json'))
}

async function writeSiFenHtml() {
    console.log(list);
    for (let i = 0; i < list.length; i++) {
        let code = list[i];
        console.log(code);
        let result = await axios.get(`http://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jdzf&code=${code}&rt=${Math.random()}`)
        let html = result.data.replace(`var apidata=`, '').replace(/\;$/, '').replace(`{ content:"`, '').replace('"}', '');
        fs.writeFileSync(`./catch/${code}.html`, html)
    }
}

async function gradeHandle() {
    for (let i = 0; i < list.length; i++) {
        let code = list[i];
        // code = 512760
        // console.log(code);
        let html = fs.readFileSync(`./catch/${code}.html`).toString()
        let $ = cheerio.load(html)

        if (html.includes('近3年') && $('.sifen').length >= 8) {
            let view = `${code}\t`
            let grade = 0
            $('.sifen').map((i, item) => {
                if (i > 2 && i < 8 || i === 0) {
                    let type = $(item).text()
                    if (type === '优秀') {
                        grade++
                    }
                    view += type + '\t';
                }
            })
            if (grade >= 5) {
                console.log(view);
            }

        }

    }
}

async function main() {
    // await writeHandle();
    init()
    await gradeHandle()
}

main()