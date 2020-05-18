const cheerio = require('cheerio');
const { req } = require('./superagent');
const apiConfig = require('./config');
const config = require('../../wechat.config');
const crypto = require('crypto');

/**
 * 解析响应数据
 * @param {*} content 内容
 */
function parseBody(content) {
  if (!content) return;
  return JSON.parse(content.text);
}
/**
 * MD5
 * @param {*} id
 */
function getUniqueId(id) {
  return crypto
    .createHash('md5')
    .update(id)
    .digest('hex');
}

/**
 * 设置定时提醒任务
 * @param {*} obj 任务详情
 * @returns {*} 任务详情
 */
async function setSchedule(obj) {
  try {
    let option = {
      method: 'POST',
      url: apiConfig.KOAHOST + '/addSchedule',
      params: obj
    };
    let res = await req(option);
    let content = parseBody(res);
    return content.data;
  } catch (error) {
    console.log('添加定时任务失败', error);
  }
}

/**
 * 获取定时提醒任务列表
 */
async function getScheduleList() {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.KOAHOST + '/getScheduleList',
      params: ''
    };
    let res = await req(option);
    let text = parseBody(res);
    let scheduleList = text.data;
    return scheduleList;
  } catch (error) {
    console.log('获取定时任务失败:' + error);
  }
}
/**
 * 更新定时提醒任务
 */
async function updateSchedule(id) {
  try {
    let option = {
      method: 'POST',
      url: apiConfig.KOAHOST + '/updateSchedule',
      params: { id: id }
    };
    let res = await req(option);
    console.log('更新定时任务成功');
  } catch (error) {
    console.log('更新定时任务失败', error);
  }
}
/**
 * 设置聊天开关
 */
async function setUserInfo(obj) {
  try {
    let option = {
      method: 'POST',
      url: apiConfig.KOAHOST + '/addUser',
      params: obj
    };
    let res = await req(option);
    let content = parseBody(res);
    return content.data;
  } catch (error) {
    console.log('添加用户信息', error);
  }
}

/**
 * 获取用户信息
 */
async function getUserInfo(name) {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.KOAHOST + '/findUser',
      params: { setter: name }
    };
    let res = await req(option);
    let text = parseBody(res);
    let scheduleList = text.data;
    return scheduleList;
  } catch (error) {
    console.log('获取用户信息失败:' + error);
  }
}
/**
 * 更新开关状态
 */
async function updateUserInfo(obj) {
  try {
    let option = {
      method: 'POST',
      url: apiConfig.KOAHOST + '/updateUser',
      params: obj
    };
    let res = await req(option);
    console.log('更新用户信息成功');
  } catch (error) {
    console.log('更新用户信息失败', error);
  }
}
/**
 * 获取每日一句
 */
async function getOne() {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.ONE,
      params: ''
    };
    let res = await req(option);
    let $ = cheerio.load(res.text);
    let todayOneList = $('#carousel-one .carousel-inner .item');
    let todayOne = $(todayOneList[0])
      .find('.fp-one-cita')
      .text()
      .replace(/(^\s*)|(\s*$)/g, '');
    return todayOne;
  } catch (error) {
    console.log('获取每日一句失败：', error);
  }
}

/**
 * 天行图灵聊天机器人
 * @param {*} word 发送内容
 * @param {*} id id
 */
async function getResByTXTL(word, id) {
  try {
    let uniqueId = getUniqueId(id);
    let option = {
      method: 'GET',
      url: apiConfig.TXTLBOT,
      params: { key: config.TXAPIKEY, question: word, userid: uniqueId }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let response = content.newslist[0].reply;
      console.log('天行图灵机器人回复：', response);
      return response;
    } else {
      return '我好像迷失在无边的网络中了，接口调用错误：' + content.msg;
    }
  } catch (error) {
    console.log('天行图灵聊天机器人请求失败：', error);
  }
}

/**
 * 天行聊天机器人
 * @param {*} word 内容
 * @param {*} id id
 */
async function getResByTX(word, id) {
  try {
    let uniqueId = getUniqueId(id);
    let option = {
      method: 'GET',
      url: apiConfig.TXBOT,
      params: { key: config.TXAPIKEY, question: word, userid: uniqueId }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let response = '';
      if (content.datatype === 'text') {
        response = content.newslist[0].reply;
      } else if (content.datatype === 'view') {
        response = `虽然我不太懂你说的是什么，但是感觉很高级的样子，因此我也查找了类似的文章去学习，你觉得有用吗<br> 
        《${content.newslist[0].title}》${content.newslist[0].url}`;
      } else {
        response =
          '你太厉害了，说的话把我难倒了，我要去学习了，不然没法回答你的问题';
      }
      console.log('天行机器人回复：', response);
      return response;
    } else {
      return '我好像迷失在无边的网络中了，你能找回我么';
    }
  } catch (error) {
    console.log('天行聊天机器人请求失败：', error);
  }
}

