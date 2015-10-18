function Chater(){
	this.name = '匿名用户';
	this.portrail = '';
	this.loginAt = '';
	this.lastMessageAt = '';
	this.socket = null;
	this.socketId = '';
	this.activeChater = null;
	this.users = [];
	this.profile = null;
	this.map = null;
	this.marker = null;
}
Chater.prototype = {
	//程序初始化，this.socketId初始化---
	init: function(url){
		var socket = io.connect(url);
		this.socket = socket;
		this.socket.on('init', function(data){
			if(data === true) this.socketId = this.socket.id;
		}.bind(this));
	},
	/*监听users事件，收到users消息后初始化在线好友列表和在线好友的聊天对话框，好友列表包括自己*/
	/*聊天对话框不包括自己*/
	initUserListAndRooms: function(){
		var userList = document.querySelector('#userList');
		var self = this, ul, users;
		this.socket.on('users', function(data){
			users = self.users = data;
			userList.innerHTML = '';
			ul = document.createElement('ul');
			userList.appendChild(ul);
			for(var i = 0; i < users.length; i++){
				users[i].unreadCount = 0; //初始化未读消息为零条。初始化后在把users推到self.users中.
				self.createAUser(users[i]);
				if(users[i].socketId !== this.id){
					self.createARoom(users[i]);
				}	
			}	
			
		});
	},
	//createAUser用于创建一个好友的列表
	createAUser: function(data){
		var logo = document.querySelector('#logo');
		var userList = document.querySelector('#userList');
		var li, img, imgWrapper,msgWrapper, chatRoom, statusDiv, unreadCount;
		logo.textContent = 'WeChat('+ this.users.length +')';
		img = document.createElement('img');
		imgWrapper = document.createElement('div');
		msgWrapper = document.createElement('div');
		statusDiv = document.createElement('div');
		unreadCount = document.createElement('span');
		li = document.createElement('li');

		//unreadCount 是未读消息提醒，初始化为不可见状态。
		unreadCount.className = 'unreadCount';
		unreadCount.style.display = 'none';
		li.id = 'user' + data.name;
		msgWrapper.className = 'nickname';
		msgWrapper.innerHTML = '<p>'+ data.name + (data.name == this.name ? '(Me)':'') +
		                        '</p><span>Join At: '+ 
				                data.loginAt +'</span>';
		imgWrapper.className = 'portrail';
		img.src = data.portrail;
		statusDiv.className = 'status';
		//statusDiv.textContent = '在线';
		imgWrapper.appendChild(img);
		li.appendChild(imgWrapper);
		li.appendChild(msgWrapper);
		li.appendChild(statusDiv);
		li.appendChild(unreadCount);
		if(userList.firstElementChild) userList.firstElementChild.appendChild(li);
	},
	createARoom: function(data){
		var ul = document.createElement('ul');
		var rooms = document.querySelector('#rooms');
		ul.style.display = 'none';
		ul.id = 'single' + data.name;
		ul.className = 'room';
		ul.innerHTML = '<li class="inform">Joined: '+ data.loginAt +'</li>';
		rooms.appendChild(ul);
	},
	updateLoginAndLogout:function(){
		var that = this;
		this.socket.on('login', function(data){
			var exsited = false;
			data.unreadCount = 0;
			that.users.forEach(function(user, i, users){
				if(user.name === data.name) {
					document.querySelector('#user' + data.name + ' img').src = data.portrail;
					//document.querySelector('#user' + data.name +' .status').textContent = '在线';
					document.querySelector('#user' + data.name +' .status').style.background = 'green';
					users[i] = data;
					exsited = true;
				}
			});
			if(that.activeChater && data.name === that.activeChater.name) that.activeChater = data;
			//this.users.push(data);
			if(!exsited) {
				that.users.push(data);
				that.createAUser(data);
				that.createARoom(data);
			}
		});
		this.socket.on('logout', function(data){
			//好友列表不删除，但表示下线，房间不删除。
			//document.querySelector('#user' + data.name +' .status').textContent = '离线';
			document.querySelector('#user' + data.name +' .status').style.background = 'gray';
		});
	},
	//updateUnreadCount --------------------------------------------------------------------
	updateUnreadCount: function(){
		var unreadCount;
		this.users.forEach(function(user){
			unreadCount = document.querySelector('#user' + user.name + ' .unreadCount');
			unreadCount.textContent = user.unreadCount;
			console.log(unreadCount);
			if(user.unreadCount !== 0){
				//显示未读消息提醒小红圆圈
				unreadCount.style.display = 'block';	
			} else {
				unreadCount.style.display = 'none';
			}
		});
	},
	// ----------------------------------receiveMessage ----------------------------------
	receiveMessage: function(){
		var that = this;
		this.socket.on('message', function(data){
			//替换代码为表情图标------------------------------------
			var id = data.receiver.name !=='聊天室'?('#single' + data.sender.name): '#singlechatRoom';
			var rRoom = document.querySelector(id);
			var activeRoom = document.querySelector('#rooms .active');
			if(data.fileType == 'text' || 
			   data.fileType == 'image' || 
			   data.fileType == 'askPosition'||
			   data.fileType == 'answerAskPosition'){
				if(!activeRoom ||(activeRoom && rRoom.id !== activeRoom.id)){
					that.users.forEach(function(user){
						if(user.name === data.sender.name) {
							user.unreadCount ++;
							console.log(user.unreadCount);
						}
					});
					that.updateUnreadCount();
				}
			}
			switch(data.fileType){
				case 'typing' :{
					if(data.receiver.name !== '聊天室') that.displayTyping(rRoom, data);
					break;
				};
				case 'disTyping':{
					that.clearTyping(rRoom); break;
				};
				case 'text':
				case 'image':{
					that.clearTyping(rRoom);
					that.displayMessage('you', rRoom, data, data.fileType);
					break;
				};
				case 'position':{
					console.log(data);
					that.updateMarker(data.message.position);
					break;
				};
				case 'askPosition':{
					that.showAskPositionTable(data.sender.name);
					break;
				};
				case 'answerAskPosition':{
					that.displayMessage('you', rRoom, data, data.fileType);
					break;
				}
				default: throw new Error('unknown fileType!'); break;

			}
			
		});

	},

	//unpdateMarker,这儿的marker是指当前聊天对方的位置标记
	updateMarker: function(position){
		var map = this.map, marker;
		if(this.marker){
			this.marker.setMap(null);
		}
		marker = new AMap.Marker({
	      position: [position.lng, position.lat],
	      draggable: false
	    });
	    marker.setMap(map);
	    this.marker = marker;
	},
	showAskPositionTable: function(name){
		var askTable = document.querySelector('#askPositionTalbe');
		var whoAsk = document.querySelector('#whoAsk');
		whoAsk.textContent = name;
		askTable.style.display = 'block';
	},
	clearTyping: function(ele){
		if(ele.querySelector('.typing')){
			var typingEle = ele.querySelector('.typing');
			ele.removeChild(typingEle);
		}
		   
	},
	//displayTyping -----------
	displayTyping: function(ele, data){
		//console.log(ele.querySelector('.typing'));
		if(ele.querySelector('.typing')) return;
		var imgWrapper, msgWrapper, clearWrapper, li, img, timeLi, nameWrapper,
		    content = document.querySelector('#content'), that = this;

		    img = document.createElement('img');
			img.src = data.sender.portrail;
			imgWrapper = document.createElement('div');
			imgWrapper.className = 'portrail';
			imgWrapper.appendChild(img);
			msgWrapper = document.createElement('div');
			msgWrapper.className  = 'message';
			msgWrapper.innerHTML='<span class="arrow"></span><img src="./images/loading/typeing.gif">';
			clearWrapper = document.createElement('div');
			clearWrapper.className = 'clearBoth';
			nameWrapper = document.createElement('div');
			nameWrapper.className = 'name';
			nameWrapper.textContent = data.sender.name;
			li = document.createElement('li');
			li.className = 'you typing';
			li.appendChild(nameWrapper);
			li.appendChild(imgWrapper);
			li.appendChild(msgWrapper);
			li.appendChild(clearWrapper);
			ele.appendChild(li);
			content.scrollTop = content.scrollHeight;

	},
	//displayMessage------------------------------------
	displayMessage: function(who, ele, data, fileType){
		var imgWrapper, msgWrapper, clearWrapper, li, img, timeLi, nameWrapper,
		    content = document.querySelector('#content'),
		    currentChater = document.querySelector('#currentChater');
		    if(who ==='me') currentChater.innerHTML = '<img src="./images/loading/load.gif" alt=""/>';

			if(!fileType || fileType == 'text'){
				data.message = data.message.replace(/\{\{emoticon\:(\d+)\}\}/g,
				'<img src="./images/emoticon/galesaur/$1.gif" alt="" >' );
			}
			img = document.createElement('img');
			img.src = data.sender.portrail;
			imgWrapper = document.createElement('div');
			imgWrapper.className = 'portrail';
			imgWrapper.appendChild(img);
			msgWrapper = document.createElement('div');
			msgWrapper.className  = 'message';
			if(fileType === 'image'){
				msgWrapper.innerHTML = '<span class="arrow"></span><div class="imgWrapper"><img src="' +
				data.message+ '" alt = ""></div>';
			} else if(fileType === 'text'){
				msgWrapper.innerHTML = '<span class="arrow"></span>'+ data.message;
			} else if(fileType === 'askPosition'){
				if(who == 'me') msgWrapper.innerHTML = '<span class="arrow"></span>您向<b>' +
					            data.receiver.name + '</b>发起位置共享';
			} else if(fileType === 'answerAskPosition'){
				msgWrapper.innerHTML = '<span class="arrow"></span><b>' +
					            data.sender.name + '</b>' + (!data.message ?'拒绝':'接受') +
					            '您的位置请求';
			}
			clearWrapper = document.createElement('div');
			clearWrapper.className = 'clearBoth';
			nameWrapper = document.createElement('div');
			nameWrapper.className = 'name';
			nameWrapper.textContent = data.sender.name;
			li = document.createElement('li');
			li.className = who;
			li.appendChild(nameWrapper);
			li.appendChild(imgWrapper);
			li.appendChild(msgWrapper);
			li.appendChild(clearWrapper);
			//console.log(data.showTime);
			if(data.showTime){
				timeLi = document.createElement('li');
				timeLi.className = 'inform';
				timeLi.textContent = data.date;
				ele.appendChild(timeLi);
			}
			ele.appendChild(li);

			content.scrollTop = content.scrollHeight;
	},
	// sendMessage --------------------------------------
	sendMessage: function(value, fileType){
		//发送的数据
		console.log(+new Date());
		fileType = fileType || 'text';
		var isShowTime = !!(new Date() - this.lastMessageAt > 1000 * 60);
		var currentChater = document.querySelector('#currentChater');
		var activeRoomUl = document.querySelector('#rooms .active');
		if(fileType == 'text' || fileType == 'image') this.lastMessageAt = new Date();
		var data = {
			showTime: isShowTime,
			fileType: fileType,
			message: value, // 消息内容
			receiver: this.activeChater,
			sender: this.profile,
			date: this.lastMessageAt.toTimeString().slice(0,8)
		};
		
		if(fileType == 'text' || fileType == 'image'){
			// 显示自己发送的消息
			this.displayMessage('me', activeRoomUl, data, fileType);
			// 给服务器发送message事件。
			this.socket.emit('message', data, function(){
				currentChater.textContent = data.receiver.name;
			});
		} else {
			this.socket.emit('message', data, function(){
				if(data.receiver) currentChater.textContent = data.receiver.name;	
			});
		}
		
	},
	//login ------------------------------------------------
	login: function(){
		var data = {
			name: this.name,
			socketId: this.socketId,
			portrail: this.portrail,
			loginAt: this.loginAt
		};
		this.profile = data;
		this.socket.emit('login', data);
	},
/*------------------------下面都是登陆相关的方法了-----------------------------------*/
/*------------------------下面都是登陆相关的方法了-----------------------------------*/
/*------------------------下面都是登陆相关的方法了-----------------------------------*/
	// 通过canvas来绘制登陆页的提示框。和writeMessage函数一起使用
	drawLoginBubble: function(strokeStyle){
		var loginCanvas = document.querySelector('#loginCanvas');
		var ctx = loginCanvas.getContext('2d');
		var deviceWidth = document.documentElement.offsetWidth;
		var RADIUS = 40,MARGIN = 10, ARROW_HEIGHT = 20;
		var canvasWidth = deviceWidth > 800 ? 450 : 250;
		var canvasHeight = 150;
		var bubbleWidth = canvasWidth - 2 * MARGIN;
		var bubbleHeight = 100;
		ctx.canvas.width = canvasWidth; 
		ctx.canvas.height = canvasHeight;
		
		ctx.save();
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = 4;
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(RADIUS + MARGIN, MARGIN + ARROW_HEIGHT);
		ctx.lineTo(RADIUS + MARGIN + 20, MARGIN + ARROW_HEIGHT);
		ctx.lineTo(RADIUS + MARGIN + 20 + ARROW_HEIGHT, MARGIN);
		ctx.lineTo(RADIUS + MARGIN + 20 + ARROW_HEIGHT, MARGIN + ARROW_HEIGHT);
		ctx.arcTo(bubbleWidth + MARGIN, MARGIN + ARROW_HEIGHT, 
			      bubbleWidth + MARGIN,MARGIN + ARROW_HEIGHT + RADIUS ,RADIUS);
		ctx.arcTo(bubbleWidth + MARGIN, bubbleHeight + ARROW_HEIGHT + MARGIN, 
				  bubbleWidth + MARGIN - RADIUS, bubbleHeight + ARROW_HEIGHT + MARGIN, RADIUS);
		ctx.arcTo(MARGIN,  bubbleHeight + ARROW_HEIGHT + MARGIN,
				  MARGIN, bubbleHeight + ARROW_HEIGHT + MARGIN - RADIUS,RADIUS);
		ctx.arcTo(MARGIN, MARGIN + ARROW_HEIGHT, MARGIN + RADIUS, MARGIN + ARROW_HEIGHT,RADIUS);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	},
	show: function(ele){
		var opacity = 0;
		ele.style.opacity = 0;
		var timer = setInterval(function(){
			if(opacity <= 1){
				ele.style.opacity = opacity;
				opacity += .1;
			} else clearInterval(timer);	
		},50);
	},
	hide: function(ele){
		var opacity = 1;
		ele.style.opacity = 1;
		var timer = setInterval(function(){
			if(opacity >= 0){
				ele.style.opacity = opacity;
				opacity -= .1;
			} else clearInterval(timer);	
		},50);
	},
	portrailMoveUp: function(ele, des){
		var top = 170;
		des = des || 0;
		var timer = setInterval(function(){
			var step = (top - des)/10;
			if(Math.abs(top - des) > 1 ){
				ele.style.top = top + 'px';
				top -= step;
			} else {
				clearInterval(timer);
				ele.style.top = des + 'px';
			}
		},10);
	},
	blurIn: function(ele){
		ele.style.webkitFilter = 'blur(30px)';
		var num = 30;
		var timer = setInterval(function(){
			var step = num / 10;
			if(Math.abs(num) > 1){
				ele.style.webkitFilter = 'blur(' + num + 'px)';
				num -= step;
			} else {
				clearInterval(timer);
				ele.style.webkitFilter = 'blur(0px)';
			}
		},50);
	},
	blurOutAndHide: function(ele, des){
		ele.style.webkitFilter = 'blur(0px)';
		var num = 0;
		var timer = setInterval(function(){
			var step = (des - num)/10;
			if(Math.abs(num - des) > 1){
				ele.style.webkitFilter = 'blur(' + num + 'px)';
				num += step;
			} else {
				clearInterval(timer);
				ele.style.webkitFilter = 'blur(30px)';
				ele.style.display = 'none';
			}
		},50);
	},
	// 用于添加表情。
	addEmoticom: function(ele, num){
		ele.innerHTML = '';
		var img, div, elementFragment = document.createDocumentFragment();
		for(var i = 1; i <= num; i++){
			div = document.createElement('div');
			div.className = 'singleMo';
			img = document.createElement('img');
			img.src = i < 10 ? './images/emoticon/galesaur/0' +i+ '.gif':
			                   './images/emoticon/galesaur/'  +i+ '.gif';
			div.appendChild(img);
			elementFragment.appendChild(div);
		}
		ele.appendChild(elementFragment);
	},
	addPortrail: function(document){
		var portrailTable = document.querySelector('#portrailTable');
		var wrapperDiv, imgWrapper, img;
		var count = 1;
		for(var i = 0; i < 5; i++){
			wrapperDiv = document.createElement('div');
			wrapperDiv.className = 'portrailRow';
			for(var j = 0; j < 4; j++){
				img = document.createElement('img');
				imgWrapper = document.createElement('div');
				imgWrapper.className = 'portrailCell';
				img.src = "images/portrail/" +count+ ".jpg";
				imgWrapper.appendChild(img);
				wrapperDiv.appendChild(imgWrapper);
				count++;
			}
			portrailTable.appendChild(wrapperDiv);
		}
	},
	// sharePosition: function(ele){
	// 	ele.innerHTML = '<div id="sendShare">发起位置共享</div>';
	// },
	clientDataValidation: function(value){
		var loginCanvas = document.querySelector('#loginCanvas');
		if(/^[a-zA-Z_]{1}(?:[\w]{5,16})999$/.test(value) ) {
			return true;
		} else {
			loginCanvas.style.display = 'block';
			this.showLoginError('昵称以字母或下划线为首，有字母、下划线、数字组成，最少9个字符！');
			return false;
		}
	},
	serverDataValidation: function(value){
		value = value.slice(0, -3);
		var loginName = document.querySelector('#loginName');
		var nickname = document.querySelector('#nickname');
		var portrailTable = document.querySelector('#portrailTable');
		var loginCanvas = document.querySelector('#loginCanvas');
		this.socket.emit('checkName', value);
		this.socket.on('isUserExsist', function(data){
					if(!data){
						this.name = value;
						loginName.style.display = 'block';
						loginName.textContent = value;
						nickname.style.display = 'none';
						portrailTable.style.display = 'table';
						console.log(this);
					} else {
						loginCanvas.style.display = 'block';
						this.showLoginError('昵称已经存在,请选择其他您喜爱的昵称！');
					}
				}.bind(this));	
	},
	showLoginError: function(value){
		var loginWarning = document.querySelector('#loginWarning');
		loginWarning.style.color = 'white';
		loginWarning.innerHTML = '<span class="glyphicon glyphicon-bell"></span>' + value;
	}

};











