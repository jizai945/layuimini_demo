layui.use(['layer', 'util', 'treeTable'], function () {
    var $ = layui.jquery;
    var layer = layui.layer;
    var util = layui.util;
    var treeTable = layui.treeTable;
    $('body').removeClass('layui-hide');

    var roboturl = '../api/robot.json';
    // var roboturl = 'http://192.168.2.1/get_cfg?mod=robot_request&param=list';
    var robot_stat = ['呼梯中', '乘梯中', '已出梯'];
    var autoTimer = null;
    // 渲染表格
    var insTb = treeTable.render({
        elem: '#demoTreeTb',
        url: roboturl,
        // toolbar: 'default',
        // height: 'full-200',
        tree: {
            iconIndex: 1,
            isPidData: true,
            idName: 'authorityId',
            pidName: 'parentId',
            getIcon: function (d) {                      // 自定义图标
                var haveChild = d[this.haveChildName];
                if (haveChild !== undefined) {
                    haveChild = haveChild === true || haveChild === 'true';
                    if (this.haveChildReverse) haveChild = !haveChild;
                }
                else if (d[this.childName]) haveChild = d[this.childName].length > 0;
                if (haveChild) return '<i class="ew-tree-icon layui-icon layui-icon-top"></i>';
                else return '<i class="ew-tree-icon layui-icon layui-icon-subtraction"></i>';
            }
        },
        defaultToolbar: ['filter', 'print', 'exports', {
            title: '提示',
            layEvent: 'LAYTABLE_TIPS',
            icon: 'layui-icon-tips'
        }],
        cols: [
            [
                {title: '机器人请求列表', colspan: 9},
            ],
            [
                {type: 'numbers'},
                {field: 'authorityName', title: '', minWidth: 165},
                {field: 'authority', title: ''},
            ]
        ],
        // style: 'margin-top:0;',
        parseData: function(res) {
            console.log(res);
            // return res;
            var json_obj = new Object();
            var data = new Array();
            json_obj.count = res.robot_list.length*4;
            json_obj.msg = '';
            json_obj.code = 0;
            for (var i=0; i<res.robot_list.length; i++) {  
                var sub_obj = new Object();
                sub_obj.isMenu = 0;
                sub_obj.open = true;
                sub_obj.authorityId = i * 4;
                sub_obj.authorityName = '机器人ID'+res.robot_list[i].id;
                sub_obj.authority = null;
                sub_obj.parentId = -1;
                data.push(sub_obj);
                var sub_obj = new Object();
                sub_obj.isMenu = 0;
                sub_obj.open = true;
                sub_obj.authorityId ++;
                sub_obj.authorityName = '机器人状态';
                sub_obj.authority =  robot_stat[res.robot_list[i].stat];
                sub_obj.parentId = i * 4;
                data.push(sub_obj);
                var sub_obj = new Object();
                sub_obj.isMenu = 0;
                sub_obj.open = true;
                sub_obj.authorityId ++;
                sub_obj.authorityName = '呼叫楼梯';
                sub_obj.authority = res.robot_list[i].call_floor;
                sub_obj.parentId = i * 4;
                data.push(sub_obj);
                var sub_obj = new Object();
                sub_obj.isMenu = 0;
                sub_obj.open = true;
                sub_obj.authorityId ++;
                sub_obj.authorityName = '目标楼梯';
                sub_obj.authority = res.robot_list[i].target_floor;
                sub_obj.parentId = i * 4;
                data.push(sub_obj);

            }
            json_obj.data = data;
            console.log(json_obj);
            return json_obj;
        }
    });

    // 全部展开
    $('#btnExpandAll').click(function () {
        insTb.expandAll();
    });

    // 全部折叠
    $('#btnFoldAll').click(function () {
        insTb.foldAll();
    });

    // 自动刷新
    $('#btnAutoRefresh').click(function () {
        if (null == autoTimer) {  
            layer.msg('自动刷新...', {
                time: 500, 
                btn: ['OK']
            });	
            insTb.refresh();  
            $('#btnAutoRefresh').removeClass('layui-btn-normal');
            $('#btnAutoRefresh').addClass('layui-btn-danger');
            $('#btnAutoRefresh').html('停止');
            autoTimer = setInterval(function () {	
                insTb.refresh();                 
            }, 1000);
        } else {
            $('#btnAutoRefresh').removeClass('layui-btn-danger');
            $('#btnAutoRefresh').addClass('layui-btn-normal');
            $('#btnAutoRefresh').html('自动刷新(1s)');
            clearInterval(autoTimer);        //关闭循环
            autoTimer = null;
        }
    });

    // 刷新
    $('#btnRefresh').click(function () {
        insTb.refresh();
    });

    // 获取选中
    $('#btnGetChecked').click(function () {
        layer.alert('<pre>' + JSON.stringify(insTb.checkStatus().map(function (d) {
            return {
                authorityName: d.authorityName,
                authorityId: d.authorityId,
                LAY_INDETERMINATE: d.LAY_INDETERMINATE
            };
        }), null, 3) + '</pre>');
    });

    // 演示侧边栏
    $('#btnToggleSide').click(function () {
        $('.demo-side').toggleClass('show');
    });

});