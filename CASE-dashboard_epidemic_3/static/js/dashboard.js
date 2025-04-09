// 全局错误处理
window.onerror = function(message, source, lineno, colno, error) {
    console.error('全局错误:', message, 'at', source, lineno, colno);
    return false;
};

// 当DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM已加载，开始初始化仪表盘...');
    initDashboard();
});

// 初始化仪表盘
function initDashboard() {
    console.log('正在初始化仪表盘...');
    fetchData();
}

// 获取数据
function fetchData() {
    console.log('正在从API获取数据...');
    
    // 显示加载状态
    document.querySelectorAll('.chart').forEach(chart => {
        chart.innerHTML = '<div class="loading">加载中...</div>';
    });
    
    $.ajax({
        url: '/api/data',
        type: 'GET',
        dataType: 'json',
        timeout: 10000,  // 10秒超时
        success: function(data) {
            console.log('API返回数据:', data);
            if (data.error) {
                handleError('API返回错误: ' + data.error);
                return;
            }
            renderDashboard(data);
        },
        error: function(xhr, status, error) {
            handleError('获取数据失败: ' + status + ' - ' + error);
        }
    });
}

// 错误处理
function handleError(message) {
    console.error(message);
    alert(message);
    
    // 清除加载状态
    document.querySelectorAll('.loading').forEach(el => {
        el.innerHTML = '<div class="error">加载失败</div>';
    });
}

// 渲染仪表盘
function renderDashboard(data) {
    console.log('开始渲染仪表盘...');
    try {
        // 更新摘要信息
        updateSummary(data.summary);
        
        // 渲染图表
        renderTrendChart(data.timeTrend);
        renderGrowthRateChart(data.timeTrend);
        renderDistrictChart(data.districtData);
        renderHotspotChart(data.hotspotDistricts);
        renderMapChart(data.districtData);
        
        console.log('所有图表渲染完成');
    } catch (error) {
        handleError('渲染仪表盘失败: ' + error.message);
        console.error(error);
    }
}

// 更新摘要信息
function updateSummary(summary) {
    if (!summary) {
        console.error('摘要数据为空');
        return;
    }
    
    console.log('更新摘要信息:', summary);
    
    try {
        document.getElementById('totalConfirmed').textContent = summary.totalConfirmed || 0;
        document.getElementById('newCasesToday').textContent = summary.newCasesToday || 0;
        document.getElementById('deathCases').textContent = summary.deathCases || 0;
        document.getElementById('curedCases').textContent = summary.curedCases || 0;
        document.getElementById('updateTime').textContent = summary.latestDate || '未知';
    } catch (error) {
        console.error('更新摘要信息失败:', error);
    }
}

// 渲染趋势图
function renderTrendChart(data) {
    if (!data || data.length === 0) {
        console.error('趋势图数据为空');
        return;
    }
    
    console.log('渲染趋势图，数据点数量:', data.length);
    
    const chartDom = document.getElementById('trendChart');
    if (!chartDom) {
        console.error('找不到趋势图DOM元素');
        return;
    }
    
    try {
        const chart = echarts.init(chartDom);
        
        // 准备数据
        const dates = data.map(item => item.日期);
        const newCases = data.map(item => item.新增病例);
        const confirmedCases = data.map(item => item.确诊数);
        
        // 配置选项
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            legend: {
                data: ['每日新增', '累计确诊'],
                textStyle: { color: '#fff' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: { color: '#ddd', rotate: 45 },
                axisLine: { lineStyle: { color: '#5470c6' } }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '新增病例',
                    axisLabel: { color: '#ddd' },
                    axisLine: { lineStyle: { color: '#5470c6' } },
                    splitLine: { lineStyle: { color: 'rgba(84, 112, 198, 0.2)' } }
                },
                {
                    type: 'value',
                    name: '累计确诊',
                    axisLabel: { color: '#ddd' },
                    axisLine: { lineStyle: { color: '#91cc75' } },
                    splitLine: { lineStyle: { color: 'rgba(145, 204, 117, 0.2)' } }
                }
            ],
            series: [
                {
                    name: '每日新增',
                    type: 'bar',
                    data: newCases,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#aa4b6b' },
                            { offset: 1, color: '#6b6b83' }
                        ])
                    }
                },
                {
                    name: '累计确诊',
                    type: 'line',
                    yAxisIndex: 1,
                    data: confirmedCases,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: { width: 3, color: '#91cc75' },
                    itemStyle: { color: '#91cc75' }
                }
            ]
        };
        
        // 设置配置
        chart.setOption(option);
        
        // 响应式处理
        window.addEventListener('resize', function() {
            chart.resize();
        });
        
        console.log('趋势图渲染完成');
    } catch (error) {
        console.error('渲染趋势图失败:', error);
        chartDom.innerHTML = '<div class="error">图表渲染失败</div>';
    }
}

