	
	var start_flag = 0;
	var up_btn = document.getElementById("multifile");
	var up_bin2 = document.getElementById("filedir");
	var upload_id_str;
	
	function set_up_btn_state(state) {
		up_btn.disabled = state;
		up_bin2.disabled = state;
	}
	
	function startupload(i) {
		// 合法性判断
		if (i >= document.getElementById(upload_id_str).files.length) {
			alert("全部文件传输结束");
			start_flag = 0;
			set_up_btn_state(false);
			return;
		}
		
		var fileInput = document.getElementById(upload_id_str).files;
		var tbody = document.getElementById('tbMain'); 
		//file对象为用户选择的某一个文件
		var file = fileInput[i]; 
		var url = document.getElementById("url").value;	
		//此时取出这个文件进行处理，这里只是显示文件名 
		console.log(file.name); 
							
		var upload_path = (upload_id_str == "multifile") ? url + file.name : url + file.webkitRelativePath;
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4) {
				if (xhttp.status == 200) {
					var tbody = document.getElementById('tbMain'); 
					// alert(xhttp.status + " Success!\n" + xhttp.responseText);
					// console.log("第"+i+"文件上传成功");
					tbody.children[i].cells[3].innerHTML = "上传成功";
					tbody.children[i].cells[3].style="color:green";
					startupload(i+1);
					
				} else if (xhttp.status == 0) {
					var tbody = document.getElementById('tbMain'); 
					console.log("Server closed the connection abruptly!");
					tbody.children[i].cells[3].innerHTML = "上传失败";
					tbody.children[i].cells[3].style="color:red";
					startupload(i+1);
				} else {
					var tbody = document.getElementById('tbMain'); 
					console.log(xhttp.status + " Error!\n" + xhttp.responseText);
					tbody.children[i].cells[3].innerHTML = "上传失败";
					tbody.children[i].cells[3].style="color:red";
					startupload(i+1);
				}
			}
		};
		tbody.children[i].cells[3].innerHTML = "正在上传";
		tbody.children[i].cells[3].style="color:blue";
		xhttp.open("POST", upload_path, true);
		xhttp.send(file);
	}
	
	
	function upload() {
		// 防止重入
		if (start_flag) {
			 alert("正在上传，请勿重复点击，或刷新页面重传");
		}
		start_flag = 1;				
		
		if (document.getElementById("multifile").files.length == 0 && 
			document.getElementById("filedir").files.length == 0) {
			alert("请选择文件上传 -.-");
			start_flag = 0;
			set_up_btn_state(false);
			return;
		} else {
			upload_id_str = document.getElementById("multifile").files.length == 0? "filedir" : "multifile";
		}
		
		set_up_btn_state(true);
		startupload(0);	
	}
	
	function getDataRow(h){
	   var row = document.createElement('tr'); //创建行 
	   var idCell = document.createElement('td'); //创建第一列id 
	   idCell.innerHTML = h.id; //填充数据 
	   row.appendChild(idCell); //加入行 ，下面类似 
	   var nameCell = document.createElement('td');//创建第二列name 
	   nameCell.innerHTML = h.name; 
	   row.appendChild(nameCell); 
	   var sizeCell = document.createElement('td');//创建第三列size
	   sizeCell.innerHTML = h.size; 
	   row.appendChild(sizeCell); 
	   var sizeCell = document.createElement('td');//创建第四列状态
	   sizeCell.innerHTML = "等待上传"; 
	   row.appendChild(sizeCell); 
	
	   return row; //返回tr数据   
	} 

	// 多文件选择事件
	function showFileName(event) {
		// console.log(event)
		console.log(" FileList Demo:");
		var file; 
		var per = new Array(document.getElementById("multifile").files.length)
		
		//取得FileList取得的file集合 
		for(var i = 0 ;i<document.getElementById("multifile").files.length;i++){ 
		    //file对象为用户选择的某一个文件 
		    file=document.getElementById("multifile").files[i]; 
		    //此时取出这个文件进行处理，这里只是显示文件名 
		    console.log(file.name); 
			
			per[i] = {id:i, name:file.name, size:file.size};
			
		} 
			
		var tbody = document.getElementById('tbMain'); 
		// 删除原表格
		while (tbody.childElementCount > 0) {
			tbody.removeChild(tbody.childNodes[0]);
		}

		// 添加表格
		for(var i = 0;i < per.length; i++){ //遍历一下json数据 
		 var trow = getDataRow(per[i]); //定义一个方法,返回tr数据 
		 tbody.appendChild(trow); 
		} 

	}
	
	// 文件夹选择事件
	function showDirFile(event) {
		// console.log(event)
		var test = document.getElementById("filedir");
		var file; 
		var per = new Array(document.getElementById("filedir").files.length)
		//取得FileList取得的file集合
		for(var i = 0 ;i<document.getElementById("filedir").files.length;i++){ 
		    //file对象为用户选择的某一个文件 
		    file=document.getElementById("filedir").files[i]; 
		    //此时取出这个文件进行处理，这里只是显示文件名 
		    // console.log(file.name); 		
			// per[i] = {id:i, name:file.name, size:file.size};
			
			console.log(file.webkitRelativePath); 
			per[i] = {id:i, name:file.webkitRelativePath, size:file.size};
			
		} 
			
		var tbody = document.getElementById('tbMain'); 
		// 删除原表格
		while (tbody.childElementCount > 0) {
			tbody.removeChild(tbody.childNodes[0]);
		}
		
		// 添加表格
		for(var i = 0;i < per.length; i++){ //遍历一下json数据 
		 var trow = getDataRow(per[i]); //定义一个方法,返回tr数据 
		 tbody.appendChild(trow); 
		} 
		
		
		
	}
	
	