/**
 * 图灵智能聊天机器人
 * @param {*} word 内容
 * @param {*} id id
 */
async function getResByTL(word, id) {
  try {
    let uniqueId = getUniqueId(id);
    let data = {
      reqType: 0,
      perception: {
        inputText: {
          text: word
        }
      },
      userInfo: {
        apiKey: config.TULINGKEY,
        userId: uniqueId
      }
    };
    let option = {
      method: 'POST',
      url: apiConfig.TULING,
      params: data,
      contentType: 'application/json;charset=UTF-8'
    };
    let res = await req(option);
    let content = parseBody(res);
    let reply = content.results[0].values.text;
    return reply;
  } catch (error) {
    console.log('图灵聊天机器人请求失败：', error);
  }
}
/**
 * 获取垃圾分类结果
 * @param {String} word 垃圾名称
 */
async function getRubbishType(word) {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXRUBBISH,
      params: { key: config.TXAPIKEY, word: word }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let type;
      if (content.newslist[0].type == 0) {
        type = '是可回收垃圾';
      } else if (content.newslist[0].type == 1) {
        type = '是有害垃圾';
      } else if (content.newslist[0].type == 2) {
        type = '是厨余(湿)垃圾';
      } else if (content.newslist[0].type == 3) {
        type = '是其他(干)垃圾';
      }
      let response = `${content.newslist[0].name}${type}<br>解释：${
        content.newslist[0].explain
      }<br>主要包括：${content.newslist[0].contain}<br>投放提示：${
        content.newslist[0].tip
      }`;
      return response;
    } else {
      console.log('查询失败提示：', content.msg);
      return '暂时还没找到这个分类信息呢';
    }
  } catch (error) {
    console.log('垃圾分类请求失败：', error);
  }
}

/**
 * 土味情话获取
 */
async function getSweetWord() {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXLOVE,
      params: { key: config.TXAPIKEY }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let sweet = content.newslist[0].content;
      let str = sweet.replace('\r\n', '<br>');
      return str;
    } else {
      console.log('获取土情话接口失败', content.msg);
    }
  } catch (err) {
    console.log('获取土情话接口失败', err);
  }
}

/**
 * 私聊获取天气
 */

async function getWeather(city) {
  city = city.split('天气')[0]
  if(!city){
    return '格式有误：示例（苏州天气）'
  }
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXWEATHER,
      params: { key: config.HFAPIKEY, location: city }
    };
    let res = await req(option);
    let content = parseBody(res);
    let endWord = config.endWord
    if (content.HeWeather6[0].status=='ok') {
      let todayInfo = content.HeWeather6[0];
      let obj = {
        weatherTips: `${todayInfo.lifestyle[0].brf}，${todayInfo.lifestyle[0].txt}`,
        todayWeather: `<br>今天:${todayInfo.daily_forecast[0].cond_txt_d}<br>温度:${todayInfo.daily_forecast[0].tmp_min}° / ${
            todayInfo.daily_forecast[0].tmp_max
            }°<br>${todayInfo.daily_forecast[0].wind_dir} ${todayInfo.daily_forecast[0].wind_sc}级<br>空气:${
            todayInfo.lifestyle[7].brf
            }<br>${todayInfo.lifestyle[7].txt}<br>`
      };
      let str =  `今日天气<br>${
          obj.weatherTips
  }<br>${
          obj.todayWeather
  }<br><br>      ————————${endWord}`;
  return str;
    } else {
      return '格式有误：示例（苏州天气）'
    }
  } catch (err) {
    console.log('获取天气接口失败', err);
  }
}
/**
 * 获取天行天气
 */
async function getTXweather(city) {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXWEATHER,
      params: { key: config.HFAPIKEY, location: city }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.HeWeather6[0].status=='ok') {
      let todayInfo = content.HeWeather6[0];
      let obj = {
        weatherTips: `${todayInfo.lifestyle[0].brf}，${todayInfo.lifestyle[0].txt}`,
        todayWeather: `<br>今天:${todayInfo.daily_forecast[0].cond_txt_d}<br>温度:${todayInfo.daily_forecast[0].tmp_min}° / ${
            todayInfo.daily_forecast[0].tmp_max
        }°<br>${todayInfo.daily_forecast[0].wind_dir} ${todayInfo.daily_forecast[0].wind_sc}级<br>空气:${
            todayInfo.lifestyle[7].brf
        }<br>${todayInfo.lifestyle[7].txt}<br>`
      };
      return obj;
    } else {
      return '请求出错啦~反馈给旺旺吧'
    }
  } catch (err) {
    console.log('获取天气接口失败', err);
  }
}
/**
 * 获取每日新闻内容
 * @param {*} id 新闻频道对应的ID
 */
