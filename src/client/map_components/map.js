window.addEventListener('load', loadMap, false);

function loadMap(){
	var geolocation, watchId, sendPosition = false,
		getPosition = document.querySelector('#getPosition'),
		mapContainer = document.querySelector('#map'),
		sendShare = document.querySelector('#sendShare'),
		activeRoom = document.querySelector('#rooms .active'),
		moMap = document.querySelector('#moMap'),
		backChat = document.querySelector('#backChat'),
		askPositionTalbe = document.querySelector('#askPositionTalbe');
		mapTopText = document.querySelector('#mapTopText');

		getPosition.style.color = 'gray';

	//handler
	getPosition.addEventListener('click', function(e){
		if(getPosition.style.color == 'gray'){
			getPosition.style.color = 'purple';
			mapTopText.textContent = '定位中ing';
			getCurrentPosition();
			watchPosition();
		} else {
			sendPosition = false;
			getPosition.style.color = 'gray';
			mapTopText.textContent = '定位关闭';
			geolocation.clearWatch(watchId);
		}	
	});
	sendShare.addEventListener('click', function(e){
		var data = {
			showTime: false,
			fileType: 'askPosition',
			message: '', // 没有消息
			receiver: chater.activeChater,
			sender: chater.profile,
			date: chater.lastMessageAt.toTimeString().slice(0,8)//没关系，反正也不会显示
		};
		var activeRoom = document.querySelector('#rooms .active');
		chater.displayMessage('me', activeRoom, data, 'askPosition');
		chater.sendMessage(undefined, 'askPosition');
		sendPosition = true;
		getCurrentPosition();
		watchPosition();
		getPosition.style.color = 'purple';
		mapTopText.textContent = '定位中ing';
		mapContainer.style.display = 'block';
		//activeRoom.style.webkitFilter = 'blur(5px)';
		backChat.style.display = 'block';
		moMap.style.display = 'none';
	}, false);
	backChat.addEventListener('click', function(e){
		var activeRoom = document.querySelector('#rooms .active');
		if(backChat.textContent == '返回聊天'){
			mapContainer.style.display = 'none';
			//activeRoom.style.webkitFilter = 'blur(0px)';
			backChat.textContent = '返回地图';	
		} else {
			mapContainer.style.display = 'block';
			//activeRoom.style.webkitFilter = 'blur(5px)';
			backChat.textContent = '返回聊天';	
		}
		
	}, false);
	askPositionTalbe.addEventListener('click', function(e){
		if(e.target.tagName.toLowerCase() !== 'button') return;
		var activeRoom;
		var name = document.querySelector('#whoAsk').textContent;
		var askList = document.querySelector('#user' + name);
		this.style.display = 'none';
		var value = e.target.value == '接受' ? true : false;
		chater.sendMessage(value, 'answerAskPosition');
		if(value == true){
			askList.click();
			activeRoom = document.querySelector('#rooms .active');
			getCurrentPosition();
			watchPosition();
			getPosition.style.color = 'purple';
			mapTopText.textContent = '定位中ing';
			mapContainer.style.display = 'block';
			//activeRoom.style.webkitFilter = 'blur(5px)';
			backChat.style.display = 'block';
			moMap.style.display = 'none';
			sendPosition = true;
			
		}

	});


	//初始化地图等-------------------------------------
	chater.map = new AMap.Map('map', {
        resizeEnable: true,
        level: 16
    });
    chater.map.plugin('AMap.Geolocation', function() {
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            maximumAge: 0,           //定位结果缓存0毫秒，默认：0
            convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: true,        //显示定位按钮，默认：true
            buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: false,        //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy: true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
    });
    chater.map.addControl(geolocation);
    AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
    AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
    //获取当前位置信息
    function getCurrentPosition() {
        geolocation.getCurrentPosition();
    }
    //监控当前位置并获取当前位置信息
    function watchPosition() {
        watchId = geolocation.watchPosition();
    }
    function onComplete(data){
    	console.log(data);
    	mapTopText.textContent = '定位成功';
    	if(sendPosition == true){
    		chater.sendMessage(data, 'position');
    	}
    }
    function onError(data){
    	var str = '定位失败:';
        switch (data.info) {
            case 'PERMISSION_DENIED':
                str += '浏览器阻止了定位操作';
                break;
            case 'POSITION_UNAVAILBLE':
                str += '无法获得当前位置';
                break;
            case 'TIMEOUT':
                str += '定位超时';
                break;
            default:
                str += '未知错误';
                break;
        }
        mapTopText.textContent = str;
    }
}








