layui.use(['layer', 'echarts'], function () {
    var $ = layui.jquery,
        layer = layui.layer,
        // miniTab = layui.miniTab,
        echarts = layui.echarts;

    // miniTab.listen();

    // var ajax_url = 'http://192.168.2.1/get?mod=system&p=mem_stat&p=rtt_ver&p=app_ver&p=bl_ver&p=fs_stat&p=sys_time&p=elv_ids';
    var ajax_url = '../api/device.json';
    // ------------------------------ RAM图表 -----------------------------------------
    var chartDom = document.getElementById('echarts1');
    var myChart1 = echarts.init(chartDom);
    var option1;
    
    option1 = {
        title: {
            text: '内存使用',
            subtext: '仅供参考',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
        },
        series: [
            {
                name: '访问来源',
                type: 'pie',
                radius: '50%',
                data: [
                    {value: 0, name: 'loading'},
                    {value: 1, name: 'loading'},
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    
    option1 && myChart1.setOption(option1);

    // ------------------------------ 文件系统图表 -----------------------------------------
    var chartDom = document.getElementById('echarts2');
    var myChart2 = echarts.init(chartDom);
    var option2;
    
    option2 = {
        title: {
            text: '文件系统使用',
            subtext: '仅供参考',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
        },
        series: [
            {
                name: '访问来源',
                type: 'pie',
                radius: '50%',
                data: [
                    {value: 0, name: 'loading'},
                    {value: 1, name: 'loading'},
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    
    option2 && myChart2.setOption(option2);
    
    // ajax请求设备信息
    function ajax_req_device() {
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('GET', ajax_url, true); //第二步：打开连接       
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功		        
                console.log(httpRequest.responseText);
                let json_obj = JSON.parse(httpRequest.responseText);
                
                let ram_max = json_obj.mem_total;
                let ram_use = json_obj.mem_used;
                let ram_unuse = ram_max- ram_use;
                let fs_max = json_obj.fs_total;
                let fs_use = json_obj.fs_used;
                let fs_unuse = fs_max- fs_use;
                
                option1.series[0].data[0].value = ram_use;
                option1.series[0].data[0].name = '已使用'+ ((ram_use*100)/ram_max).toFixed(2) + '%';
                option1.series[0].data[1].value = ram_unuse;
                option1.series[0].data[1].name = '未使用'+ ((ram_unuse*100)/ram_max).toFixed(2) + '%';
                option1 && myChart1.setOption(option1);
                
                option2.series[0].data[0].value = fs_use;
                option2.series[0].data[0].name = '已使用'+ ((fs_use*100)/fs_max).toFixed(2) + '%';
                option2.series[0].data[1].value = fs_unuse;
                option2.series[0].data[1].name = '未使用'+ ((fs_unuse*100)/fs_max).toFixed(2) + '%';
                option2 && myChart2.setOption(option2);
                
                $("#staircase_id").html(json_obj.elv_ids);
                $("#rtos_ver_id").html(json_obj.rtt_ver);
                $("#app_ver_id").html(json_obj.app_ver);
                $("#boot_ver_id").html(json_obj.bl_ver);
                $("#tick_id").html(json_obj.sys_time);
                $("#ram_max_id").html(json_obj.mem_total);
                $("#ram_use_id").html(json_obj.mem_used);
                $("#ram_maxuse_id").html(json_obj.mem_max_used);
                $("#fs_max_id").html(json_obj.fs_total);
                $("#fs_use_id").html(json_obj.fs_used);
            }
        };
        httpRequest.send();
    }
    
    ajax_req_device();	
    
    // echarts 窗口缩放自适应
    window.onresize = function(){
        myChart1.resize();
        myChart2.resize();
    }
    
});
