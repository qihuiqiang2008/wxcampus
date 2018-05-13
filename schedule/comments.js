var schedule = require("node-schedule");
var comments = require("../controllers/comments");

//开始刷新留言的时间，使用24小时制的小时数
var begin = 20; //20点开始获取留言

//停止刷新广告的时间，使用24小时制的小时数。若end  < begin, 则为第二天的小时数
var end = 12;  //12点停止获取留言

var check = schedule.scheduleJob('0 */1 * * * ', function(){
//var check = schedule.scheduleJob('*/1 * * * * ', function(){
	if(checkNeedRefresh()){
		console.log("--------开始执行留言刷新-------------");
		comments.refreshComment();
	}
});

function checkNeedRefresh(){

	var hour = new Date().getHours();
	var minute = new Date().getMinutes();
	var time_period = false;
	var now = hour;
	//检查当前时间段

	if(begin > end){
		if(now > begin || now < end){
			time_period = true;
		}
	} else {
		if(now > begin && now < end){
			time_period = true;
		}
	}
	
	if(time_period == false){
		return false;
	}

	//检查当前的留言获取状态，如果是获取成功，则每20分钟刷新一次。
	//如果是在获取过程中，且在中断状态，则立即开始重新获取
	//如果是不是在中断状态，那就是定时任务还在执行，
	if(comments.is_break_point_exist()){
		if(comments.is_pid_diffrent()){
			console.log("发现PID差异，可以执行!");
			return true;
		}
		console.log("没PID差异，不执行!");
	} else {
		if(minute % 20 == 0){
			return true;
		}
	}


	return false;
}

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}