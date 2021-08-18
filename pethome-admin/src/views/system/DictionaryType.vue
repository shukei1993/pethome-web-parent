<template>
    <section>
        <!-- 1.高级查询,添加 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="query">
                <el-form-item>
                    <el-input v-model="query.keywords" placeholder="关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="serach">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--2.数据列表展示,编辑,删除
            @cell-dblclick="tableDbEdit" 双击事件绑定
        -->
        <el-table :data="listData" highlight-current-row v-loading="listLoading"
                  @selection-change="selsChange"
                  @cell-dblclick="tableDbEdit"
                  style="width: 100%;">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="name" label="数据字典名" width="350"></el-table-column>
            <el-table-column prop="sn"   label="编号" width="500"></el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 抽屉 -->
        <el-drawer
                title="数据字典明细"
                :visible.sync="drawer"
                :size = 1200
                >
            <span>
                <!-- 1.新增 -->
                <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
                    <el-form :inline="true" :model="query2">
                        <el-form-item>
                            <el-button type="primary" @click="handleAdd2">新增</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>


                <!-- 2.数据展示,删除,编辑 -->
                <el-table :data="listDataOfDirectoryDetail" highlight-current-row v-loading="listLoading2"
                          @selection-change="selsChange2"
                          @cell-dblclick="tableDbEdit"
                          style="width: 100%;">
                    <el-table-column type="selection" width="55"></el-table-column>
                    <el-table-column type="index" width="60"></el-table-column>
                    <el-table-column prop="name" label="明细名" width="350"></el-table-column>
                    <el-table-column label="操作" width="150">
                    <template scope="scope">
                        <el-button size="small" @click="handleEdit2(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="danger" size="small" @click="handleDel2(scope.$index, scope.row)">删除</el-button>
                    </template>
                    </el-table-column>

                </el-table>
                <!-- 3.分页,批量删除 -->
                <el-col :span="24" class="toolbar">
                    <el-button type="danger" @click="batchRemove2" :disabled="this.sels2.length===0">批量删除</el-button>
                    <el-pagination
                            @current-change="handleCurrentChange2"
                            @size-change="handleSizeChange2"
                            :current-page.sync ="query2.currentPage"
                            :page-sizes="pageSizes2"
                            :page-size="query2.pageSize"
                            :total="total2"
                            layout="total, sizes, prev, pager, next, jumper"
                            style="float:right;">
                    </el-pagination>
                </el-col>
            </span>
        </el-drawer>
        <!-- 明细 新增/编辑的界面 -->
        <el-dialog title="添加明细" :visible.sync="saveFormVisible2" :close-on-click-modal="false">
            <el-form :model="saveForm2" label-width="100px" :rules="saveFormRules2" ref="saveForm2">
                <el-form-item label="明细" prop="name">
                    <el-input v-model="saveForm2.name" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="saveFormVisible2 = false">取消</el-button>
                <el-button type="primary" @click.native="saveSubmit2" :loading="saveLoading2">提交</el-button>
            </div>
        </el-dialog>




        <!-- 3.分页/批量删除 -->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination
                           @current-change="handleCurrentChange"
                           @size-change="handleSizeChange"
                           :current-page.sync ="query.currentPage"
                           :page-sizes="pageSizes"
                           :page-size="query.pageSize"
                           :total="total"
                           layout="total, sizes, prev, pager, next, jumper"
                           style="float:right;">
            </el-pagination>
        </el-col>

        <!-- 4.新增/编辑的界面 -->
        <el-dialog title="新增数据字典" :visible.sync="saveFormVisible" :close-on-click-modal="false">
            <el-form :model="saveForm" label-width="100px" :rules="saveFormRules" ref="saveForm">
                <el-form-item label="字典名" prop="name">
                    <el-input v-model="saveForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="编号" prop="sn">
                    <el-input v-model="saveForm.sn" auto-complete="off"></el-input>
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
                listData: [], // 展示的数据
                listLoading: false, // 是否加载,默认否
                sels: [], // 批量删除

                total: 0,
                pageSizes: [5, 10, 15, 25],
                query: { // 分页/高级查询
                    currentPage: 1,
                    pageSize: 5,
                    keywords: ''
                },

                // 编辑新增的属性
                saveFormVisible: false, // 默认隐藏编辑/新增的界面
                // 双向绑定的编辑/新增的数据
                saveForm: {
                    id: null,
                    name: '',
                    sn: ''
                },
                // 编辑新增的规则
                saveFormRules: {
                    name: [
                        { required: true, message: '请输入数据字典名', trigger: 'blur' }
                    ],
                    sn: [
                        { required: true, message: '请输入编号', trigger: 'blur' }
                    ]
                },
                // 加载属性
                saveLoading: false,

                // 抽屉属性
                drawer: false,
                listDataOfDirectoryDetail: [], // 展示的数据
                listLoading2: false, // 是否加载,默认否
                sels2: [], // 批量删除

                total2: 0,
                pageSizes2: [1, 5, 10, 15, 25],
                query2: { // 分页/高级查询
                    currentPage: 1,
                    pageSize: 5,
                    keywords: '',
                    id: 0,
                },

                // 明细添加/编辑属性
                saveFormVisible2: false,
                saveForm2: {
                    id: null,
                    name: '',
                    types_id: ''
                },
                saveFormRules2: { // 规则2
                    name: [
                        { required: true, message: '请输出明细', trigger: 'blur' }
                    ]
                },
                saveLoading2: false
            }
        },
        methods: {
            // 1.多选框触发函数
            selsChange(val) {
                // 激活批量删除按钮
                this.sels = val;
            },
            // 2.查询数据
            loadListData() {
                // 发送请求post,参数封装在query对象中
                this.$http.post("/dic", this.query).then(res => {
                    let{total, list} = res.data;
                    this.total = total;
                    this.listData = list;
                })
            },
            // 2.翻页
            handleCurrentChange(val) {
                // 设置当前页为翻页的页数
                this.query.currentPage = val;
                // 调用方法重新查询
                this.loadListData();
            },
            // 3.修改每页显示条数方法
            handleSizeChange(val) {
                // 设置当前显示条数
                this.query.pageSize = val;
                // 设置当前页为1
                this.query.currentPage = 1;
                // 重新查询
                this.loadListData();
            },
            // 4.高级查询
            serach() {
                // 设置当前页为1
                this.query.currentPage = 1;
                // 双向绑定,数据就在query中
                this.loadListData();
            },
            // 5.删除
            handleDel(index, row) {
                // console.debug(row)
                let id = row.id;
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    // 确认发送delete请求,删除的数据在row中
                    this.$http.delete("/dic/" + id).then(res => {
                        let{success, message} = res.data;
                        if (success) { // 删除成功
                            // 提示成功
                            this.$message({
                                type: 'success',
                                message: message
                            });
                            // 重新设置当前页,如果当前页全部删完会自动跳到上一页
                            let totalPage = Math.ceil((this.total - 1) / this.query.pageSize); // 删除一条后的总页数
                            this.query.currentPage = this.query.currentPage > totalPage ? totalPage : this.query.currentPage;
                            this.query.currentPage = this.query.currentPage < 1 ? 1 : this.query.currentPage;
                        } else {
                            // 失败提示异常
                            this.$message.error({
                                type: 'warning',
                                message: '删除异常'
                            });
                        }
                        // 最后重新查询数据
                        this.loadListData();
                    })
                }).catch(() => {
                    this.$message({
                       type: 'info',
                       message: '删除已取消'
                    });
                });
            },
            // 6.批量删除
            batchRemove() {
                // 将多选框选中的数据中的id取出返回一个新的数组
                var ids = this.sels.map(item => item.id)
                // console.debug(ids)
                // console.debug(this.sels.length)
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    // 确认删除发送path请求,将ids传回
                    this.$http.patch("/dic", ids).then(res => {
                        let{success, message} = res.data;
                        // console.debug(success, message);
                        if (success) {
                            // 提示成功
                            this.$message({
                                type: 'success',
                                message: message
                            });
                            // 重新设置当前页,如果当前页全部删完会自动跳到上一页
                            let totalPage = Math.ceil((this.total - this.sels.length) / this.query.pageSize); // 删除多条后的总页数
                            this.query.currentPage = this.query.currentPage > totalPage ? totalPage : this.query.currentPage;
                            this.query.currentPage = this.query.currentPage < 1 ? 1 : this.query.currentPage;
                        } else {
                            // 失败提示异常
                            this.$message.error({
                                type: 'warning',
                                message: '删除异常'
                            });
                        }
                        // 最后重新查询数据
                        this.loadListData();
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '删除已取消'
                    });
                });
            },
            // 7.添加
            handleAdd() {
                // 清空界面
                this.saveForm = {
                    id: null,
                    name: '',
                    sn: ''
                };
                // 弹出界面
                this.saveFormVisible = true;
            },
            // 8.编辑
            handleEdit(index, row) {
                // 回显数据
                this.saveForm = Object.assign({}, row);
                // 弹出界面
                this.saveFormVisible = true;
            },
            // 9.保存
            saveSubmit() { // 双向绑定数据就在saveForm中
                this.$confirm('确认提交吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    if (this.saveForm.id == null) {
                        // 添加就重新设置当前页
                        // 重新设置currentPage,会自动跳到添加后的那一页
                        let totalPage = Math.ceil((this.total + 1) / this.query.pageSize); // 添加一条后的总页数
                        this.query.currentPage = this.query.currentPage < totalPage ? totalPage : this.query.currentPage;
                        // 手动设置total加1
                        this.total ++;
                    }

                    // 发送请求
                    this.$http.put("/dic", this.saveForm).then(res => {
                        // 开启加载效果
                        this.saveLoading = true;
                        let{success, message} = res.data;
                        if (success) {
                            // 提示成功
                            this.$message({
                                type: 'success',
                                message: message
                            });
                        } else {
                            // 提示异常
                            this.$message.error({
                                type: 'warning',
                                message: '操作异常'
                            });
                        }
                        // 关闭加载效果
                        this.saveLoading = false;
                        // 关闭界面
                        this.saveFormVisible = false;
                        // 重新加载数据
                        this.loadListData();
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '提交已取消'
                    });
                });
            },
            // 10.双击事件
            tableDbEdit(row, column, cell, event) {
                // console.log(row.id); // 就是选中数据的id
                // 设置query2中的id为当前双击的数据的id,用来查询对应的明细
                this.query2.id = row.id;
                // 设置当前页为1
                this.query2.currentPage = 1;
                this.loadListDataOfDirectoryDetail();
                // 将saveForm2中的types_id绑定为当前字典类型数据的id
                this.saveForm2.types_id = row.id;
                // 打开抽屉展示
                this.drawer = true;
            },

            // 1.查询明细根据id
            loadListDataOfDirectoryDetail() {
                // 发送请求post,参数封装在query对象中
                this.$http.post("/dicDetail", this.query2).then(res => {
                    let{total, list} = res.data;
                    this.total2 = total;
                    this.listDataOfDirectoryDetail = list;
                })
            },
            // 2.翻页
            handleCurrentChange2(val) {
                // 设置当前页为翻页的页数
                this.query2.currentPage = val;
                // 调用方法重新查询
                this.loadListDataOfDirectoryDetail();
            },
            // 3.修改每页条数
            handleSizeChange2(val) {
                // 设置当前显示条数
                this.query2.pageSize = val;
                // 设置当前页为1
                this.query2.currentPage = 1;
                // 重新查询
                this.loadListDataOfDirectoryDetail();
            },
            // 4.明细多选框selsChange2
            selsChange2(val) {
                this.sels2 = val;
            },
            // 5.删除明细
            handleDel2(index, row) {
                // console.debug(row)
                let id = row.id;
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    // 确认发送delete请求,删除的数据在row中
                    this.$http.delete("/dicDetail/" + id).then(res => {
                        let{success, message} = res.data;
                        if (success) { // 删除成功
                            // 提示成功
                            this.$message({
                                type: 'success',
                                message: message
                            });
                            // 重新设置当前页,如果当前页全部删完会自动跳到上一页
                            let totalPage2 = Math.ceil((this.total2 - 1) / this.query2.pageSize); // 删除一条后的总页数
                            this.query2.currentPage = this.query2.currentPage > totalPage2 ? totalPage2 : this.query2.currentPage;
                            this.query2.currentPage = this.query2.currentPage < 1 ? 1 : this.query2.currentPage;
                        } else {
                            // 失败提示异常
                            this.$message.error({
                                type: 'warning',
                                message: '删除异常'
                            });
                        }
                        // 最后重新查询数据
                        this.loadListDataOfDirectoryDetail();
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '删除已取消'
                    });
                });
            },
            // 6.批量删除明细
            batchRemove2() {
                // 将多选框选中的数据中的id取出返回一个新的数组
                var ids2 = this.sels2.map(item => item.id)
                // console.debug(ids)
                // console.debug(this.sels.length)
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    // 确认删除发送path请求,将ids传回
                    this.$http.patch("/dicDetail", ids2).then(res => {
                        let{success, message} = res.data;
                        // console.debug(success, message);
                        if (success) {
                            // 提示成功
                            this.$message({
                                type: 'success',
                                message: message
                            });
                            // 重新设置当前页,如果当前页全部删完会自动跳到上一页
                            // 重新设置当前页,如果当前页全部删完会自动跳到上一页
                            let totalPage2 = Math.ceil((this.total2 - this.sels2.length) / this.query2.pageSize); // 删除多条后的总页数
                            this.query2.currentPage = this.query2.currentPage > totalPage2 ? totalPage2 : this.query2.currentPage;
                            this.query2.currentPage = this.query2.currentPage < 1 ? 1 : this.query2.currentPage;
                        } else {
                            // 失败提示异常
                            this.$message.error({
                                type: 'warning',
                                message: '删除异常'
                            });
                        }
                        // 最后重新查询数据
                        this.loadListDataOfDirectoryDetail();
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '删除已取消'
                    });
                });
            },
            // 添加明细
            handleAdd2() {
                // 清空界面
                this.saveForm2.name = '';
                this.saveForm2.id = null;
                // 弹出界面
                this.saveFormVisible2 = true;
            },

            // 编辑明细handleEdit2
            handleEdit2(index, row) {
                // 回显数据
                this.saveForm2 = Object.assign({}, row);
                console.debug(this.saveForm2);
                // 弹出界面
                this.saveFormVisible2 = true;
            },
            // 保存提交
            saveSubmit2() {

                this.$confirm('确认提交吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    // console.debug(this.saveForm2)
                    if (this.saveForm2.id == null) { // 添加
                        // 重新设置currentPage,会自动跳到添加后的那一页
                        let totalPage2 = Math.ceil((this.total2 + 1) / this.query2.pageSize); // 添加一条后的总页数
                        this.query2.currentPage = this.query2.currentPage < totalPage2 ? totalPage2 : this.query2.currentPage;
                        // 手动设置total加1
                        this.total2 ++;
                    }
                    // 发送请求
                    this.$http.put("/dicDetail", this.saveForm2).then(res => {
                        // 开启加载效果
                        this.saveLoading2 = true;
                        let{success, message} = res.data;
                        if (success) {
                            // 提示成功
                            this.$message({
                                type: 'success',
                                message: message
                            });
                        } else {
                            // 提示异常
                            this.$message.error({
                                type: 'warning',
                                message: '操作异常'
                            });
                        }
                        // 关闭加载效果
                        this.saveLoading2 = false;
                        // 关闭界面
                        this.saveFormVisible2 = false;
                        // 重新加载数据
                        this.loadListDataOfDirectoryDetail();
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '提交已取消'
                    });
                });
            }
        },

        mounted() {
            // 页面一加载就查询字典类型数据
            this.loadListData();

        }
    }


</script>

<style scoped>

</style>