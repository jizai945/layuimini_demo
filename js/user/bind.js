layui.use(['form'], function () {
    var $ = layui.jquery,
    form = layui.form
    , layer = layui.layer;

    // var rfid_url = 'http://192.168.2.1/get/mod=rfid&param=detected_rfid';
    // var key_url = 'http://192.168.2.1/get/mod=light&param=pressed';
    // var door_url = ' http://192.168.2.1/get_cfg?mod=sensor&param=metal'
    var rfid_url = '../api/detected_rfid.json';
    var key_url = '../api/pressed.json';
    var door_url = '../api/door.json';
    var submit_url = 'http://192.168.2.1/post/mod=bind_rfid';
    var submit_door_url = 'http://192.168.2.1/set?mod=bind_door';
    var rfid_obj = new Object();
    var key_obj = new Object();
    var fresh_timer = null;
    var door_timer = null;

    // 数据默认初始化
    function data_init() {
        rfid_obj.stat = 0;
        key_obj.stat = 0;
    }
    data_init();

    //自定义验证规则
    form.verify({
        floorid: function (value) {
            let num = parseInt(value)
            if (isNaN(num)) {
                return '楼层id不合法';
            }
        }
        ,floortag: function (value) {
            if (value.length<1 || value.length>5) {
                return '标签长度应在1~5之间';
            }
        }
        
    });

    //监听提交
    form.on('submit(submit)', function (data) {
        if (rfid_obj.stat > 0 && key_obj.stat == 1) {
            ajax_submit_id();
            layer.msg('提交中...', {
                time: 1000, 
                btn: ['OK']
            });	
        } else {
            layer.msg('RFID或按键状态不合法，无法提交', {
                time: 2000, 
                btn: ['OK']
            });	
        }
        
        return false;
    });

    // ajax获取rfid状态
    function ajax_get_rfid_result() {
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('GET', rfid_url, true); //第二步：打开连接
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        
                var json_obj = JSON.parse(httpRequest.responseText);
                switch (json_obj.stat) {
                    case 0:
                        rfid_obj.stat = 0;
                        $("#rfid_stat").html('未检测到标签');
                        $("#rfid_stat").css("color", "red");
                        break;
                    case 1:
                        rfid_obj.stat = 1;
                        $("#rfid_stat").html('检测到标签，但未绑定');
                        $("#rfid_stat").css("color", "Gold");
                        break;                           
                    case 2:
                        rfid_obj.stat = 2;
                        rfid_obj.rfid_id = json_obj.rfid_id;
                        $("#rfid_stat").html('检测到标签，绑定楼层为'+json_obj.rfid_id);
                        $("#rfid_stat").css("color", "green");
                        break;
                    default:
                        break;
                }
            }
        };
        httpRequest.send();
    }

    // ajax获取按键状态
    function ajax_get_key_status() {
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('GET', key_url, true); //第二步：打开连接
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        
                var json_obj = JSON.parse(httpRequest.responseText);
                switch (json_obj.stat) {
                    case 0:
                        key_obj.stat = 0;
                        $("#key_stat").html('未检测到按键');
                        $("#key_stat").css("color", "red");
                        break;
                    case 1:
                        key_obj.stat = 1;
                        key_obj.key_id = json_obj.key_id;
                        $("#key_stat").html('检测到一个按键按下，按键ID：'+json_obj.key_id);
                        $("#key_stat").css("color", "green");
                        break;                           
                    case 2:
                        key_obj.stat = 2;                            
                        $("#key_stat").html('检测到多个按键，请只按下一个按键');
                        $("#key_stat").css("color", "Gold");
                        break;
                    default:
                        break;
                }
            }
        };
        httpRequest.send();
    }

    // ajax提交楼层绑定信息
    function ajax_submit_id() {
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('POST', submit_url, true); //第二步：打开连接			
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        
                layer.msg('提交成功', {
                    time: 1000, 
                    btn: ['OK']
                });	
            }
        };
        let json_obj = new Object();
        json_obj.floor_id = parseInt($("input[type='text'][name='floorid']").val());
        json_obj.floor_label = $("input[type='text'][name='floortag']").val();
        json_obj.rfid_id = json_obj.floor_id;
        json_obj.key_id = key_obj.key_id;
        httpRequest.send(JSON.stringify(json_obj));
    }

    // ajax获取门状态
    function ajax_get_door_status(){
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('GET', door_url, true); //第二步：打开连接
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        
                var json_obj = JSON.parse(httpRequest.responseText);
                $("input[type='checkbox'][name='door1']").attr("checked", json_obj.metal[0].stat==1?true:false);
                $("input[type='checkbox'][name='door2']").attr("checked", json_obj.metal[1].stat==1?true:false);
                form ? form.render("checkbox") : null;
            }
        };
        httpRequest.send();
    }

    // ajax开门绑定
    function ajax_submit_door() {
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('POST', submit_door_url, true); //第二步：打开连接			
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        
                layer.msg('提交成功', {
                    time: 1000, 
                    btn: ['OK']
                });	
            }
        };
        let json_obj = new Object();
        json_obj.sw1 = $("input[type='checkbox'][name='door1']")[0].checked == true? 1: 0;
        json_obj.sw2 = $("input[type='checkbox'][name='door2']")[0].checked == true? 1: 0;
        json_obj.stat = 1;
        httpRequest.send(JSON.stringify(json_obj));  
    }

    // 楼层自动刷新按钮
    $('#fresh_btn').click(function(){
        if (fresh_timer == null) {
            ajax_get_rfid_result();
            ajax_get_key_status();
            $('#fresh_btn').removeClass('layui-btn-normal');
            $('#fresh_btn').addClass('layui-btn-danger');
            $('#fresh_btn').html('停止');
            fresh_timer = setInterval(function() {	
                ajax_get_rfid_result();
                ajax_get_key_status();
            }, 1000);
        } else {
            $('#fresh_btn').removeClass('layui-btn-danger');
            $('#fresh_btn').addClass('layui-btn-normal');
            $('#fresh_btn').html('自动刷新状态(1s)');
            clearInterval(fresh_timer);        //关闭循环
            fresh_timer = null;
        }
        
    })

    // 楼层立即刷新按钮
    $('#update_btn').click(function(){
        layer.msg('刷新中...', {
                time: 500, 
                btn: ['OK']
        });	
        ajax_get_rfid_result();
        ajax_get_key_status();    
    })

    // 电梯门自动刷新按钮
    $('#door_fresh_btn').click(function(){
        if (door_timer == null) {
            ajax_get_door_status();
            $('#door_fresh_btn').removeClass('layui-btn-normal');
            $('#door_fresh_btn').addClass('layui-btn-danger');
            $('#door_fresh_btn').html('停止');
            door_timer = setInterval(function() {	
                ajax_get_door_status();
            }, 1000);
        } else {
            $('#door_fresh_btn').removeClass('layui-btn-danger');
            $('#door_fresh_btn').addClass('layui-btn-normal');
            $('#door_fresh_btn').html('自动刷新状态(1s)');
            clearInterval(door_timer);        //关闭循环
            door_timer = null;
        }

    })

    // 电梯门立即刷新按钮
    $('#door_update_btn').click(function(){
        layer.msg('刷新中...', {
                time: 500, 
                btn: ['OK']
        });	
        ajax_get_door_status();
    })

    // 开门绑定按钮
    $('#door_submit').click(function(){
        layer.confirm('确认门状态都为打开,点击确认开始绑定', function(index){
            layer.msg('绑定中...', {
                time: 500, 
                btn: ['OK']
            });	
            ajax_submit_door();	
        });
    })

    ajax_get_rfid_result();
    ajax_get_key_status();
    ajax_get_door_status();

});