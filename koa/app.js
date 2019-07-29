const Koa = require("koa")
const Router = require("koa-router")
const bodyParser = require('koa-bodyparser')
const model = require("./mongodb/model")
const app = new Koa()
const router = new Router()
app.use(bodyParser())

router.post('/api/addSchedule', async(ctx, next) => { // 添加定时任务
    let body = ctx.request.body;
    let res = await model.insert(body);
    console.log('添加', res);
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})

router.get('/api/getScheduleList', async(ctx, next) => { // 获取定时任务列表
    const condition = { hasExpired: false }
    let res = await model.find(condition)
    ctx.response.status = 200;
    console.log('查找', res);
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})
router.post('/api/updateSchedule', async(ctx, next) => { // 更新定时任务
    const condition = { _id: ctx.request.body.id }
    let res = await model.update(condition)
    ctx.response.status = 200;
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})

router.post('/api/addUser', async(ctx, next) => { // 添加用户聊天模式开关
    let body = ctx.request.body;
    let res = await model.insertUser(body);
    console.log('添加', res);
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})
router.get('/api/findUser', async(ctx, next) => { // 获取用户信息
    const condition = { setter: ctx.request.query.setter }
    let res = await model.findUser(condition)
    ctx.response.status = 200;
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})
router.post('/api/updateUser', async(ctx, next) => { // 更新聊天模式开关
    const condition = { setter: ctx.request.body.setter }
    const data = { autoReply: ctx.request.body.autoReply }
    let res = await model.updateUser(condition,data)
    ctx.response.status = 200;
    ctx.body = { code: 200, msg: "ok", data: res }
    next()
})

const handler = async(ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.respose.status = err.statusCode || err.status || 500;
        ctx.response.type = 'html';
        ctx.response.body = '<p>出错啦</p>';
        ctx.app.emit('error', err, ctx);
    }
}

app.use(handler)
app.on('error', (err) => {
    console.error('server error:', err)
})

app.use(router.routes())
app.use(router.allowedMethods())
module.exports = app