// 渲染增长率图
function renderGrowthRateChart(data) {
    if (!data || data.length === 0) {
        console.error('增长率图数据为空');
        return;
    }
    
    console.log('渲染增长率图，数据点数量:', data.length);
    
    const chartDom = document.getElementById('growthRateChart');
    if (!chartDom) {
        console.error('找不到增长率图DOM元素');
        return;
    }
    
    try {
        const chart = echarts.init(chartDom);
        
        // 准备数据
        const dates = data.map(item => item.日期);
        const growthRates = data.map(item => item.增长率 || 0);
        
        // 计算7日移动平均
        const movingAvg = calculateMovingAverage(growthRates, 7);
        
        // 配置选项
        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    let tip = params[0].axisValue + '<br/>';
                    params.forEach(param => {
                        if (param.value !== null && !isNaN(param.value)) {
                            tip += param.marker + ' ' + param.seriesName + ': ' + 
                                  param.value.toFixed(2) + '%<br/>';
                        }
                    });
                    return tip;
                }
            },
            legend: {
                data: ['日增长率', '7日移动平均'],
                textStyle: { color: '#fff' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: { color: '#ddd', rotate: 45 },
                axisLine: { lineStyle: { color: '#5470c6' } }
            },
            yAxis: {
                type: 'value',
                name: '增长率 (%)',
                axisLabel: { color: '#ddd', formatter: '{value}%' },
                axisLine: { lineStyle: { color: '#5470c6' } },
                splitLine: { lineStyle: { color: 'rgba(84, 112, 198, 0.2)' } }
            },
            series: [
                {
                    name: '日增长率',
                    type: 'line',
                    data: growthRates,
                    lineStyle: { width: 2, color: '#ee6666' },
                    itemStyle: { color: '#ee6666' }
                },
                {
                    name: '7日移动平均',
                    type: 'line',
                    data: movingAvg,
                    smooth: true,
                    lineStyle: { width: 3, color: '#5470c6' },
                    itemStyle: { color: '#5470c6' }
                }
            ]
        };
        
        // 设置配置
        chart.setOption(option);
        
        // 响应式处理
        window.addEventListener('resize', function() {
            chart.resize();
        });
        
        console.log('增长率图渲染完成');
    } catch (error) {
        console.error('渲染增长率图失败:', error);
        chartDom.innerHTML = '<div class="error">图表渲染失败</div>';
    }
}

// 渲染地区图表
function renderDistrictChart(data) {
    if (!data || data.length === 0) {
        console.error('地区图数据为空');
        return;
    }
    
    console.log('渲染地区图，数据点数量:', data.length);
    
    const chartDom = document.getElementById('districtChart');
    if (!chartDom) {
        console.error('找不到地区图DOM元素');
        return;
    }
    
    try {
        const chart = echarts.init(chartDom);
        
        // 取确诊数前10的地区
        const sortedData = [...data].sort((a, b) => b.确诊数 - a.确诊数).slice(0, 10);
        const districts = sortedData.map(item => item.地区);
        const confirmedCases = sortedData.map(item => item.确诊数);
        
        // 配置选项
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLabel: { color: '#ddd' },
                axisLine: { lineStyle: { color: '#5470c6' } },
                splitLine: { lineStyle: { color: 'rgba(84, 112, 198, 0.2)' } }
            },
            yAxis: {
                type: 'category',
                data: districts,
                axisLabel: { color: '#ddd' },
                axisLine: { lineStyle: { color: '#5470c6' } }
            },
            series: [
                {
                    name: '确诊病例',
                    type: 'bar',
                    data: confirmedCases,
                    itemStyle: {
                        color: function(params) {
                            const max = Math.max(...confirmedCases);
                            const ratio = params.value / max;
                            return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                { offset: 0, color: '#83bff6' },
                                { offset: ratio, color: '#188df0' },
                                { offset: 1, color: '#188df0' }
                            ]);
                        }
                    },
                    label: {
                        show: true,
                        position: 'right',
                        color: '#fff'
                    }
                }
            ]
        };
        
        // 设置配置
        chart.setOption(option);
        
        // 响应式处理
        window.addEventListener('resize', function() {
            chart.resize();
        });
        
        console.log('地区图渲染完成');
    } catch (error) {
        console.error('渲染地区图失败:', error);
        chartDom.innerHTML = '<div class="error">图表渲染失败</div>';
    }
}

