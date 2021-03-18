layui.use(['table'], function () {
    var $ = layui.jquery,
        table = layui.table;
        
    // 调试切换
    var wifi_table_url = 'http://192.168.2.1/get?mod=wifi&p=all';	// 实际使用的接口
    var lora_table_url = 'http://192.168.2.1/get?mod=lora&param=channel';
    var rfid_table_url = 'http://192.168.2.1/get_cfg?mod=rfid&param=all';
    // var wifi_table_url = '../api/wifi.json';	// 测试的接口
    // var lora_table_url = '../api/lora.json';
    // var rfid_table_url = '../api/rfid.json';
    var wifi_save_url = 'http://192.168.2.1/set?mod=wifi';
    var lora_save_url = 'http://192.168.2.1/set?mod=lora';
    var rfid_save_url = 'http://192.168.2.1/set?mod=rfid';

    // ---------------------------------- wifi -------------------------------------------------
    table.render({
        elem: '#wifitableId',
        url: wifi_table_url,
        toolbar: '#wifi_toolbar',
        defaultToolbar: ['filter', 'exports', 'print', {
            title: '提示',
            layEvent: 'LAYTABLE_TIPS',
            icon: 'layui-icon-tips'
        }],
        cols: [[ // 表头
            {type: "checkbox"},
            {field: 'key', title: '参数',sort: true},
            {field: 'value',  title: '值', edit: 'text'},
            {title: '操作', toolbar: '#currentTableBar', align: "center"}
        ]],
        // limits: [10, 15, 20, 25, 50, 100],
        // limit: 10,
        // page: true,
        skin: 'line',
        response: {
            statusCode: 200 //重新规定成功的状态码为 200，table 组件默认为 0
        },
        parseData: function(res){ //将原始数据解析成 table 组件所规定的数据
            console.log(res);			
            let array = [];
            
            for(let key in res){	
                let obj = new Object();
                obj.key = key;
                obj.value = res[key];
                array.push(obj);
            }
            
            let obj = new Object();
            obj.key = 'pwd';
            obj.value = '******';
            array.push(obj);
            
            return {
                "code": 200, //解析接口状态
                // "msg": res.msg, //解析提示文本
                "count": array.length, //解析数据长度
                "data": array //解析数据列表
            };
        }
        
    });

    // 转换成wifi的json格式数据
    // ok: 返回0
    // fail：返回-1
    function wifi_param_to_json(data, json_obj) {
        if (data.key == 'channel') {
                if (data.value.constructor == Number) {
                    json_obj.ch = data.value;
                } else {
                    json_obj.ch = parseInt(data.value);
                }
            } else if ((data.key == 'ssid')) {
                json_obj.ssid = data.value;
            } else if (data.key == 'pwd') {					
                if (data.value.length < 8 || data.value.length > 31) {
                    layer.msg('密码长度不对', {
                        time: 2000, //2s后自动关闭
                        btn: ['OK']
                    });	
                    return -1;
                }
                json_obj.pwd = data.value;
            } else {
                layer.msg('该参数:{'+data.key+'}不支持修改', {
                        time: 2000, //2s后自动关闭
                        btn: ['OK']
                });	
                return -1;
            }
        return 0;
    }

    /**
     * toolbar监听事件
     */
    table.on('toolbar(wifiTableFilter)', function (obj) {
        if (obj.event === 'save') {
            var checkStatus = table.checkStatus('wifitableId')
                , data = checkStatus.data;	
                
            if (data.length > 0) {
                layer.confirm('真的保存么', function (index) {
                    console.log('确认保存');
                    
                    var checkStatus = table.checkStatus('wifitableId')
                        , data = checkStatus.data;
                    console.log(JSON.stringify(data));
                    // layer.alert(JSON.stringify(data))
                    layer.close(index);		// 关闭当前层弹窗

                    // 添加发送ajax的接口
                    let json_obj = new Object();

                    for (let i=0; i<data.length; i++) {
                        
                        if (wifi_param_to_json(data[i], json_obj) < 0) {
                            return;
                        }
                    }

                    layer.msg('保存中...', {
                        time: 1000, //2s后自动关闭
                        btn: ['OK']
                    });	
                    ajax_req_change_value(wifi_save_url, json_obj);
                        
                });
            }
            
        } else if (obj.event === 'update') {
            layer.msg('刷新中....', {
                    time: 800, //1s后自动关闭
                    btn: ['OK']
            });
                            
            // 执行重载
            table.reload('wifitableId', {
            }, 'data');
        }
    });


    // 表格中事件
    table.on('tool(wifiTableFilter)', function (obj) {
        var data = obj.data;
        if (obj.event === 'save') {
            let json_obj = new Object();

            if (wifi_param_to_json(data, json_obj) < 0) {
                return;
            }
            
            layer.msg('保存中...', {
                    time: 1000, //2s后自动关闭
                    btn: ['OK']
            });	
            
            ajax_req_change_value(wifi_save_url, json_obj);			
            
            // layer.alert('编辑行：<br>'+ JSON.stringify(data))								
        } 
    });
    
    // ---------------------------------- lora -------------------------------------------------
    table.render({
        elem: '#loratableId',
        url: lora_table_url,
        toolbar: '#lora_toolbar',
        defaultToolbar: ['filter', 'exports', 'print', {
            title: '提示',
            layEvent: 'LAYTABLE_TIPS',
            icon: 'layui-icon-tips'
        }],
        cols: [[ // 表头
            {type: "checkbox"},
            {field: 'key', title: '参数',sort: true},
            {field: 'value',  title: '值', edit: 'text'},
            {title: '操作', toolbar: '#loraTableBar', align: "center"}
        ]],
        // limits: [10, 15, 20, 25, 50, 100],
        // limit: 10,
        // page: true,
        skin: 'line',
        response: {
            statusCode: 200 //重新规定成功的状态码为 200，table 组件默认为 0
        },
        parseData: function(res){ //将原始数据解析成 table 组件所规定的数据
            console.log(res);
            let array = [];
            
            for(let key in res){
                let obj = new Object();
                obj.key = key;
                obj.value = res[key];
                array.push(obj);
            }
            
            return {
                "code": 200, //解析接口状态
                // "msg": res.msg, //解析提示文本
                "count": array.length, //解析数据长度
                "data": array //解析数据列表
            };
        }
        
    });
    
    // 转换成lora的json格式数据
    // ok: 返回0
    // fail：返回-1
    function lora_param_to_json(data, json_obj) {
        if (data.key == 'channel') {
                if (data.value.constructor == Number) {
                    json_obj.ch = data.value;
                } else {
                    json_obj.ch = parseInt(data.value);
                }
                if (json_obj.ch < 464 || json_obj.ch > 515) {
                    layer.msg('参数范围:464~515,修改失败', {
                        time: 2000, //2s后自动关闭
                        btn: ['OK']
                    });	
                    return -1;
                }
            } else {
                layer.msg('该参数:{'+data.key+'}不支持修改', {
                        time: 2000, //2s后自动关闭
                        btn: ['OK']
                });	
                return -1;
            }
        return 0;
    }

    /**
     * toolbar监听事件
     */
    table.on('toolbar(loraTableFilter)', function (obj) {
        if (obj.event === 'save') {
            var checkStatus = table.checkStatus('loratableId')
                , data = checkStatus.data;	
                
            if (data.length > 0) {
                layer.confirm('真的保存么', function (index) {
                    console.log('确认保存');
                    
                    var checkStatus = table.checkStatus('loratableId')
                        , data = checkStatus.data;
                    console.log(JSON.stringify(data));
                    // layer.alert(JSON.stringify(data))
                    layer.close(index);		// 关闭当前层弹窗

                    // 添加发送ajax的接口
                    let json_obj = new Object();
                    
                    for (let i=0; i<data.length; i++) {					
                        if (lora_param_to_json(data[i], json_obj) < 0) {
                            return;
                        }
                    }

                    layer.msg('保存中...', {
                        time: 1000, //2s后自动关闭
                        btn: ['OK']
                    });	
                    ajax_req_change_value(lora_save_url, json_obj);
                                                
                });
            }
            
        } else if (obj.event === 'update') {
            layer.msg('刷新中....', {
                    time: 800, //1s后自动关闭
                    btn: ['OK']
            });
                            
            // 执行重载
            table.reload('loratableId', {
            }, 'data');
        }
    });
    
    
    // 表格中事件
    table.on('tool(loraTableFilter)', function (obj) {
        var data = obj.data;
        if (obj.event === 'save') {
            let json_obj = new Object();
            
            if (lora_param_to_json(data, json_obj) < 0) {
                return;
            }
            
            layer.msg('保存中...', {
                    time: 1000, //2s后自动关闭
                    btn: ['OK']
            });	
            ajax_req_change_value(lora_save_url, json_obj);					    	
        } 
    });
    
    // ---------------------------------- rfid -------------------------------------------------
    table.render({
        elem: '#rfidtableId',
        url: rfid_table_url,
        toolbar: '#rfid_toolbar',
        defaultToolbar: ['filter', 'exports', 'print', {
            title: '提示',
            layEvent: 'LAYTABLE_TIPS',
            icon: 'layui-icon-tips'
        }],
        cols: [[ // 表头
            {type: "checkbox"},
            {field: 'key', title: '参数',sort: true},
            {field: 'value',  title: '值', edit: 'text'},
            {title: '操作', toolbar: '#currentTableBar', align: "center"}
        ]],
        // limits: [10, 15, 20, 25, 50, 100],
        // limit: 10,
        // page: true,
        skin: 'line',
        response: {
            statusCode: 200 //重新规定成功的状态码为 200，table 组件默认为 0
        },
        parseData: function(res){ //将原始数据解析成 table 组件所规定的数据
            console.log(res);			
            let array = [];
            
            for(let key in res){
                let obj = new Object();
                if (key == 'rfid') {
                    for (let sub_key in res.rfid) {
                        // if (sub_key == )
                        let obj = new Object();
                        obj.key = 'rfid_'+sub_key;
                        obj.value = res.rfid[sub_key];
                        array.push(obj);
                    }
                } else {
                    obj.key = key;
                    obj.value = res[key];
                    array.push(obj);
                }
            }
            
            return {
                "code": 200, //解析接口状态
                // "msg": res.msg, //解析提示文本
                "count": array.length, //解析数据长度
                "data": array //解析数据列表
            };
        }
        
    });
    
    // 转换成rfid的json格式数据
    // ok: 返回0
    // fail：返回-1
    function rfid_param_to_json(data, json_obj) {
        if (data.key == 'chan_code') {
                if (data.value.constructor == Number) {
                    json_obj.chan_code = data.value;
                } else {
                    json_obj.chan_code = parseInt(data.value);
                }
            } else if(data.key == 'area_code') {
                if (data.value.constructor == Number) {
                    json_obj.area_code = data.value;
                } else {
                    json_obj.area_code = parseInt(data.value);
                }
            } else if(data.key == 'power') {
                if (data.value.constructor == Number) {
                    json_obj.power = data.value;
                } else {
                    json_obj.power = parseInt(data.value);
                }
                
                if (json_obj.power < 1500 || json_obj.power > 2600) {
                    layer.msg('参数范围:1500~2600,修改失败', {
                            time: 2000, //2s后自动关闭
                            btn: ['OK']
                    });
                    return -1;
                }
            } else {
                layer.msg('该参数:{'+data.key+'}不支持修改', {
                        time: 2000, //2s后自动关闭
                        btn: ['OK']
                });	
                return -1;
            }
        return 0;
    }


    /**
     * toolbar监听事件
     */
    table.on('toolbar(rfidTableFilter)', function (obj) {
        if (obj.event === 'save') {
            var checkStatus = table.checkStatus('rfidtableId')
                , data = checkStatus.data;	
                
            if (data.length > 0) {
                layer.confirm('真的保存么', function (index) {
                    console.log('确认保存');
                    
                    var checkStatus = table.checkStatus('rfidtableId')
                        , data = checkStatus.data;
                    console.log(JSON.stringify(data));
                    // layer.alert(JSON.stringify(data))
                    layer.close(index);		// 关闭当前层弹窗

                    // 添加发送ajax的接口
                    let json_obj = new Object();
                    
                    for (let i=0; i<data.length; i++) {					
                        if (rfid_param_to_json(data[i], json_obj) < 0) {
                            return;
                        }
                    }

                    layer.msg('保存中...', {
                        time: 1000, //2s后自动关闭
                        btn: ['OK']
                    });	
                    ajax_req_change_value(rfid_save_url, json_obj);				
                });
            }
            
        } else if (obj.event === 'update') {
            layer.msg('刷新中....', {
                    time: 800, //1s后自动关闭
                    btn: ['OK']
            });
                            
            // 执行重载
            table.reload('rfidtableId', {
            }, 'data');
        }
    });
    
    
    // 表格中事件
    table.on('tool(rfidTableFilter)', function (obj) {
        var data = obj.data;
        if (obj.event === 'save') {
            let json_obj = new Object();
            
            if (rfid_param_to_json(data, json_obj) < 0) {
                return;
            }
            
            layer.msg('保存中...', {
                    time: 1000, //2s后自动关闭
                    btn: ['OK']
            });	
            ajax_req_change_value(rfid_save_url, json_obj);			
            
        } 
    });
    
    //  ajax请求修改参数
    function ajax_req_change_value(url, json_obj) {
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('POST', url, true); //第二步：打开连接			
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        

            }
        };
        console.log(json_obj);
        httpRequest.send(JSON.stringify(json_obj));
    }
    
});