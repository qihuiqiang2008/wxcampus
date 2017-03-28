/**
 * Created by yiweiguo on 2017/3/23.
 */
TopClient = require('topSdk').ApiClient;
const APPKEY='23717081'
const APPSECRET='76e3977da1f92eee2a48259458633c8f'
const REST_URL='http://gw.api.taobao.com/router/rest'
const SMS_TEMPLATE_CODE='SMS_58065158'
const SMS_FREE_SIGN_NAME='高校微生活'
var client = new TopClient({
    'appkey': APPKEY,
    'appsecret': APPSECRET,
    'REST_URL': REST_URL
});

exports.sendSms=function(name,phone,callback){
    client.execute('alibaba.aliqin.fc.sms.num.send', {
        'extend':'123456',
        'sms_type':'normal',
        'sms_free_sign_name':SMS_FREE_SIGN_NAME,
        'sms_param':'{"school":'+name+'}',
        'rec_num':phone,
        'sms_template_code':SMS_TEMPLATE_CODE
    }, /*function(error, response) {
        if (!error) console.log(response);
        else console.log(error);
    })*/
    callback
    )
}