// 渲染热点区域图表
function renderHotspotChart(data) {
    if (!data || data.length === 0) {
        console.error('热点区域图数据为空');
        return;
    }
    
    console.log('渲染热点区域图，数据点数量:', data.length);
    
    const chartDom = document.getElementById('hotspotChart');
    if (!chartDom) {
        console.error('找不到热点区域图DOM元素');
        return;
    }
    
    try {
        const chart = echarts.init(chartDom);
        
        const districts = data.map(item => item.地区);
        const confirmedCases = data.map(item => item.确诊数);
        const newCases = data.map(item => item.新增病例);
        
        // 配置选项
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {
                data: ['累计确诊', '新增病例'],
                textStyle: { color: '#fff' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLabel: { color: '#ddd' },
                axisLine: { lineStyle: { color: '#5470c6' } },
                splitLine: { lineStyle: { color: 'rgba(84, 112, 198, 0.2)' } }
            },
            yAxis: {
                type: 'category',
                data: districts,
                axisLabel: { color: '#ddd' },
                axisLine: { lineStyle: { color: '#5470c6' } }
            },
            series: [
                {
                    name: '累计确诊',
                    type: 'bar',
                    stack: '总量',
                    data: confirmedCases,
                    itemStyle: { color: '#5470c6' }
                },
                {
                    name: '新增病例',
                    type: 'bar',
                    stack: '总量',
                    data: newCases,
                    itemStyle: { color: '#ee6666' }
                }
            ]
        };
        
        // 设置配置
        chart.setOption(option);
        
        // 响应式处理
        window.addEventListener('resize', function() {
            chart.resize();
        });
        
        console.log('热点区域图渲染完成');
    } catch (error) {
        console.error('渲染热点区域图失败:', error);
        chartDom.innerHTML = '<div class="error">图表渲染失败</div>';
    }
}

// 计算移动平均值
function calculateMovingAverage(data, window) {
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
        if (i < window - 1) {
            result.push(null);
        } else {
            let sum = 0;
            let count = 0;
            
            for (let j = 0; j < window; j++) {
                const value = data[i - j];
                if (value !== null && !isNaN(value)) {
                    sum += value;
                    count++;
                }
            }
            
            result.push(count > 0 ? sum / count : null);
        }
    }
    
    return result;
}

