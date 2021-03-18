layui.use(['echarts', 'form'], function () {
    var $ = layui.jquery,
        form = layui.form;	
        echarts = layui.echarts;

    var senser_req_url = 'http://192.168.2.1/get?mod=sensor&param=all';
    // var senser_req_url = '../api/senser.json';
    
    //  -------------------------------- 陀螺仪 ------------------------------------------------
    var echartGyro = echarts.init(document.getElementById('gyroChart'), 'walden');
    option = {
         title: {
                text: '陀螺仪数据',
                subtext: '单位:度 ',
        },			
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            splitLine: {show: false},
            data: ['X', 'Y', 'Z']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [0, 0, 0],				
            type: 'bar',
            label: {
                show: true,
                position: 'outside'
            },
            backgroundStyle: {
                color: 'rgba(220, 220, 220, 0.8)'
            }
        }]
    };
    echartGyro.setOption(option);
    
    // -------------------------------- 加速度传感器 ------------------------------------------------
    var echartAccel = echarts.init(document.getElementById('accelChart'), 'walden');
    option2 = {
         title: {
                text: '加速度传感器数据',
                subtext: '单位:XXX ',
        },			
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            splitLine: {show: false},
            data: ['X', 'Y', 'Z']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [0, 0, 0],				
            type: 'bar',
            label: {
                show: true,
                position: 'outside'
            },
            backgroundStyle: {
                color: 'rgba(220, 220, 220, 0.8)'
            }
        }]
    };
    echartAccel.setOption(option2);
    
    // -------------------------------- 大气压传感器------------------------------------------------
    var ecartBaroceptor = echarts.init(document.getElementById('baroceptorChart'));
    option3 = {
        title: {
            text: '大气压传感器数据',
            subtext: '单位:XXX ',
        },	
        tooltip: {
            formatter: '{a} <br/>{b} : {c}%'
        },
        series: [{
            name: 'Pressure',
            type: 'gauge',
            min: 0,
            max: 1000,
            detail: {
                formatter: '{value}'
            },
            data: [{
                value: 0,
                name: 'SCORE'
            }]
        }]
    };

    ecartBaroceptor.setOption(option3);
    
    // -------------------------------- 门状态------------------------------------------------
    // id: 1 or 2
    // state: false=close true=open
    function door_change(id, state) {
        let name_str;
        if (id == 1) {
            name_str = 'id1';
        } else if (id == 2) {
            name_str = 'id2';
        } else {
            return ;
        }

        // 改变check_box状态
        $("input[type='checkbox'][name="+name_str+"]").prop("checked", state);
        form ? form.render("checkbox") : null;
    }

    function ajax_req_senser() {
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('GET', senser_req_url, true); //第二步：打开连接
        
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        

                // console.log(httpRequest.responseText);
                var json_obj = JSON.parse(httpRequest.responseText);
                // console.log(json_obj.gyro);
                // 陀螺仪
                option.series[0].data[0] = json_obj.gyro.x;
                option.series[0].data[1] = json_obj.gyro.y;
                option.series[0].data[2] = json_obj.gyro.z;
                echartGyro.setOption(option);
                // 加速度
                option2.series[0].data[0] = json_obj.accel.x;
                option2.series[0].data[1] = json_obj.accel.y;
                option2.series[0].data[2] = json_obj.accel.z;
                echartAccel.setOption(option2);
                // 大气压
                option3.series[0].data[0].value = json_obj.baroceptor;
                ecartBaroceptor.setOption(option3);
                // door_id 
                door_change(json_obj.metal[0].sw_id, json_obj.metal[0].stat == 0? false:true);
                door_change(json_obj.metal[1].sw_id, json_obj.metal[1].stat == 0? false:true);
            }
        };
        httpRequest.send();
    }
    ajax_req_senser();
    
    setInterval(function () {	
        
        // ajax请求
        ajax_req_senser()
        
    }, 3000);
    
    
});