<template>
    <section>
        <!-- 1.高级查询,新增 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="query">
                <el-form-item>
                    <el-input v-model="query.username" placeholder="姓名"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="query.phone" placeholder="电话"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="query.stateStr" placeholder="状态"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="search">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!-- 2.展示数据 -->
        <el-table :data="empList" highlight-current-row v-loading="listLoading"
                  :height="height"
                  @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="80"></el-table-column>
            <el-table-column type="index" width="80"></el-table-column>
            <el-table-column prop="username" label="姓名" width="200"></el-table-column>
            <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
            <el-table-column prop="phone" label="电话" width="200"></el-table-column>
            <!--<el-table-column prop="password" label="密码" width="300"></el-table-column>-->
            <el-table-column prop="age" label="年龄" width="100" sortable> </el-table-column>
            <el-table-column prop="state" label="状态" width="100"sortable>
                <template scope="scope">
                    <span v-if="scope.row.state === 0" style="color: lightslategrey;">待激活</span>
                    <span v-if="scope.row.state === 1" style="color: #11b95c">启用</span>
                    <span v-if="scope.row.state === -1" style="color: red">禁用</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 3.分页和批量删除 :current-page.sync="query.currentPage" 属性是帮助跳页数的分页图标必须加上-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination background layout="total, sizes, prev, pager, next, jumper"
                           @size-change="handleSizeChange"
                           @current-change="handleCurrentChange"
                           :current-page.sync="query.currentPage"
                           :page-sizes="pageSizes"
                           :page-size="query.pageSize"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>
        
        <!-- 4.新增/编辑界面 -->
        <el-dialog title="新增" :visible.sync="saveFormVisible" :close-on-click-modal="false">
            <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
                <el-form-item label="姓名" prop="username">
                    <el-input v-model="saveForm.username" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="saveForm.email" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="phone">
                    <el-input v-model="saveForm.phone" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码 " prop="password">
                    <el-input v-model="saveForm.password" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="年龄">
                    <el-input-number v-model="saveForm.age" :min="0" :max="200"></el-input-number>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="saveForm.state">
                        <el-radio class="radio" :label="1">启用</el-radio>
                        <el-radio class="radio" :label="0">未激活</el-radio>
                        <el-radio class="radio" :label="-1">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="saveFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="saveSubmit" :loading="saveLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    export default {
        data() {
            return {
                height: 550, // 固定表头

                listLoading: false, // 加载属性默认为false
                empList: [], // 数组,即查询出来的数据
                sels: [],
                total: 0, // 数据的总数
                pageSizes: [20, 40, 80, 160], // 每页显示条数
                query: {
                    pageSize: 20, // 默认10条
                    currentPage: 1, // 当前页默认1
                    username: '', // 姓名用于高级查询
                    phone: '', // 电话用于高级查询

                    stateStr: '', // 状态用于高级查询,需要转换
                    state: null,
                },

                // 新增/编辑属性
                saveFormVisible: false, // 是否显示新增/编辑界面
                saveLoading:false, // 页面是否加载
                saveForm: { // 双向绑定表单中的内容
                    username: '',
                    email: '',
                    phone: '',
                    password: '',
                    age: 0,
                    state: 0
                },
                saveFormRules: { // 规则(哪些内容必填)
                    username: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, message: '请输入邮箱', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' }
                    ],
                },

            }
        },
        methods:{
            selsChange(val) {
                // console.debug(val); // val就是具体的数据
                this.sels = val; // 赋值给sels,只有有选中的就会激活批量删除按钮
            },
            // 员工状态显示转换1, 可以在页面中写 可以加样式
            /*formatState1: function (row, column) {
                return row.state == 1 ? '启用' : row.state == 0 ? '待激活' : row.state == -1 ? '禁用' : null;
            },*/
            // 员工状态显示转换2
            formatState2: function (query) {
                return query.stateStr == '启用' ? 1 : query.stateStr == '待激活' ? 0 : query.stateStr == '禁用' ? -1 : null;
            },
            // 1.发送请求,加载页面查询真实数据(分页查询,需要两个参数pageSize和currentPage,封装到query对象中去)
            loadEmpList() {
                this.$http.post("/emp", this.query).then(res => {
                    // console.debug(res);
                    // 取出数据给属性赋值
                    let{list, total} = res.data;
                    this.empList = list;
                    this.total = total;

                })
            },
            // 2.翻页触发函数
            handleCurrentChange(val) {
                // val即点击的页数,重新赋值给currentPage
                this.query.currentPage = val;
                // 发送请求重新查询
                this.loadEmpList();
            },
            // 3.更改每页显示条数触发的函数
            handleSizeChange(val) {
                // val即更改后的显示条数,重新赋值给pageSize
                this.query.pageSize = val;
                // 重新指定currentPage为第一页
                this.query.currentPage = 1;
                // 发送请求重新查询
                this.loadEmpList();
            },
            // 4.高级查询
            search() {
                // 状态需要重新设置一下
                this.query.state = this.formatState2(this.query);
                // console.debug(this.query.state) // 0 1 -1
                // // 将query.stateStr清空
                // this.query.stateStr = '';
                // 调用loadEmpList方法
                this.loadEmpList();
                // console.debug(this.query.state) // 0 1 -1
            },
            // 5.删除单条数据
            handleDel(index, row) { // index是数据的下标, row是具体数据,其中包含id
                // console.debug(index, row.id)
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    // 发送请求删除传回id
                    this.$http.delete("/emp/" + row.id).then(res => {
                        let{success, message} = res.data;
                        if (success) { // 成功提示信息
                            this.$message({
                                type: 'success',
                                message: message
                            });
                            // 并且重新设置currentPage
                            let totalPage = Math.ceil((this.total - 1) / this.query.pageSize); // 删除一条后的总页数
                            // 如果当前页大于总页数,重新设置设置当前页为总页数(翻到上一页)
                            this.query.currentPage = this.query.currentPage > totalPage ? totalPage : this.query.currentPage;
                            // 如果当前页小于1了,删除完了,自动保持在第一页
                            this.query.currentPage = this.query.currentPage < 1 ? 1 : this.query.currentPage;
                        } else {
                            // 失败提示信息
                            this.$message.error({
                                type: 'warning',
                                message: '删除异常'
                            });
                        }
                        // 最后重新加载页面
                        this.loadEmpList();
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 6.批量删除
            batchRemove() {
                // 遍历sels将其中的id取出并且返回一个新的id数组ids
                var ids = this.sels.map(item => item.id)

                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    // 发送请求patch请求
                    this.$http.patch("/emp", ids).then(res => {
                        let{success, message} = res.data
                        if (success) { // 成功提示消息,并且重新设置currentPage
                            this.$message({
                                type: 'success',
                                message: message
                            });
                            // 并且重新设置currentPage
                            let totalPage = Math.ceil((this.total - this.sels.length) / this.query.pageSize); // 删除多条后的总页数
                            console.debug(this.query.currentPage);
                            // 如果当前页大于总页数,重新设置设置当前页为总页数(翻到上一页)
                            this.query.currentPage = this.query.currentPage > totalPage ? totalPage : this.query.currentPage;
                            // 如果当前页小于1了,删除完了,自动保持在第一页
                            this.query.currentPage = this.query.currentPage < 1 ? 1 : this.query.currentPage;
                            console.debug(this.query.currentPage);
                        } else {
                            // 失败提示
                            this.$message.error({
                                type: 'warning',
                                message: '删除异常!!'
                            });
                        }
                        // 重新加载页面
                        this.loadEmpList();
                    })
                }).catch(() => {
                    // 取消提示
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 7.新增
            handleAdd() {
                // 清空
                this.saveForm = {
                    username: '',
                    email: '',
                    phone: '',
                    password: '',
                    age: 0,
                    state: 0
                }
                this.saveFormVisible = true; // 打开界面
            },
            // 8.编辑
            handleEdit(index, row) {
                // console.debug(index ,row); // index当前数据的下标 row具体的数据,其中包括id
                // 数据回显
                this.saveForm = Object.assign({}, row);
                this.saveFormVisible = true; // 打开界面
            },
            // 9.保存
            saveSubmit() {
                // console.debug(this.saveForm); // 因为双向绑定,数据已经在里面
                // 发送请求put 添加数据即可
                this.$http.put("/emp", this.saveForm).then(res => {
                    this.saveLoading = true; // 开启加载
                    let{success, message} = res.data;
                    if (success) { // 成功,提示
                        this.$message({
                            message: message,
                            type: 'success'
                        });
                        console.debug(this.query.currentPage) // 不管在哪一页这个页数都是添加前的最后一页
                        // 重新设置currentPage
                        let totalPage = Math.ceil((this.total + 1) / this.query.pageSize); // 添加一条后的总页数
                        // 如果当前页小于总页数,重新设置设置当前页为总页数(翻页)
                        this.query.currentPage = this.query.currentPage < totalPage ? totalPage : this.query.currentPage;
                    } else {
                        // 失败提示
                        this.$message.error({
                            message: '操作异常',
                            type: 'warning'
                        });
                    }
                    // 最后关闭加载效果,关闭界面
                    this.saveLoading = false;
                    this.saveFormVisible = false;
                    // 重新加载页面
                    this.loadEmpList();
                    // total手动
                    this.total ++;
                    console.debug(this.query.currentPage)
                })
            }
        },
        mounted() {
            this.loadEmpList();
        }
    }

</script>

<style scoped>

</style>