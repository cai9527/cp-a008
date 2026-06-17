export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/records/index',
    'pages/statistics/index',
    'pages/mine/index',
    'pages/login/index',
    'pages/field-checkin/index',
    'pages/leave-apply/index',
    'pages/leave-records/index',
    'pages/record-detail/index',
    'pages/change-password/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1677FF',
    navigationBarTitleText: '考勤打卡',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1677FF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/records/index',
        text: '记录'
      },
      {
        pagePath: 'pages/statistics/index',
        text: '统计'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
