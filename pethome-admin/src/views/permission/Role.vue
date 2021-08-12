<template>
    <section>
        <!-- 1.关键字查询,新增 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="query">
                <el-form-item>
                    <el-input v-model="query.keywords" placeholder="角色名"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="search">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!-- 2.数据展示 -->
        <el-table :data="listRoleData" highlight-current-row v-loading="listLoading"
                  @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="name" label="角色名" width="120"></el-table-column>
            <el-table-column prop="sn" label="描述" width="120"></el-table-column>

            <el-table-column label="操作" width="225">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                    <el-button type="warning" size="small" @click="">授权</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 3.分页条,批量删除 -->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="sizes, total, prev, pager, next, jumper"
                           background
                           @size-change="handleSizeChange"
                           @current-change="handleCurrentChange"
                           :current-page.sync="query.currentPage"
                           :page-sizes="pageSizes"
                           :page-size="query.pageSize"
                           :total="total"
                           style="float:right;">
            </el-pagination>
        </el-col>
        
        <!-- 4.添加编辑的弹出框 -->
        <el-dialog title="新增" :visible.sync="saveFormVisible" :close-on-click-modal="false">
            <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="saveForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="性别">
                    <el-radio-group v-model="saveForm.sex">
                        <el-radio class="radio" :label="1">男</el-radio>
                        <el-radio class="radio" :label="0">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="年龄">
                    <el-input-number v-model="saveForm.age" :min="0" :max="200"></el-input-number>
                </el-form-item>
                <el-form-item label="生日">
                    <el-date-picker type="date" placeholder="选择日期" v-model="saveForm.birth"></el-date-picker>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input type="textarea" v-model="saveForm.addr"></el-input>
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
            return{
                listRoleData:[], // 绑定的属性,展示具体的数据
                listLoading: false, // 加载属性默认false
                sels: [], // 多选框
                total: 0, // 数据总数,查出来的
                query: {
                    currentPage: 1, // 当前页码 默认1
                    pageSize: 5, // 当前页显示条数,默认5
                    keywords: '', // 关键字高级查询
                },
                pageSizes: [1, 5, 15, 20, 30], // 每页显示条数下拉框

                // 新增/编辑界面的属性
                saveFormVisible: false, // 是否显示,默认不显示
                saveFormRules: {}, // 规则，什么必填
                saveLoading: false, // 加载效果,默认不加载
                saveForm: { // 双向绑定数据

                }
            }
        },
        methods: {
            // 多选框方法
            selsChange() {

            },
            // 1.分页查询,查询信息(分页/高级)都在query中,post请求
            loadRoleList() {
                this.$http.post("/role", this.query).then(res => {
                    // console.debug(res.data);
                    let{total, list} = res.data;
                    // 给属性赋值
                    this.listRoleData = list;
                    this.total = total;
                })
            },
            // 2.翻页方法
            handleCurrentChange(val) { // val就是具体的页码
                // 给currentPage重新赋值,重新查询即可
                this.query.currentPage = val;
                this.loadRoleList();
            },
            // 3.更改每页显示条数
            handleSizeChange(val) { // val就是修改的每页显示条数
                // 重新赋值pageSize
                this.query.pageSize = val;
                // 手动设置页数为第一页
                this.query.currentPage = 1;
                // 重新查询加载页面
                this.loadRoleList();
            },
            // 4.高级查询
            search() { // 数据都在query中,直接发送请求
                this.loadRoleList();
            },
            // 5.删除
            handleDel(index, row) {
                // console.debug(row.id) // row就是具体的数据
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => { // 确认就发送delete请求
                    this.$http.delete("/role/" + row.id).then(res => {
                        let{success, message} = res.data;
                        if (success) { // 成功
                            // 提示信息
                            this.$message({
                                type: 'success',
                                message: message
                            });
                            // 重新设置currentPage
                            let totalPage = Math.ceil((this.total - 1) / this.query.pageSize); // 删除一条后的总页数
                            // 当前页大于删除后的总页数即当页已经删完了,重新赋值为总页数(向上翻页)
                            this.query.currentPage = this.query.currentPage > totalPage ? totalPage : this.query.currentPage
                            // 小于1,即数据全部没有的情况默认让当前页为1
                            this.query.currentPage = this.query.currentPage < 1 ? 1 : this.query.currentPage;
                        } else {
                            // 提示信息
                            this.$message.error({
                                type: 'warning',
                                message: '删除异常'
                            });
                        }
                        // 重新加载
                        this.loadRoleList();
                    })
                }).catch(() => {
                    this.$message({
                       type: 'info',
                       message: '已取消删除'
                    });
                });
            },
            // 6.批量删除(是否写？待定)
            batchRemove() {

            },
            // 7.新增
            handleAdd() {
                this.saveFormVisible = true; // 打开输入界面
            },
            // 8.编辑
            handleEdit() {
                
            },
            // 9.保存
            saveSubmit() {

            }
        },
        mounted() {
            // 1.页面已加载就查询所有角色
            this.loadRoleList();
        }
    }
</script>

<style scoped>

</style>