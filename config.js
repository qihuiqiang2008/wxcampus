/**
 * config
 */

var path = require('path');
var pkg = require('./package.json');
var envport = 8080;
//var db_host = process.env.JAE_MONGO_IP.split(',')[0].trim();

///
//var dbURL = 'mongodb://bae:8H4FaezBpRWl9RsFjIPn1koZPa7Ztw1G@svridz5cbp6e12y.mongodb.duapp.com:10139/svridz5cbp6e12y';
//var devDbUrl='mongodb://bae:8H4FaezBpRWl9RsFjIPn1koZPa7Ztw1G@svridz5cbp6e12y.mongodb.duapp.com:10139/svridz5cbp6e12y'
var dbURL='mongodb://PGsrVWImY3EM6xkN:etqy9b1XAYoK048T@123.57.49.48:27029/wxsystem';
var devDbUrl = 'mongodb://123.57.49.48/wxsystem1';
// var dbURL='mongodb://127.0.0.1:27017/wxsystem'
// var devDbUrl = 'mongodb://127.0.0.1:27017/wxsystem';
var config = {
    debug: false,
    name: 'Node Club',
    description: 'Node Club 是用 Node.js 开发的社区软件',
    version: pkg.version,

    //粉丝价格配置区域
    //报价规则，如果一个学校的价格少于50元，则取50元
    //价格为每粉丝0.05元
    //价格四舍五入以50元为单位
    //次条价格为头条价格低6折
    price_per_fans : 0.05,
    min_price : 50,
    price_step : 50,
    second_discount: 0.6,

    is_dev:false,
    // site settings
    site_headers: [
        '<meta name="author" content="EDP@TAOBAO" />',
    ],
    host: 'localhost',
    // 默认的Google tracker ID，自有站点请修改，申请地址：http://www.google.com/analytics/
    google_tracker_id: 'UA-41753901-5',
    site_logo: '', // default is `name`
    site_icon: '', // 默认没有 favicon, 这里填写网址
    site_navs: [
        // [ path, title, [target=''] ]
        [ '/about', '关于' ],
    ],
    site_static_host: 'localhost:8080', // 静态文件存储域名
    photo_dir:  './', // 静态文件存储域名
    mini_assets: false, // 静态文件的合并压缩，详见视图中的Loader
    site_enable_search_preview: false, // 开启google search preview
    site_google_search_domain:  'cnodejs.org',  // google search preview中要搜索的域名

    upload_dir: path.join(__dirname, 'public', 'user_data', 'images'),

    db:dbURL,
    dev_db:devDbUrl,
    db_name: 'node_club_dev',
    session_secret: 'qihuiqiang2008',
    auth_cookie_name: 'qihuiqiang2008',
    port: envport,

    // 话题列表显示的话题数量
    list_topic_count: 30,

    // 限制发帖时间间隔，单位：毫秒
    post_interval: 10000,

    // RSS
    rss: {
        title: 'CNode：Node.js专业中文社区',
        link: 'http://cnodejs.org',
        language: 'zh-cn',
        description: 'CNode：Node.js专业中文社区',

        //最多获取的RSS Item数量
        max_rss_items: 50
    },

    // site links
    site_links: [
        {
            'text': 'Node 官方网站',
            'url': 'http://nodejs.org/'
        },
        {
            'text': 'Node Party',
            'url': 'http://party.cnodejs.net/'
        },
        {
            'text': 'Node 入门',
            'url': 'http://nodebeginner.org/index-zh-cn.html'
        },
        {
            'text': 'Node 中文文档',
            'url': 'http://docs.cnodejs.net/cman/'
        }
    ],

    // sidebar ads
    side_ads: [
        {
            'url': 'http://www.upyun.com/?utm_source=nodejs&utm_medium=link&utm_campaign=upyun&md=nodejs',
            'image': 'http://site-cnode.b0.upaiyun.com/images/upyun_logo.png',
            'text': ''
        },
        {
            'url': 'http://ruby-china.org/?utm_source=nodejs&utm_medium=link&utm_campaign=upyun&md=nodejs',
            'image': 'http://site-cnode.b0.upaiyun.com/images/ruby_china_logo.png',
            'text': ''
        },
        {
            'url': 'http://adc.taobao.com/',
            'image': 'http://adc.taobao.com/bundles/devcarnival/images/d2_180x250.jpg',
            'text': ''
        }
    ],

    // mail SMTP
    mail_opts: {
        host: 'smtp.126.com',
        port: 25,
        auth: {
            user: 'club@126.com',
            pass: 'club'
        }
    },

    //weibo app key
    weibo_key: 10000000,

    // admin 可删除话题，编辑标签，设某人为达人
    admins: { admin: true },

    // [ { name: 'plugin_name', options: { ... }, ... ]
    plugins: [
        // { name: 'onehost', options: { host: 'localhost.cnodejs.org' } },
        // { name: 'wordpress_redirect', options: {} }
    ],
    GITHUB_OAUTH: {
        clientID: 'your GITHUB_CLIENT_ID',
        clientSecret: 'your GITHUB_CLIENT_SECRET',
        callbackURL: 'http://cnodejs.org/auth/github/callback',
    },
    allow_sign_up: true,
    newrelic_key: 'yourkey'
};

module.exports = config;
module.exports.config = config;
