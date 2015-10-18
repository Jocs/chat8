
window.addEventListener('load', chat, false);
function chat(){
	var moTable  = document.querySelector('#moTable');
	var moMap = document.querySelector('#moMap');
	var moMapUl = document.querySelector('#moMap ul');
	var plus = document.querySelector('#plus');
	var footerNav = document.querySelector('footer nav');
	var userList = document.querySelector('#userList');
	var rooms = document.querySelector('#rooms');
	var map = document.querySelector('#map');
	var messagePage = document.querySelector('#messagePage');
	var logo = document.querySelector('#logo');
	var inputArea = document.querySelector('#inputArea');
	var back = document.querySelector('#back');
	var mapTop = document.querySelector('#mapTop');
	var moTable = document.querySelector('#moTable');
	var inputTextInput = document.querySelector('#inputText input');
	var sendImage = document.querySelector('#sendImage');
	var currentChater = document.querySelector('#currentChater');
	//初始化表情面板----------------------------------------------------
	chater.addEmoticom(moTable, 23); 
	// eventHandler --------------------------------------------------
	moMapUl.addEventListener('click', function(e){
		//e.preventDefault();
		if(e.target.parentNode.tagName ==='LI'){
			switch(e.target.textContent){
				case '表情': chater.addEmoticom(moTable, 23); break;
				case '共享位置': break; //在map.js中处理和共享位置有关的事件。
				default: break;
			}
		}
	}, false);
	//send image ---------文件大小最好不要超过1M，
	sendImage.addEventListener('change', function(e) {
	    //检查是否有文件被选中
	     if (this.files.length != 0) {
	        //获取文件并用FileReader进行读取
	         var file = this.files[0],
	             reader = new FileReader();
	        if(file.size > 1024*1024) {
	        	var activeRoom = document.querySelector('.active');
	        	var li = document.createElement('li');
	        	li.className = 'inform';
	        	li.style.background = 'orange';
	        	li.textContent = '图片太大!';
	        	activeRoom.appendChild(li);
	        	setTimeout(function(){
	        		activeRoom.removeChild(li);
	        	}, 10000);
	        	return;
	        } 
	            reader.readAsDataURL(file);
	             //console.log(this.files[0]);
	         reader.onload = function(e) {
	            //读取成功，显示到页面并发送到服务器
	             this.value = '';

	             chater.sendMessage(e.target.result, 'image');
	         };
	         
	     };
	 }, false);

	plus.addEventListener('click', function(e){
		if(~e.target.className.indexOf('plus')){
			moMap.style.display = 'block';
			e.target.className = 'glyphicon glyphicon-remove';
		 } else {
		 	moMap.style.display = 'none';
		 	plus.firstElementChild.className = 'glyphicon glyphicon-plus';
		 }
	}, false);


	//为footer 导航添加事件，切换好友，消息，地图。
    footerNav.addEventListener('click', function(e){
    	e.preventDefault();
    	if(e.target.tagName.toLowerCase() === 'li'){
    		var content = e.target.textContent;
    		switch(content){
    			case '好友': {
    				showUserList();break;
    			};
    			case '广播': {
    				showChatRoom('chatRoom');break;
    			};
    			case '地图': {
    				showMap(); break;
    			};
    		}
    	}
    }, false);
    //返回好友页面
	back.addEventListener('click', function(e){
		showUserList();
		closeActiveRoom();
		chater.activeChater = null;
	}, false);
	//点击好友进入聊天
	userList.addEventListener('click', function(e){
		var id = e.target.id.slice(4);
		if(e.target.tagName.toLowerCase() === 'li'&& id !== chater.name){
			showChatRoom(id);
			chater.users.forEach(function(user){
				if(user.name = id){
					user.unreadCount = 0;
				}
			});
			chater.updateUnreadCount();
		}
		
	}, false);

	//点击表情，进入输入框并格式化
	moTable.addEventListener('click', function(e){
		var emoticonId, img;
		if(e.target.tagName.toLowerCase() === 'img'){
			img = e.target;
			emoticonId = img.src.match(/galesaur\/(\d+)(?=\.gif)/)[1];
			inputTextInput.value += "{{emoticon:" + emoticonId + "}}"; 
			inputTextInput.focus();
		}
	});
	function showChatRoom(activeId){
		var activeRoom = document.querySelector('#single' + activeId);
		var room = document.querySelectorAll('#rooms ul');
		    
		    chater.activeChater = {name:'聊天室'};
			chater.users.forEach(function(user){
				if(user.name === activeId) chater.activeChater = user;
			});
	
			currentChater.textContent = chater.activeChater.name;
			Array.prototype.forEach.call(room, function(r){

				r.className = 'room';
				r.style.display  = 'none';

			});
			activeRoom.className = 'room active';
			activeRoom.style.display = 'block';
			userList.style.display = 'none';
    		rooms.style.display = 'block';
    		map.style.display = 'none';
    		logo.style.display = 'none';
    		mapTop.style.display = 'none';
    		messagePage.style.display = 'block';
    		footerNav.style.display = 'none';
    		inputArea.style.display = 'block';
	}
	
	function showUserList(){
		userList.style.display = 'block';
    	rooms.style.display = 'none';
    	map.style.display = 'none';
    	logo.style.display = 'block';
    	mapTop.style.display = 'none';
    	messagePage.style.display = 'none';
    	footerNav.style.display = 'block';
    	inputArea.style.display = 'none';
    	moMap.style.display = 'none';
		plus.firstElementChild.className = 'glyphicon glyphicon-plus';
	}
	function showMap(){
		userList.style.display = 'none';
    	rooms.style.display = 'none';
    	map.style.display = 'block';
    	logo.style.display = 'none';
    	messagePage.style.display = 'none';
    	mapTop.style.display = 'block';
	}

	function closeActiveRoom(){
		var rooms = document.querySelectorAll('#rooms .room');
		Array.prototype.forEach.call(rooms, function(room){
			room.style.display = 'none';
			room.className = 'room';
		});
	}

}