// 渲染香港地图
function renderMapChart(data) {
    if (!data || data.length === 0) {
        console.error('地图数据为空');
        return;
    }
    
    console.log('渲染香港地图，数据点数量:', data.length);
    console.log('地区数据样例:', data.slice(0, 5)); // 打印前5个地区数据，查看格式
    
    const chartDom = document.getElementById('mapChart');
    if (!chartDom) {
        console.error('找不到地图DOM元素');
        return;
    }
    
    try {
        const chart = echarts.init(chartDom);
        
        // 添加中英文地区名映射
        const districtMapping = {
            // 英文名称到中文名称的映射
            'Central and Western': '中西区',
            'Eastern': '东区',
            'Islands': '离岛区',
            'Kowloon City': '九龙城区',
            'Kwai Tsing': '葵青区',
            'Kwun Tong': '观塘区',
            'North': '北区',
            'Sai Kung': '西贡区',
            'Sha Tin': '沙田区',
            'Sham Shui Po': '深水埗区',
            'Southern': '南区',
            'Tai Po': '大埔区',
            'Tsuen Wan': '荃湾区',
            'Tuen Mun': '屯门区',
            'Wan Chai': '湾仔区',
            'Wong Tai Sin': '黄大仙区',
            'Yau Tsim Mong': '油尖旺区',
            'Yuen Long': '元朗区',
            
            // 中文名称到英文名称的映射（倒转映射）
            '中西区': 'Central and Western',
            '东区': 'Eastern',
            '离岛区': 'Islands',
            '九龙城区': 'Kowloon City',
            '葵青区': 'Kwai Tsing',
            '观塘区': 'Kwun Tong',
            '北区': 'North',
            '西贡区': 'Sai Kung',
            '沙田区': 'Sha Tin',
            '深水埗区': 'Sham Shui Po',
            '南区': 'Southern',
            '大埔区': 'Tai Po',
            '荃湾区': 'Tsuen Wan',
            '屯门区': 'Tuen Mun',
            '湾仔区': 'Wan Chai',
            '黄大仙区': 'Wong Tai Sin',
            '油尖旺区': 'Yau Tsim Mong',
            '元朗区': 'Yuen Long'
        };
        
        // 准备数据
        const mapData = data.map(item => {
            // 如果是中文地区名，找到对应的英文名
            const englishName = districtMapping[item.地区] || item.地区;
            
            // 风险等级根据确诊数确定
            let riskLevel = '低风险';
            if (item.确诊数 > 5000) riskLevel = '高风险';
            else if (item.确诊数 > 2000) riskLevel = '中高风险';
            else if (item.确诊数 > 1000) riskLevel = '中风险';
            else if (item.确诊数 > 500) riskLevel = '低风险';
            else riskLevel = '极低风险';
            
            return {
                name: englishName, // 使用英文名称匹配地图
                value: item.确诊数,
                中文名: item.地区, // 保存中文名用于显示
                风险等级: riskLevel
            };
        });
        
        console.log('处理后的地图数据:', mapData.slice(0, 5));
        
        // 根据确诊数量确定风险等级颜色
        const getColor = function(value) {
            if (value > 5000) return '#7f1818'; // 高风险区域
            if (value > 2000) return '#d94e5d'; // 中高风险区域
            if (value > 1000) return '#eac736'; // 中风险区域
            if (value > 500) return '#50a3ba';  // 低风险区域
            return '#44b8cc';                   // 极低风险区域
        };
        
        // 配置选项
        const option = {
            backgroundColor: '#12274a',
            title: {
                text: '香港各区疫情分布',
                subtext: '确诊病例数和风险等级',
                left: 'center',
                textStyle: {
                    color: '#fff'
                },
                subtextStyle: {
                    color: '#ccc'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    // 使用中文名显示
                    const district = params.data.中文名 || params.name;
                    const cases = params.value || 0;
                    const risk = params.data.风险等级 || '未知';
                    return `${district}<br/>确诊病例: ${cases}<br/>风险等级: ${risk}`;
                }
            },
            visualMap: {
                min: 0,
                max: Math.max(...mapData.map(item => item.value)) || 5000,
                left: 'left',
                top: 'bottom',
                text: ['高', '低'],
                calculable: true,
                inRange: {
                    color: ['#50a3ba', '#eac736', '#d94e5d', '#7f1818']
                },
                textStyle: {
                    color: '#fff'
                }
            },
            series: [
                {
                    name: '香港各区确诊病例',
                    type: 'map',
                    map: 'HK',
                    roam: true,
                    nameProperty: 'name', // 告诉Echarts使用哪个属性作为地图匹配依据
                    emphasis: {
                        label: {
                            show: true,
                            formatter: function(params) {
                                // 显示中文地区名
                                return districtMapping[params.name] || params.name;
                            }
                        },
                        itemStyle: {
                            areaColor: '#a39eae'
                        }
                    },
                    data: mapData,
                    itemStyle: {
                        normal: {
                            areaColor: '#0d1d43',
                            borderColor: '#3fdaff',
                            borderWidth: 1
                        },
                        emphasis: {
                            areaColor: '#1b78d0'
                        }
                    },
                    label: {
                        show: true,
                        color: 'white',
                        fontSize: 9,
                        formatter: function(params) {
                            // 显示中文地区名
                            return districtMapping[params.name] || params.name;
                        }
                    }
                }
            ]
        };
        
        // 设置配置
        chart.setOption(option);
        
        // 响应式处理
        window.addEventListener('resize', function() {
            chart.resize();
        });
        
        console.log('香港地图渲染完成');
    } catch (error) {
        console.error('渲染香港地图失败:', error);
        chartDom.innerHTML = '<div class="error">地图渲染失败: ' + error.message + '</div>';
    }
}