async function getNews(id) {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXDAYNEWS,
      params: { key: config.TXAPIKEY, num: 10, col: id }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let newList = content.newslist;
      let news = '';
      for (let i in newList) {
        let num = parseInt(i) + 1;
        news = `${news}<br>${num}.${newList[i].title}`;
      }
      return news;
    }
  } catch (error) {
    console.log('获取天行新闻失败', error);
  }
}
/**
 * 获取名人名言
 */
async function getMingYan() {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXMINGYAN,
      params: { key: config.TXAPIKEY, num: 1 }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let newList = content.newslist;
      let news =`${newList[0].content}<br>      ——————————${newList[0].author}`
      return news;
    }
  } catch (error) {
    console.log('获取天行名人名言失败', error);
  }
}
/**
 * 获取星座运势
 * @param {string} satro 星座
 */
async function getStar(astro) {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXSTAR,
      params: { key: config.TXAPIKEY, astro: astro }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let newList = content.newslist;
      let news = ''
      for(let item of newList){
        news = `${news}${item.type}:${item.content}<br>`
      }
      return news;
    }
  } catch (error) {
    console.log('获取天行星座运势失败', error);
  }
}
/**
 * 获取姓氏起源
 * @param {string} 姓
 */
async function getXing(name) {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXXING,
      params: { key: config.TXAPIKEY, xing: name }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let newList = content.newslist;
      let news =`${newList[0].content}`
      return news;
    } else {
      return '请输入正确的姓氏😊'
    }
  } catch (error) {
    console.log('获取天行姓氏起源失败', error);
  }
}

/**
 * 获取顺口溜
 */
async function getSkl() {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXSKL,
      params: { key: config.TXAPIKEY }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let newList = content.newslist;
      let news =`${newList[0].content}`
      return news;
    }
  } catch (error) {
    console.log('获取天行顺口溜失败', error);
  }
}

/**
 * 获取老黄历
 */
async function getLunar(date) {
  date = date.split('老黄历 ')[0].replace(/\s+/g, "");
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXLUNAR,
      params: { key: config.TXAPIKEY,date:date }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let item = content.newslist[0];
      let news =`阳历：${item.gregoriandate.substring(0, 10)}<br>阴历：${item.lunardate}<br>节日：${item.lunar_festival || '不是节日'}<br>适宜：${item.fitness}<br>不宜：${item.taboo}<br>神位：${item.shenwei}<br>胎神：${item.taishen}<br>冲煞：${item.chongsha}<br>岁煞：${item.suisha}`
      return news;
    }else {
      return '格式有误，示例：老黄历+空格+2019-1-1';
    }
  } catch (error) {
    console.log('获取天行老黄历失败', error);
  }
}

/**
 * 天行神回复
 */
async function getGoldReply() {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXSHF,
      params: { key: config.TXAPIKEY,num:1 }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let item = content.newslist[0];
      let news =`标题："${item.title}"<br>回复：${item.content}`
      return news;
    }
  } catch (error) {
    console.log('获取天行神回复失败', error);
  }
}
/**
 * 天行歇后语
 */
async function getXhy() {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXXHY,
      params: { key: config.TXAPIKEY,num:1 }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let item = content.newslist[0];
      let news =`${item.quest}————${item.result}`
      return news;
    }
  } catch (error) {
    console.log('获取天行歇后语失败', error);
  }
}
/**
 * 天行绕口令
 */
async function getRkl() {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXRKL,
      params: { key: config.TXAPIKEY,num:1 }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let item = content.newslist[0];
      let news =`${item.content}`
      return news;
    }
  } catch (error) {
    console.log('获取天行绕口令失败', error);
  }
}
/**
 * 天行绕口令
 */
async function getCYJL() {
  try {
    let option = {
      method: 'GET',
      url: apiConfig.TXCYJL,
      params: { key: config.TXAPIKEY,num:1 }
    };
    let res = await req(option);
    let content = parseBody(res);
    if (content.code === 200) {
      let item = content.newslist[0];
      let news =`${item.content}`
      return news;
    }
  } catch (error) {
    console.log('获取天行绕口令失败', error);
  }
}
module.exports = {
  getOne,
  getResByTXTL,
  getResByTX,
  getResByTL,
  getWeather,
  getTXweather,
  getRubbishType,
  getSweetWord,
  setSchedule,
  getScheduleList,
  updateSchedule,
  getNews,
  getMingYan,
  getStar,
  getXing,
  getSkl,
  getLunar,
  getGoldReply,
  getXhy,
  getRkl,
  setUserInfo,
  getUserInfo,
  updateUserInfo,
  getCYJL
};
