// 加载香港地图GeoJSON数据
(function() {
    // 从外部文件加载香港地图数据
    $.ajax({
        url: '/static/js/hongkong.json',
        dataType: 'json',
        success: function(geoJson) {
            // 注册香港地图
            echarts.registerMap('HK', geoJson);
            console.log("香港地图数据加载成功");
        },
        error: function(xhr, status, error) {
            console.error("加载香港地图数据失败:", error);
        }
    });
})();