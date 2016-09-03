// 用于网络监控
exports.setType = function (req, res, next) {
    //console.log("++----+"+req.query.t);
   var type=req.query.t||"secret";
   req.query.t=type;
    //console.log("+++"+req.query.t);
   // res.locals.type = type;
    next();
};
