<template>
    <section>
        <!-- 1.高级查询,添加 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="query">
                <el-form-item>
                    <el-input v-model="query.keywords" placeholder="部门名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="search">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!-- 2.数据展示,单挑删除,编辑 -->
        <el-table :data="listData" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="部门名称" width="120"></el-table-column>
            <el-table-column prop="sn" label="部门编号" width="120"></el-table-column>
            <el-table-column prop="state" label="状态" width="100" :formatter="formatSex" sortable>
            </el-table-column>
            <!-- manager.username取出主管名 -->
            <el-table-column prop="manager.username" label="主管" width="100">
            </el-table-column>
            <!-- parent.name取出上级部门名 -->
            <el-table-column prop="parent.name" label="上级部门" width="120">
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 3.分页和批量删除工具条- -->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="total, prev, pager, next"
                           @current-change="handleCurrentChange"
                           :current-page.sync="query.currentPage"
                           :page-size="query.pageSize"
                           :total="total"
                           style="float:right;">
            </el-pagination>
        </el-col>

        <!-- 4.编辑/新增的界面 -->
        <!--
			 4.1.saveFormVisible   默认隐藏添加/编辑的界面
		     4.2 saveForm          添加/编辑界面的数据,双向绑定
		     4.3 saveFormRules     规则
		     4.4 saveSubmit        提交的函数
		     4.5 saveLoading       是否加载
		-->
        <el-dialog title="新增" :visible.sync="saveFormVisible" :close-on-click-modal="false">
            <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
                <el-form-item label="部门名称" prop="name">
                    <el-input v-model="saveForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="部门编号" prop="sn">
                    <el-input v-model="saveForm.sn" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="saveForm.state">
                        <el-radio class="radio" :label="1">启用</el-radio>
                        <el-radio class="radio" :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="主管" prop="">
                    <!--
                        下拉选框:
                            v-model="saveForm.manager" 双向绑定
                            v-for="emp in employees"   遍历循环,展示所有的主管,emp就是遍历到的每一个
                            :key="emp.id"              唯一标识,用来做回显
                            value-key="id"             使用上面的唯一表示,来做回显(Select 的绑定值为对象类型，请务必指定 value-key 作为它的唯一性标识。)
                            :label                     展示出来的具体内容
                            :value="emp"               需要提交的数据这里直接提交对象
                            clearable                  可以清空选项
                            filterable                 简单检索
                    -->
                    <el-select v-model="saveForm.manager" value-key="id" placeholder="请选择" clearable filterable>
                        <el-option
                                v-for="emp in employees"
                                :key="emp.id"
                                :label="emp.username"
                                :value="emp">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="上级部门" prop="">
                    <el-select v-model="saveForm.parent" value-key="id" placeholder="请选择" clearable  filterable>
                        <!--
                        下拉选框:
                            v-model="saveForm.parent"          双向绑定
                            v-for="sd in superiorDepartment"   遍历循环,展示所有的主管,sd就是遍历到的每一个对象
                            :key="sd.id"                       唯一标识,用来做回显
                            value-key="id"                     使用上面的唯一表示,来做回显(Select 的绑定值为对象类型，请务必指定 value-key 作为它的唯一性标识。)
                            :label="sd.username"               展示出来的具体内容
                            :value="sd"                        需要提交的数据这里直接提交对象
                            clearable                          可以清空选项
                            filterable                         简单检索
                            :disabled="sd.name === saveForm.name" 当是自己的部门时不能选自己为上级部门
                    -->
                        <el-option
                                v-for="sd in superiorDepartments"
                                :disabled="sd.name === saveForm.name"
                                :key="sd.id"
                                :label="sd.name"
                                :value="sd">
                        </el-option>
                    </el-select>
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
                listLoading: false,
                listData: [],
                sels: [],
                total: 0, // 数据总条数
                query: {
                    currentPage: 1,
                    pageSize: 5, // 绑定数据,每页展示的数据条数
                    keywords: '' // 关键字查询
                },

                // 编辑/修改的属性
                saveFormVisible: false, // 默认隐藏添加/编辑的界面
                saveLoading: false,
                // 添加/编辑的界面规则
                saveFormRules: {
                    name: [
                        { required: true, message: '请输入部门', trigger: 'blur' }
                    ],
                    sn: [
                        { required: true, message: '请输入部门编号', trigger: 'blur' }
                    ]
                },
                saveForm: { // 添加/编辑的界面数据,数据双向绑定
                    id: null,
                    name: '',
                    sn: '',
                    state: 1, // 默认启用
                    manager: null,
                    parent: null
                },
                // 下拉框employees属性,默认为空
                employees: [],

                // 下拉框superiorDepartment属性,默认为空
                superiorDepartments: []
            }
        },
        methods: {
            // 多选框勾选函数
            selsChange(val) {
                console.debug(val); // val就是多选框勾选的具体的数据
                this.sels = val; // 赋值给sels属性,这样就可以动态启用批量删除按钮
            },
            // 启用状态显示转换
            formatSex: function (row, column) {
                return row.state == 1 ? '启用' : row.state == 0 ? '禁用' : '未知';
            },
            // 查询方法
            loadListData() {
                /*
                    1.使用真实的数据返回,即向后端发送请求(会有跨域问题)
                    2.需要注释掉main.js中的mock,以及前置登录拦截器
                    3.分页查询,请求方式改为post,需要发送两个参数,这里直接封装到query对象中
                */
                this.$http.post("/dept", this.query).then(res => {
                    // console.debug(res.data)
                    let{list, total} = res.data; // 返回的数据中取出list 和 data
                    // 给属性赋值
                    this.listData = list;
                    this.total = total;
                })
            },
            // 1.分页查询功能(翻页操作触发的函数)
            handleCurrentChange(val) { // val即翻页的页码
                // console.log(`当前页: ${val}`);
                // 将currentPage重新赋值
                this.query.currentPage = val;
                // 重新调用方法查询
                this.loadListData();
            },
            // 2.高级查询
            search() {
                // 将当前页手动设置为第一页,这样查询后就会跳转到第一页显示,避免出问题
                this.query.currentPage = 1;
                // 调用方法查询,双向绑定不用设置keywords数据
                this.loadListData();
            },
            // 3.单条删除
            handleDel(index ,row) {
                // console.log(index, row); // index是页面中的编号,并不是数据的id  row是具体数据 id在里面
                this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 点击删除需要发送请求,并且将当前条的id发送到后端
                    this.$http.delete("/dept/" + row.id).then(res => {
                        // console.debug(res);
                        let{success, message} = res.data;
                        if (success) { // 成功返回成功的信息,并且重新设置currentPage
                            this.$message({
                                type: 'success',
                                message: res.data.message // 删除成功提示:"操作成功"
                            });
                            // 设置currentPage的值,Math.ceil()函数取大于等于括号中的值的整数 3.6 => 4,this.total为删除前的总数
                            const totalPage = Math.ceil((this.total - 1) / this.query.pageSize) // 删除一条后的总页数
                            // console.debug(this.total); // 22   21
                            // console.debug(totalPage); // 5      4
                            // console.debug(this.query.currentPage); //5
                            // 当前页(删除前),如果大于删除一条后的总页数,表示该当前页被删除完毕,将当前页设置为删除后的总页数(跳到上一页),反之就是它本身就行
                            this.query.currentPage = this.query.currentPage > totalPage ? totalPage : this.query.currentPage
                            // console.debug(this.query.currentPage);// 5     4

                            /*
                               再次判断=>只有一个数据的情况下 删除后的总页数=0 ,当前页(删除前)还是1 1>0=> 所以当前页会重新设置为0
                               此时就不符合逻辑了,不可能存在第0页
                               此时就再让它=1 显示第一页即可(没有数据就没有)
                            */
                            this.query.currentPage = this.query.currentPage < 1 ? 1 : this.query.currentPage
                            // console.debug(this.query.currentPage); // 5    4
                        } else { // 失败提示异常信息
                            this.$message.error('删除异常');
                        }
                        // 最后重新发送请求查询数据
                        this.loadListData();
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });

            },
            // 4.批量删除
            batchRemove() {
                var ids = this.sels.map(item => item.id) // 变量当前数据数组,将id取出组成一个新的数组ids
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => { // 点击确认
                    // 需要发送请求,并且将勾选的数据的id即ids传回后端
                    this.$http.patch("/dept", ids).then(res => {
                        console.debug(res);
                        let{success, message} = res.data;
                        if (success) { // 成功返回成功的信息,并且重新设置currentPage
                            this.$message({
                                type: 'success',
                                message: res.data.message // 删除成功提示:"操作成功"
                            });
                            // 设置currentPage的值
                            const totalPage = Math.ceil((this.total - this.sels.length) / this.query.pageSize) // 删除勾选的条数后的总页数
                            // 当前页(删除前),如果大于删除一条后的总页数,表示该当前页被删除完毕,将当前页设置为删除后的总页数(跳到上一页),反之就是它本身就行
                            this.query.currentPage = this.query.currentPage > totalPage ? totalPage : this.query.currentPage
                            // console.debug(this.query.currentPage);// 5     4

                            this.query.currentPage = this.query.currentPage < 1 ? 1 : this.query.currentPage
                            // console.debug(this.query.currentPage); // 5    4
                        } else { // 失败提示异常信息
                            this.$message.error('删除异常');
                        }

                        // 最后重新发送请求查询数据
                        this.loadListData();
                    })
                }).catch(() => { // 点击取消
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 5.新增功能
            handleAdd() {
                // 清空表单
                this.saveForm = {
                    name: '',
                    sn: '',
                    state: 1, // 默认启用
                    manager: null,
                    parent: null
                }
                // 调用方法查询所有上级部门,在这里修改保证添加新的部门之后再次编辑也能够展示
                this.loadDepartmentData();
                // 点击新增弹出编辑界面
                this.saveFormVisible = true;

            },
            // 6.编辑(修改功能)
            handleEdit(index, row) { // index数据编号/下标(不是id), row是具体数据包含id
                // 调用方法查询所有上级部门,在这里修改保证添加新的部门之后再次编辑也能够展示
                this.loadDepartmentData();
                // console.debug(index, row);
                // 回显数据,row里面包含id,所以回显后,this.saveForm就有id了
                this.saveForm = Object.assign({}, row);
                // 点击编辑弹出编辑界面
                this.saveFormVisible = true;
            },
            // 7.保存
            saveSubmit() {
                if (this.saveForm.id == null) {
                    // 添加就重新设置当前页
                    // 重新设置currentPage,会自动跳到添加后的那一页
                    let totalPage = Math.ceil((this.total + 1) / this.query.pageSize); // 添加一条后的总页数
                    this.query.currentPage = this.query.currentPage < totalPage ? totalPage : this.query.currentPage;
                    // 手动设置total加1
                    this.total ++;
                }
                // 发送put请求添加/修改数据,因为双向绑定了属性,所以this.saveForm就是提交的数据
                this.$http.put("/dept", this.saveForm).then(res => {
                    // 开启加载效果
                    this.saveLoading = true;
                    // console.debug(res);
                    let{success, message} = res.data;
                    if (success) { // 如果成功
                        this.$message({
                            type: 'success',
                            message: message // 保存成功提示:"操作成功"
                        });
                    } else { // 失败提示异常
                        this.$message.error('操作异常');
                    }
                    // 关闭加载效果
                    this.saveLoading = false;
                    // 关闭编辑框
                    this.saveFormVisible = false;
                    // console.debug(this.total); // 20
                    // 重新加载页面
                    this.loadListData();
                    // 手动total +1, 让页面显示正常的页数
                    this.total ++;
                    // console.debug(this.total); // 21
                })
            },
            // 8.查询所有employee对象
            loadEmpData() { // get请求
                this.$http.get("/emp").then(res => {
                    // console.debug(res);
                    this.employees = res.data;
                })
            },
            // 9.查询所有Department对象
            loadDepartmentData() { // get请求查询全部
                this.$http.get("/dept").then(res => {
                    console.debug(res);
                    this.superiorDepartments = res.data; // 查询全部自己返回的一个集合
                })
            }
        },
        mounted() {
            // 1.页面一加载就发送请求查询所有数据
            this.loadListData();

            // 2.页面已加载就查询所有的employees对象
            this.loadEmpData();
        }
    }
</script>

<style scoped>

</style>