<template>
    <section>
        <!-- 1.查询/新增 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="query">
                <el-form-item>
                    <el-input v-model="query.keywords" placeholder="姓名"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="serach">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!-- 2.数据展示,编辑,单条删除 -->
        <el-table :data="listData" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="name" label="店名" width="120"></el-table-column>
            <el-table-column prop="tel" label="电话" width="120"></el-table-column>
            <el-table-column prop="registerTime" label="注册日期" width="120" sortable></el-table-column>
            <el-table-column prop="state" label="状态" width="100" sortable></el-table-column> <!-- :formatter="formatState" -->
            <el-table-column prop="address" label="地址" min-width="180" sortable></el-table-column>
            <el-table-column prop="logo" label="标志" width="120"></el-table-column>
            <el-table-column prop="admin_id" label="adminId" width="120"></el-table-column>

            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 3.分页,批量删除 -->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="total ,sizes, prev, pager, next, jumper"
                           background
                           @current-change="handleCurrentChange"
                           @size-change="handleSizeChange"
                           :current-page.sync="query.currentPage"
                           :page-sizes="pageSizes"
                           :page-size="query.pageSize"
                           :total="total"
                           style="float:right;">
            </el-pagination>
        </el-col>
    </section>
</template>

<script>
    export default {
        data() {
            return {
                listData: [], // 展示的数据
                listLoading: false, // 加载效果,默认false
                sels: [], // 多选框
                total: 0, // 数据总数
                query: { // 查询的数据,封装到query对象中
                    currentPage: 1,
                    pageSize: 5,
                    keywords: ''
                },
                pageSizes: [5, 10, 15, 30]
            }
        },
        methods: {
            // 状态转换
            /*formatState() {

            },*/
            // 多选框函数
            selsChange() {

            },
            //1.查询数据函数
            loadListData() {
                // post请求
                this.$http.post("/shop", this.query).then(res => {
                    // 取出返回的total和list数据
                    let{total, list} = res.data;
                    // 给属性赋值
                    this.total = total;
                    this.listData = list;
                })
            },
            // 2.高级查询
            serach() {
                // 查询的数据都在query中,调用查询数据函数即可
                this.loadListData();
            },
            // 3.翻页函数
            handleCurrentChange(val) { // val就是页码
                // 赋值给当前页属性
                this.query.currentPage = val;
                // 调用查询方法
                this.loadListData();
            },
            // 4.更改每页显示条数函数
            handleSizeChange(val) { // 修改的每页显示条数
                // 赋值给pageSize
                this.query.pageSize = val;
                // 手动设置currentPage为1
                this.query.currentPage = 1;
                // 调用查询方法
                this.loadListData();
            },


            // 5.删除
            handleDel(index, row) {

            },
            // 6.批量删除
            batchRemove() {

            },
            // 7.编辑
            handleEdit(index, row) {

            },
            // 8.新增
            handleAdd() {

            },
            // 9.提交保存


        },
        mounted() {
            // 页面已加载就调用查询函数
            this.loadListData();
        }
    }



</script>

<style scoped>

</style>