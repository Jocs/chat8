/*create by ransixi 20151006*/
/*
* chater 和 Chater 构造函数是应用仅有的几个声明的全局变量。
**********	当然还有几个window load 事件的处理函数    ***************
*/
//通过构造函数new 一个聊天室成员。该成员的原型对象包括和wechat有关的方法。
var chater = new Chater();

window.addEventListener('load', loadLogin, false);

function loadLogin(){
	//下面的事件用于检测点击那个元素
	document.addEventListener('click', function(e){
		var value = e.target.id || e.target.className || 'unkonw';
		console.log(value);
	}, false);
	var login = document.querySelector('#login');
	var portrailSelect = document.querySelector('#selectPortrail');
	var portrailTable = document.querySelector('#portrailTable');
	var beginChat = document.querySelector('#beginChat');
	var content = document.querySelector('#content');
	var nicenameInput = document.querySelector('#nicenameInput');
	var url = window.location.href;
	/*-----------------以下是初始化操作----------------------------------------*/
	//初始化socket连接
	chater.init(url);
	//初始化头像列表
    chater.addPortrail(document);
    //根据设备大小初始化content的高度
    content.style.height = (document.documentElement.clientHeight - 50) + 'px';
    //初始化焦点位置
    nicenameInput.focus();
    //draw wromg message Canvas 
    chater.drawLoginBubble('white');

    /*-----------------以下是event handler ------------------------------------*/
    //所有验证都已通过，头像也都设置好了，那么就可以开始聊天了
	beginChat.addEventListener('click', function(e){
		e.preventDefault();
		chater.loginAt = new Date().toTimeString().substr(0, 8);
		chater.lastMessageAt = new Date();
		chater.login();
		login.style.display = 'none';
	}, false);
	// -----------------判断昵称是否存在及输入是否合法--------------------------------
	document.addEventListener('keypress', function(e){
		if(e.keyCode === 13 && e.target.id === 'nicenameInput'){
			e.preventDefault();
			var value = e.target.value;
			if(chater.clientDataValidation(value)){
				chater.serverDataValidation(value);	
			} 
		}
	}, false);
	//选择头像事件处理函数，选择的头像将出现在上方的选择框中 ---------------------------------
	portrailTable.addEventListener('click', function(e){
		if(e.target.tagName.toLowerCase() === 'img'){
			e.preventDefault();
			var imageId = e.target.src.match(/portrail\/(\d+)(?=\.jpg)/)[1];
			chater.portrail = './images/portrail/' +imageId+ '.jpg';
			portrailSelect.innerHTML = '<img src="./images/portrail/' +imageId+ '.jpg">';
			beginChat.style.display = 'block';
		}	
	}, false);

}








