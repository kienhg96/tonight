var MakeElem = function(data){
	return '<div class="jumbotron contentArea"><img class="contentIcon" src="' + data.img + '"/><div><div><a href="' + data.url + '" target="_blank"><span class="contentTitle">' + data.name + '</span></a> <img src="' + data.rating + '"/> <button class="goingBtn btn ' + (data.userGoing? 'btn-warning' :'btn-success') + '">' + data.going + ' Going</button></div><p class="description">' + data.description + '</p></div></div>'
}
var user = null;
var arr = [];
var currentSearch = null;
$(document).ready(function(){
	var btnSearch = $('.btn-go');
	var txtSearch = $('#search');
	$.get('/user', function(data){
		user = data;
	});
	window.refreshUser = function(){
		$.get('/user', function(data){
			if (data) {
				user = data;
				$('.user').html('<li><a class="userAnchor" href="https://twitter.com/intent/user?user_id=' + user.id + '" target="_blank"><img class="userIcon" src="' + user.icon +'" alt="User Image"/></a></li><li class="dropdown"><a class="dropdown-toggle" href="#" data-toggle="dropdown">Hi, ' + user.name +'<span class="caret"></span></a><ul class="dropdown-menu"><li><a href="/logout">Logout</a></li></ul></li>');
				$.post('/search', {search: currentSearch}, function(data){
					//console.log(data);
					arr = data;
					var contentDiv = $('.content');
					for (var i = 0; i < arr.length; i++){
						if (arr[i].userGoing){
							//console.log(contentDiv.children().eq(i));
							//contentDiv.children().eq(i).find('div').find('div').find('button').removeClass('btn-success').addClass('btn-warning');
							contentDiv.children().eq(i).find('div div button').removeClass('btn-success').addClass('btn-warning');
						}
					}
				});
			}
		})
	}
	var goingClick = function(){
		var index = $(this).parent().parent().parent().index();
		var thisbtn = $(this);
		if (user) {
			//console.log(arr[index]);
			$.post('/going', { id : arr[index].id}, function(data){
				console.log(data);
				if (data === 'OK'){
					console.log('...');
					thisbtn.html('5 Going');
					if (arr[index].userGoing){
						arr[index].going--;
						arr[index].userGoing = false;
						thisbtn.removeClass('btn-warning').addClass('btn-success');
					}
					else {
						arr[index].going++;
						arr[index].userGoing = true;
						thisbtn.removeClass('btn-success').addClass('btn-warning');
					}
					thisbtn.html(arr[index].going + ' Going');
				}
				else {
					alert('Error occur');
				}
			});
		}
		else {
			alert('You must login to Going');
		}
	}
	var search = function(){
		console.log('search');
		$('.content').empty();
		currentSearch = txtSearch.val();
		$.post('/search', {search: currentSearch}, function(data){
			console.log(data);
			for (var i = 0; i < data.length; i++){
				$('.content').append(MakeElem(data[i]));
			}
			arr = data;
			$('.goingBtn').click(goingClick);
		});
	}
	btnSearch.click(function(){
		//console.log(txtSearch.val());
		search();
	});
	txtSearch.keypress(function (e) {
		if (e.which == 13) {
			search();     
		}
	});
	$('.auth').click(function(){
		window.open('/auth', '', 'width=500, height=400');
		return false;
	});
});