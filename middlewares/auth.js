/**
 * 需要管理员权限
 */
exports.adminRequired = function (req, res, next) {
  if (!req.session.user) {
    return res.redirect('/back/signin');
  }
  if ((!req.session.user.is_admin)&&(req.session.user.email!=='admin@admin.com')) {
      return res.redirect('/back/signin');
  }
  next();
};

/**
 * 需要登录
 */
exports.userRequired = function (req, res, next) {
  if (!req.session || !req.session.user) {
     // res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.send(403, 'forbidden!');
  }
  next();
};

/**
 * 需要登录，响应错误页面
 */
exports.signinRequired = function (req, res, next) {
  if (!req.session.user) {
      res.render('front/sign/signin');
    return;
  }
  next();
};

exports.blockUser = function () {
  return function (req, res, next) {
    if (req.session.user && req.session.user.is_block) {
      return res.send('您被屏蔽了。');
    }
    next();
  };
}
