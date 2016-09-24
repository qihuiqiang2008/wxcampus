$(function(){
var rl_exp = {
baseUrl:	'',
pace:		200,
dir:		['/public/front/face0','/public/front/face1'],
text:[
[
	'挤眼','亲亲','太开心','生病','书呆子','失望','可怜','黑线','吐','委屈','思考','哈哈','嘘','右哼哼','左哼哼','疑问','阴险','顶','钱','悲伤','鄙视','拜拜','吃惊','闭嘴','衰','愤怒','感冒','酷','来','good','haha','ok','拳头','弱','握手','赞','耶','最差','NO','怒骂','困','哈欠','微笑','白眼','睡','色','挖鼻','傻眼','打脸','作揖','笑cry','红丝带','绿丝带','可爱','嘻嘻','汗','害羞','泪','爱你','偷笑','心','哼','鼓掌','晕','馋嘴','抓狂','抱抱','怒','右抱抱','左抱抱'
],
[				'doge','喵喵','围观','kxl晕','男孩儿','女孩儿','kiss','跳舞花','c伤心','c捂脸','c大笑','moc转发','moc羞','moc鬼脸','moc大哭','微风','c发火','c委屈','bm抓狂','bm缤纷','哆啦A梦汗','xkl路过','芒果萌萌哒','din爱你','din睡觉','ali转圈哭','ali跪求','ali冤','ali加油'
]
],
num:		[70,29],
isExist:	[0,0],
bind:	function(i){
$("#rl_bq .rl_exp_main").eq(i).find('.rl_exp_item').each(function(){
$(this).bind('click',function(){
rl_exp.insertText(document.getElementById('Content'),'['+$(this).find('img').attr('title')+']');
});
});
},
/*加载表情包函数*/
		loadImg:function(i){
			var node = $("#rl_bq .rl_exp_main").eq(i);
			for(var j = 0; j<rl_exp.num[i];j++){
				var domStr = 	'<li class="rl_exp_item">' + 
									'<img src="' + rl_exp.dir[i] + '/' + rl_exp.text[i][j] + '.gif" alt="' + rl_exp.text[i][j] +
									'" title="' + rl_exp.text[i][j] + '" />' +
								'</li>';
				$(domStr).appendTo(node);
			}
			rl_exp.isExist[i] = 1;
			rl_exp.bind(i);
		},
		/*在textarea里光标后面插入文字*/
		insertText:function(obj,str){
			obj.focus();
			if (document.selection) {
				var sel = document.selection.createRange();
				sel.text = str;
			} else if (typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number') {
				var startPos = obj.selectionStart,
					endPos = obj.selectionEnd,
					cursorPos = startPos,
					tmpStr = obj.value;
				obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
				cursorPos += str.length;
				obj.selectionStart = obj.selectionEnd = cursorPos;
			} else {
				obj.value += str;
			}
		},
		init:function(){
			$("#rl_bq > ul.rl_exp_tab > li > a").each(function(i){rl_exp.loadImg(i);
				$(this).bind('click',function(){
					if( $(this).hasClass('selected') )
						return;
					if( rl_exp.isExist[i] == 0 ){
						rl_exp.loadImg(i);
					}
					$("#rl_bq > ul.rl_exp_tab > li > a.selected").removeClass('selected');
					$(this).addClass('selected');
					$('#rl_bq .rl_selected').removeClass('rl_selected').hide();
					$('#rl_bq .rl_exp_main').eq(i).addClass('rl_selected').show();
				});
			});
			
			
			
		}
	};
	rl_exp.init();	//调用初始化函数。
});
