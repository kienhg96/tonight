$(document).ready(function(){
	var btnSearch = $('.btn-go');
	var txtSearch = $('#search');
	btnSearch.click(function(){
		console.log(txtSearch.val());
		$.post('/search', {search: txtSearch.val()}, function(data){
			console.log(data);
		});
	});
});