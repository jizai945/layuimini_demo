layui.use(['form', 'table'], function () {
    var $ = layui.jquery,
        form = layui.form,
        table = layui.table;

    // 调试切换url
    // var log_list_url = 'http://192.168.2.1/get?mod=log_list';
    // var log_size_url = 'http://192.168.2.1/get?mod=log_list&parm=num';
    var log_list_url = '../api/log.json';
    var log_size_url = '../api/log_size.json'
    var log_del_url = 'http://192.168.2.1/set?mod=del_log';
    var log_dow_url = 'http://192.168.2.1/log/';
    // 变量记录日志的条数
    var log_size = 1;

    function table_init() {

        table.render({
        elem: '#logId',
        url: log_list_url,
        method: 'get',
        // request: {pageName: 'page'},			// 自定义参数			
        // where: {token: 'sasasas', id: 123} , //如果无需传递额外参数，可不加该参数
        toolbar: '#toolbarDemo',
        defaultToolbar: ['filter', 'exports', 'print', {
            title: '提示',
            layEvent: 'LAYTABLE_TIPS',
            icon: 'layui-icon-tips'
        }],
        cols: [[ // 表头
            {type: "checkbox"},
            {field: 'name', title: '日志名',sort: true},
            {title: '操作', toolbar: '#currentTableBar', align: "center"}
        ]],
        limits: [10],
        limit: 10,
        page: true,
        skin: 'line',
        response: {
            statusCode: 200 //重新规定成功的状态码为 200，table 组件默认为 0
        },
        parseData: function(res){ //将原始数据解析成 table 组件所规定的数据

            var data = [];
            for(var i=0; i<res.list.length; i++) {
                var log_obj={}
                log_obj.name = res.list[i];
                data.push(log_obj);
            }

            // console.log(data);
    
            return {
                "code": 200, //解析接口状态
                // "msg": res.msg, //解析提示文本
                "count": log_size, //解析数据长度
                "data": data, //解析数据列表
                
            };
        }
    });

    }



    /**
     * toolbar监听事件
     */
    table.on('toolbar(currentTableFilter)', function (obj) {
        if (obj.event === 'down') {
            layer.confirm('点击确定开始下载', function (index) {				   				
                var checkStatus = table.checkStatus('logId')
                    , data = checkStatus.data;						
                let str ='file:';
                for (x in data) {					
                    str += '<br>'+data[x].name;
                }
                layer.msg(str, {
                    time: 0, //2s后自动关闭
                    btn: ['OK']
                });									
                layer.close(index);		// 关闭当前层弹窗					
                // 添加下载	
                let log_dowm_url = log_dow_url;
                for (x in data) {
                    window.open(log_dowm_url+data[x].name, data[x].name);
                }						
                
            });
        } else if (obj.event === 'dele') {
            var checkStatus = table.checkStatus('logId')
                , data = checkStatus.data;	
                
            if (data.length > 0) {
                layer.confirm('真的删除么', function (index) {
                    var list = [];
                    for (x in data) {
                        list.push(data[x].name);
                    }
                    log_req_delete(list);
                    //layui中找到CheckBox所在的行，并遍历找到行的顺序
                    $("div.layui-table-body table tbody input[name='layTableCheckbox']:checked").each(function () { // 遍历选中的checkbox
                        n = $(this).parents("tbody tr").index();  // 获取checkbox所在行的顺序
                        //移除行
                        $("div.layui-table-body table tbody ").find("tr:eq(" + n + ")").remove();
                        //如果是全选移除，就将全选CheckBox还原为未选中状态
                        $("div.layui-table-header table thead div.layui-unselect.layui-form-checkbox").removeClass("layui-form-checked");
                    });
                    layer.close(index);
                        
                });
            } else {
                layer.msg('请选择文件', {
                        time: 800, //1s后自动关闭
                        btn: ['OK']
                });	
            }
            
            
        } else if (obj.event === 'refresh') {
            layer.msg('刷新中....', {
                    time: 800, //1s后自动关闭
                    btn: ['OK']
            });							
            // 执行重载
            // table.reload('logId', {
            // }, 'data');

            // 请求长度
            log_req_size();
        }
    });


    // 表格中事件
    table.on('tool(currentTableFilter)', function (obj) {
        var data = obj.data;
        if (obj.event === 'down') {
            layer.msg(data.name+'<br>准备下载，请等待下载完毕再下载下一个文件', {
                    time: 3000, //3s后自动关闭
                    btn: ['OK']
            });
            
             // let net = window.open('../api/log.json');	
             console.log(log_dow_url+data.name);
             let net = window.open(log_dow_url+data.name);
             net.addEventListener("beforeunload", (e) => {
                 
             });	
            
        } else if (obj.event === 'dele') {
            layer.confirm('真的删除么', function(index){
                // ajax请求删除log文件
                var list = [];
                list.push(data.name);
                log_req_delete(list);
                
                obj.del();
                layer.close(index);			
              });
        }
    });
    
    // ajax 删除接口
    function log_req_delete(list) {
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('POST', log_del_url, true); //第二步：打开连接
        // httpRequest.setRequestHeader("Content-type", "application/json");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）
        /**
         * 获取数据后的处理程序
         */
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        
                console.log('dele ok');
            }
        };
        httpRequest.send(JSON.stringify({
            'list':list
        }));//发送请求 将情头体写在send中
        
        // test
        console.log(JSON.stringify({'list':list}));
    }
    
    // ajax请求日志的条数
    function log_req_size() {

        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        // httpRequest.open('GET', '../api/log_size.json', true); //第二步：打开连接
        httpRequest.open('GET', log_size_url, true); //第二步：打开连接
        
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        
                console.log('req log size ok');
                console.log(httpRequest.responseText);
                var json_obj = JSON.parse(httpRequest.responseText);
                log_size = json_obj.num;
                
                table_init();

                layer.msg('刷新中....', {
                        time: 800, //1s后自动关闭
                        btn: ['OK']
                });							
                // 执行重载
                // table.reload('logId', {
                // }, 'data');
            }
        };
        httpRequest.send();
        
    }
    
    log_req_size();

});