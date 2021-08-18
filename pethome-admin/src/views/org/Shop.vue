<template>
    <section>
        <!-- 1.查询/新增 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="query">
                <el-form-item label="关键字">
                    <el-input v-model="query.keywords" placeholder="关键字"></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="query.state" placeholder="店铺状态" clearable>
                        <el-option label="待审核" value="0"></el-option>
                        <el-option label="审核通过" value="1"></el-option>
                        <el-option label="禁用" value="-1"></el-option>
                    </el-select>
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
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column type="index" width="50"></el-table-column>
            <el-table-column prop="name" label="店名" width="80"></el-table-column>
            <el-table-column prop="tel" label="电话" width="120"></el-table-column>
            <el-table-column prop="registerTime" label="注册日期" width="120" sortable></el-table-column>
            <el-table-column prop="state" label="状态" width="100" sortable>
                <template scope="scope">
                    <span v-if="scope.row.state === 0" style="color: lightslategrey">待审核</span>
                    <span v-if="scope.row.state === 1" style="color: #11b95c">审核通过</span>
                    <span v-if="scope.row.state === -1" style="color: red">驳回</span>
                </template>
            </el-table-column> <!-- :formatter="formatState" -->
            <el-table-column prop="address" label="地址" min-width="180" sortable></el-table-column>
            <el-table-column prop="logo" label="标志" width="120"></el-table-column>

            <!--<el-table-column prop="admin_id" label="管理员" width="120"></el-table-column>-->

            <el-table-column label="操作" width="250">
                <template scope="scope">
                    <el-button type="warning" size="small" :disabled="scope.row.state === 1" @click="check(scope.$index, scope.row)">审核</el-button>
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 审核界面 -->
        <el-dialog title="审核" :visible.sync="checkFormVisible" :close-on-click-modal="false">
            <el-form :model="checkForm" label-width="100px">
                <el-form-item label="店名">
                    <el-input v-model="checkForm.name" :disabled="true" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="电话">
                    <el-input v-model="checkForm.tel" :disabled="true" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input v-model="checkForm.address" :disabled="true" auto-complete="off"></el-input>
                </el-form-item>
                <!--<el-form-item label="状态" prop="state">
                    <template scope="scope">
                        <span v-if="checkForm.state === 0" style="color: lightslategrey">待审核</span>
                        <span v-if="checkForm.state === 1" style="color: #11b95c">审核通过</span>
                        <span v-if="checkForm.state === -1" style="color: red">驳回</span>
                    </template>
                </el-form-item>-->
                <el-form-item label="logo">
                    <el-input v-model="checkForm.logo" :disabled="true" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="驳回原因">
                    <el-input type="textarea" v-model="checkForm.reason"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="checkFormVisible = false">取消</el-button>
                <el-button type="success" @click.native="checkSubmit" :loading="checkFormLoading">通过</el-button>
                <el-button type="danger" @click.native="reject" :loading="checkFormLoading">驳回</el-button>
            </div>
        </el-dialog>

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
                    keywords: '',
                    state: null,
                },
                pageSizes: [5, 10, 15, 30],




                // 审核属性
                checkForm: { // 绑定数据
                    reason: ''// 驳回原因
                },
                checkFormVisible: false, // 审核界面展示
                checkFormLoading: false, // 审核加载

            }
        },
        methods: {
            // 状态转换
            /*formatState() {

            },*/
            // 多选框函数
            selsChange(val) {
                console.debug(val)
                this.sels = val;
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
                // console.debug(this.query.state);
                this.query.currentPage = 1;
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
                let id = row.id; // 将当前删除数据的id取出
                // console.debug(id);
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => { // 确认删除发送请求
                    this.$http.delete("/shop/" + id).then(res => {
                        let{success, message} = res.data;
                        if (success) {
                            // 操作成功,提示
                            this.$message({
                                type: 'success',
                                message: message
                            });
                            // 重新设置currentPage,如果当前页都删除完毕会跳到上一页
                            let totalPage = Math.ceil((this.total - 1) / this.query.pageSize); // 删除一条后的总页数
                            this.query.currentPage = this.query.currentPage > totalPage ? totalPage : this.query.currentPage;
                            this.query.currentPage = this.query.currentPage < 1 ? 1 : this.query.currentPage;
                        } else {
                            // 失败提示信息
                            this.$message.error({
                                type: 'warning',
                                message: '删除异常'
                            });
                        }
                        // 最后调用查询数据方法重新加载页面
                        this.loadListData();
                    })
                }).catch(() => {
                    // 取消删除
                    this.$message({
                        type: 'info',
                        message: "删除已取消"
                    });
                });
            },
            // 6.批量删除
            batchRemove() {
                // 遍历sels将其中的id取出并且返回一个新的id数组ids
                var ids = this.sels.map(item => item.id);

                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    // 发送请求patch请求
                    this.$http.patch("/shop", ids).then(res => {
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
            // 7.编辑
            handleEdit(index, row) {

            },
            // 8.新增
            handleAdd() {

            },
            // 9.提交保存
            // 10.审核
            check(index, row) {
                // console.debug(row);
                // 回显数据
                this.checkForm = Object.assign({}, row);
                // 打开界面
                this.checkFormVisible = true;
            },
            // 11.驳回提交
            reject() {
                if (!this.checkForm.reason) {
                    this.$message.error({
                       type: 'danger',
                       message: "请填写驳回原因"
                    });
                    return; // 结束方法
                }
                /*
                   组装请求参数
                       后台需要审核记录=>审核人(employee对象)  审核时间checkTime
                       前端提供的:店铺id,note(驳回原因)
                 */
                let log = {
                    shop_id: this.checkForm.id,
                    note: this.checkForm.reason,
                    // admin_id: this.checkForm.admin_id
                }
                // 发送驳回请求
                this.$http.post("/shop/reject", log).then(res => {
                    let{success, message} = res.data;
                    if (success) {
                        this.$message({
                            type: 'success',
                            message: message
                        });
                    } else {
                        this.$message.error({
                            type: 'warning',
                            message: '操作异常'
                        });
                    }
                    // 关闭审核界面
                    this.checkFormVisible = false;
                    // 重新查询
                    this.loadListData();
                })
            },
            // 12.通过提交
            checkSubmit() {
                // 通过不需要填写驳回理由,避免误填手动清空
                // this.checkForm.reason = '';
                // 组装参数
                let log = {
                    shop_id: this.checkForm.id,
                    // admin_id: this.checkForm.admin_id
                }
                // console.debug(log)
                // 发送请求
                this.$http.post("/shop/pass", log).then(res => {
                    let{success, message} = res.data;
                    if (success) {
                        this.$message({ // 成功提示
                            type: 'success',
                            message: message
                        });
                    } else { // 失败提示
                        this.$message.error({ // 成功提示
                            type: 'warning',
                            message: '操作异常'
                        });
                    }
                    // 关闭审核界面
                    this.checkFormVisible = false;
                    // 重新查询
                    this.loadListData();
                })
            }
        },
        mounted() {
            // 页面已加载就调用查询函数
            this.loadListData();
        }
    }



</script>

<style scoped>

</style>