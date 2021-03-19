var thread_status = ['close', 'init', 'ready', 'suspend'];
	var thread_error = ['RT_EOK', 'RT_ERROR', 'RT_ETIMEOUT', 'RT_EFULL', 'RT_EEMPTY', 'RT_ENOMEM', 'RT_ENOSYS', 'RT_EBUSY', 'RT_EIO', 'RT_EINTR', 'RT_EINVAL'];
	
    layui.use(['table'], function () {
        var $ = layui.jquery,
            table = layui.table;

        table.render({
            elem: '#currentTableId',
            url: '../api/sys.json',	// 数据接口
			// url: '/get?mod=thread&param=all',	// 数据接口
            toolbar: '#toolbarDemo',
            defaultToolbar: ['filter', 'exports', 'print', {
                title: '提示',
                layEvent: 'LAYTABLE_TIPS',
                icon: 'layui-icon-tips'
            }],
            cols: [[ // 表头
				{field: 'name', title: 'thread'},
				{field: 'pri', title: 'pri',sort: true},
                {field: 'stat', title: 'status'},
				{field: 'sp', title: 'sp', sort: true},
				{field: 'stack_size', title: 'stack_size',sort: true},
				{field: 'max_used', title: 'max_used', sort: true},
				{field: 'left_tick', title: 'left_tick', sort: true},
				{field: 'err', title: 'err',sort: true},
            ]],
            // limits: [10, 15, 20, 25, 50, 100],
            // limit: 10,
            // page: true,	
            skin: 'line',	// line （行边框风格）row （列边框风格）nob （无边框风格）
			id: 'thread_table',
			response: {
				statusCode: 200 //重新规定成功的状态码为 200，table 组件默认为 0
			},
			parseData: function(res){ //将原始数据解析成 table 组件所规定的数据
				
				var x;
				for (x in res.thread) {
					// 线程状态修改
					res.thread[x].stat = thread_status[res.thread[x].stat ];
					// 线程错误修改
					res.thread[x].err = thread_error[-res.thread[x].err ];
					// 线程百分比 +%
					res.thread[x].max_used = res.thread[x].max_used + '%';
				}
				
				for (x in res.thread) {
					
				}
				
				return {
					"code": 200, //解析接口状态
					// "msg": res.msg, //解析提示文本
					"count": 0, //解析数据长度
					"data": res.thread //解析数据列表
					
				};
			}
        });


        /**
         * toolbar监听事件
         */
        table.on('toolbar(currentTableFilter)', function (obj) {
            if (obj.event === 'update') {
				layer.msg('刷新中....', {
				        time: 800, //1s后自动关闭
				        btn: ['OK']
				});
			
				// 执行重载
				table.reload('thread_table', {
				}, 'data');
			}
        });
		

    });