    import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
// import Page4 from './views/nav2/Page4.vue'
// import Page5 from './views/nav2/Page5.vue'
// import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
import Department from './views/org/Department'
import Employee from './views/org/Employee'
import Role from './views/permission/Role'
import Shop from './views/org/Shop'
import DictionaryType from './views/system/DictionaryType'
import ShopRegister from './views/ShopRegister'
import ShopRegister2 from './views/ShopRegister2'
import SearchMasterInfo from './views/pet/SearchMasterInfo'
import Pet from './views/pet/Pet'
import AdoptOrder from './views/pet/AdoptOrder'
import PetProduct from './views/product/PetProduct'

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/register',
        component: ShopRegister,
        name: '',
        hidden: true
    },
    {
        path: '/register2',
        component: ShopRegister2,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    //{ path: '/main', component: Main },
    {
        path: '/',
        component: Home,
        name: '系统管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/main', component: Main, name: '系统日志'},
            { path: '/table', component: Table, name: '性能监控' },
            { path: '/dic', component: DictionaryType, name: '数据字典' },
        ]
    },
   {
        path: '/',
        component: Home,
        name: '权限管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/table', component: Table, name: '菜单管理' },
            { path: '/role', component: Role, name: '角色分配' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '组织机构',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/dept', component: Department, name: '部门管理'},
            { path: '/emp', component: Employee, name: '员工管理' },
            { path: '/shop', component: Shop, name: '门店审核' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '宠物管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/searchMasterInfo', component: SearchMasterInfo, name: '寻主信息推送' },
            { path: '/pet', component: Pet, name: '上架管理' },
            { path: '/adoptOrder', component: AdoptOrder, name: '领养订单' },
            { path: '/user', component: user, name: '列表' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '服务管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/product', component: PetProduct, name: '上架管理' },
            { path: '/table', component: Table, name: 'Table' },
            { path: '/form', component: Form, name: 'Form' },
            { path: '/user', component: user, name: '列表' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '导航一',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/main', component: Main, name: '主页', hidden: true },
            { path: '/table', component: Table, name: 'Table' },
            { path: '/form', component: Form, name: 'Form' },
            { path: '/user', component: user, name: '列表' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: 'Charts',
        iconCls: 'fa fa-bar-chart',
        children: [
            { path: '/echarts', component: echarts, name: 'echarts' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;