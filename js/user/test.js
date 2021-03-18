layui.use(['form', 'table'], function () {
    var $ = layui.jquery,
        form = layui.form;
        table = layui.table;

    var test_start_url = 'http://192.168.2.1/cmd?mod=test_stat';
    var test_result_url = 'http://192.168.2.1/cmd?mod=test_stat';
    // var test_result_url = '../api/test.json';
    var start_test_timer; // 定时器
    var ledkey_fresh_timer = null; // 定时器
    var test_stat = ['空闲', '正在执行测试', '上次测试已完成'];
    var test_err = ['无异常', '未检测到开门状态', '未检测到关门状态', '缺少识别楼层', '识别楼层顺序错误'];

    // ---------------------------------------- 测试开关信息 ------------------------------------------
    //监听指定开关
      form.on('switch(switchTest)', function(data){
        layer.msg('开关checked：'+ (this.checked ? 'true' : 'false'), {
          offset: '6px'
        });
        layer.tips('开始测试', data.othis);
        $("input[type='checkbox'][name='close']").prop("disabled", true);

        start_test_time();
        
      });

    // 开始测试接口
    function start_test_time() {
        //开启循环：每3秒一次
        start_test_timer = setInterval(function() {
            ajax_req_test_result();
        },3000);

        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('GET', test_start_url, true); //第二步：打开连接
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        

            }
        };
        httpRequest.send();
        ajax_req_test_result();
    }

    // 测试结果请求接口
    function ajax_req_test_result() {
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('GET', test_result_url, true); //第二步：打开连接
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        
                var json_obj = JSON.parse(httpRequest.responseText);

                if (test_stat[json_obj.stat] == '上次测试已完成') {
                    layer.msg('测试结束', {
                        time: 1000, //2s后自动关闭
                        btn: ['OK']
                    });	
                    clearInterval(start_test_timer);        //关闭循环
                    $("input[type='checkbox'][name='close']").attr("disabled", false);
                    $("input[type='checkbox'][name='close']").prop("checked", false);
                    form ? form.render("checkbox") : null;
                } else {
                    layer.msg('数据已更新...', {
                        time: 500, 
                        offset: 'rb',
                        btn: ['OK']
                    });	
                }

                $('#test_stat').html(test_stat[json_obj.stat]);
                $('#test_err').html(test_err[json_obj.err]);
                $('#test_err_flower').html(JSON.stringify(json_obj.err_msg));
            }
        };
        httpRequest.send();
    }

    // 页面刷新的时候加载
    ajax_req_test_result();
});