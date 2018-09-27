// 等待 成功 失败   状态的值
const state = {
    PENDING: "pending",//等待
    FULEILLED: "fulfilled",//成功
    REJECTED: "rejected"//失败
};
//成功 失败 等待    状态的监听
const stateChange = {
    VALUE: "value",//成功的值
    ERROR: "error",//失败的值
    STATUS: "status"//当前的状态
};
//成功的回调和成功的回调函数集合
const stateBack = {
    ONFULEILLED: "onFulfilled",/*成功的回调*/
    ONREJECTED: "onRejected",/*失败的回调*/
    ONFULEILLEDCALLBACK: "onFulfilledCallback",/*成功的回调集合*/
    ONREJECTEDCALLBACK: "onRejectedCallback"/*失败的回调集合*/
}
const resolve = "resolve", //成功的函数
    reject = "reject";//失败的函数

const then = "then";//Promise中执行的成功和失败的函数

let self = null;//实例本身this

class MyPromise {
    constructor(fn) {
        self = this;//缓存当前promise实例
        self[stateChange.VALUE] = null;//成功的值
        self[stateChange.ERROR] = null;//失败的值
        self[stateChange.STATUS] = state.PENDING;//等待的状态
        self[stateBack.ONFULEILLED] = null;//成功的回调函数
        self[stateBack.ONREJECTED] = null;//失败的回调函数
        self[stateBack.ONFULEILLEDCALLBACK] = [];//成功的回调集合
        self[stateBack.ONREJECTEDCALLBACK] = [];//失败的回调集合
        //初始化参数
        var fnRun = "fn";
        self[fnRun] = fn;//赋值参数
        self[fnRun](MyPromise[resolve], MyPromise[reject])//当MyPromise成功创建的时候就会马上执行里面的参数，此时MyPromise是同步的。
    }
    //成功的函数  -- 静态方法
    static [resolve](success) {
        //如果当前的状态是pending，并且执行的是成功的函数时，状态修改为fulfilled并执行成功的逻辑
        if (self[stateChange.STATUS] === state.PENDING) {
            self[stateChange.VALUE] = success;//成功时传递的参数
            self[stateChange.STATUS] = state.FULEILLED;//把状态变为成功 --- (修改状态要在定时器外面应为是异步)
            //让执行的函数进入异步等待队列
            setTimeout(() => {
                self[stateBack.ONFULEILLEDCALLBACK].forEach(callback => {
                    //只有添加的是函数才可以执行
                    if (typeof callback === "function") {
                        callback(self[stateChange.VALUE])
                    } else {
                        //成功的回调不是一个函数
                        throw new Error("Successful callback is not a function")
                    }
                });//执行成功的回调集合
            });
        }
    }
    //失败的函数  --静态方法
    static [reject](error) {
        //如果当前的状态是pending，并且执行的是失败的函数时，状态修改为rejected并执行失败的逻辑
        if (self[stateChange.STATUS] === state.PENDING) {
            self[stateChange.ERROR] = error;//失败时传递的参数
            self[stateChange.STATUS] = state.REJECTED;//把状态修改为失败 --- (修改状态要在定时器外面应为是异步)
            //让执行函数进入异步等待队列
            setTimeout(() => {
                self[stateBack.ONREJECTEDCALLBACK].forEach(callback => {
                    //只有添加的是函数才可以执行
                    if (typeof callback === "function") {
                        callback(self[stateChange.ERROR])
                    } else {
                        //失败的回调不是一个函数
                        throw new Error("Failed callback is not a function")
                    }
                })//失败的回调集合
            })
        }
    }
    //Promise中执行成功和失败的函数
    [then](onFulfilled, onRejected) {//then方法中的两个参数 1.resolve 成功 2.reject 失败
        //如果状态是pending才去注册失败和成功的回调
        if (self[stateChange.STATUS] === state.PENDING) {
            //把onFulilled和onRejected放入到事件池中  （发布订阅模式）
            self[stateBack.ONFULEILLEDCALLBACK].push(onFulfilled);
            self[stateBack.ONREJECTEDCALLBACK].push(onRejected);
            //如果状态从pending改变成fulfilled就执行成功的回调
        } else if (self[stateChange.STATUS] === state.FULEILLED) {
            //成功状态执行，将成功值传入
            if (typeof onFulfilled === "function") {
                onFulfilled(self[stateChange.VALUE]);
            } else {
                //onFulfilled不是一个函数
                throw new Error("onFulfilled is not a function")
            }
            //如果状态从pending改变成rejected，执行失败的回调
        } else if (self[stateChange.STATUS] === state.REJECTED) {
            //失败状态执行，将失败值传入
            if (typeof onRejected === "function") {
                onRejected(self[stateChange.ERROR])
            } else {
                //onRejected不是一个函数
                throw new Error("onRejected is not a function")
            }
        }
        //MyPromise中的链式写发，可以再次调用MyPromise中的方法
        return this;
    }
}

//node中的导出
module.export = MyPromise;

let p = new MyPromise((resolve, reject) => {
    //成功和失败只能执行一个，当执行成功就无法执行失败，当执行失败就无法执行成功。
    resolve("成功")
    reject("失败")
})

p.then((success) => {
    console.log(success, "第一次")
}, (error) => {
    console.log(error, "第二次")
}).then((success) => {
    console.log(success, "第三次")
}, (error) => {
    console.log(error, "第四次")
})