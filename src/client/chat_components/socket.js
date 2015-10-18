/*create by ransixi 20151007*/
//此文件用来处理和发送消息，接受消息，处理在线好友列表、分享地理位置等于socket有关的功能
window.addEventListener('load', socketRelate, false);
function socketRelate(){
	//变量声明---------------------------------
	var send = document.querySelector('#send');
	var inputTextInput = document.querySelector('#inputText input');
	var timer = null;
	//updateUser可以用来监听「users」事件，用来更新好友列表信息以及logo信息。
	chater.initUserListAndRooms();
	chater.updateLoginAndLogout();
	chater.receiveMessage();
	// 发送消息
	send.addEventListener('click', function(e){
		var value = inputTextInput.value;
		if(value.length !== 0){
			inputTextInput.value = '';
			inputTextInput.focus();
			chater.sendMessage(value);
		} else inputTextInput.focus();
	}, false);
	document.addEventListener('keypress', function(e){
		if(e.target.parentNode.id === 'inputText')
		    lazySendMessage(undefined, 'typing');
	}, false);
	inputTextInput.addEventListener('blur', function(e){
		chater.sendMessage(undefined, 'disTyping');
	}, false);
	/**
	 * [lazySendMessage description:该函数用来来lazy send typing 类型的消息，在1S内重复的typing消息
	 * 不会被发送出去，减少资源消耗]
	 * @param  {[String]} value    [description] the send message
	 * @param  {[String]} fileType [description] the message type
	 * @return {[type]}          [description] no return
	 */
	function lazySendMessage(value, fileType) {
		if(timer) return;
		timer = setTimeout(function () {
			chater.sendMessage(value, fileType);
			timer = null;
		}, 1000);
	}
}









