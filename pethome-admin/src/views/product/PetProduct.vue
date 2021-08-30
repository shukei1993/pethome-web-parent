<template>
    <section>
        <!-- 1.查询/新增/上架 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="query">
                <el-form-item label="服务名">
                    <el-input v-model="query.name" placeholder="服务名"></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="query.state" placeholder="服务状态" clearable>
                        <el-option label="已下架" value="0"></el-option>
                        <el-option label="上架" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="serach">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
                <el-button type="success" @click="onSale" :disabled="this.sels.length===0">上架</el-button>
                <el-button type="warning" @click="offSale" :disabled="this.sels.length===0">下架</el-button>
            </el-form>
        </el-col>

        <!-- 2.数据展示,编辑,单条删除 -->
        <el-table :data="listData" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">

            <el-table-column type="expand">
                <template slot-scope="props">
                    <el-form label-position="left" inline class="demo-table-expand">
                        <el-form-item label="宠物名">
                            <span>{{ props.row.name }}</span>
                        </el-form-item>
                        <el-form-item label="成本价">
                            <span>{{ props.row.costprice }}元</span>
                        </el-form-item>
                        <el-form-item label="销售价">
                            <span>{{ props.row.saleprice }}元</span>
                        </el-form-item>
                        <el-form-item label="上架时间">
                            <span>{{ props.row.onsaletime }}</span>
                        </el-form-item>
                        <el-form-item label="下架时间">
                            <span>{{ props.row.offsaletime }}</span>
                        </el-form-item>
                        <!--<el-form-item label="领养须知">
                            <span>{{ props.row.productDetail.adoptNotice }}</span>
                        </el-form-item>
                        <el-form-item label="宠物简介">
                            <span>{{ props.productDetail.intro }}</span>
                        </el-form-item>-->
                        <el-form-item label="状态">
                            <template scope="scope">
                                <span v-if="props.row.state === 0" style="color: red">已下架</span>
                                <span v-if="props.row.state === 1" style="color: #11b95c">上架</span>
                            </template>
                        </el-form-item>
                        <el-form-item label="销量">
                            <span>{{ props.row.salecount }}</span>
                        </el-form-item>
                    </el-form>
                </template>
            </el-table-column>
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column type="index" width="50"></el-table-column>
            <el-table-column prop="name" label="宠物名" width="200"></el-table-column>
            <el-table-column prop="costprice" label="成本价" width="200"></el-table-column>
            <el-table-column prop="saleprice" label="销售价" width="200"></el-table-column>
            <el-table-column prop="state" label="状态" width="200" sortable>
                <template scope="scope">
                    <span v-if="scope.row.state === 0" style="color: red">已下架</span>
                    <span v-if="scope.row.state === 1" style="color: #11b95c">上架</span>
                </template>
            </el-table-column> &lt;!&ndash; :formatter="formatState" &ndash;&gt;
            <el-table-column label="操作" width="300">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>


        <!-- 3.分页,批量删除 -->
        <el-col :span="24" class="toolbar">
            <!--<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>-->
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

        <!-- 4.编辑/新增的界面 -->
        <el-dialog title="新增" :visible.sync="saveFormVisible" :close-on-click-modal="false">
            <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
                <el-form-item label="服务名" prop="name">
                    <el-input v-model="saveForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="售价" prop="saleprice">
                    <el-input v-model="saveForm.saleprice" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="成本价" prop="costprice">
                    <el-input v-model="saveForm.costprice" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="服务展示">
                    <!--:on-remove="handleRemove"-->
                    <el-upload
                            class="upload-demo"
                            action="http://localhost:8080/fastDfs/upload"
                            :on-remove="handleRemove"
                            :on-success="handleSuccess"
                            :file-list="fileList"
                            list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="服务简介" prop="costprice">
                    <quill-editor v-model="saveForm.productDetail.intro" :options="quillConfig" auto-complete="off"></quill-editor>
                </el-form-item>
                <el-form-item label="预约须知" prop="costprice">
                    <quill-editor v-model="saveForm.productDetail.orderNotice" :options="quillConfig" auto-complete="off"></quill-editor>
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
    import { quillEditor } from "vue-quill-editor"; //调用编辑器
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    /* 导入配置文件 */
    import quillConfig from '../../common/js/quill-config'

    export default {
        components: {
            quillEditor
        },
        data() {
            return {
                quillConfig: quillConfig,
                listData: [], // 展示的数据
                fileList: [],
                listLoading: false, // 加载效果,默认false
                sels: [], // 上下架多选框
                total: 0, // 数据总数
                query: { // 查询的数据,封装到query对象中
                    currentPage: 1,
                    pageSize: 5,
                    name: '', // 服务名
                    state: null,
                },
                pageSizes: [5, 10, 15, 30],

                // 编辑新增的属性
                saveFormVisible: false, // 默认隐藏编辑/新增的界面
                // 双向绑定的编辑/新增的数据
                saveForm: {
                    id: null,
                    name: '',
                    saleprice: '',
                    costprice: '',
                    resources: '', // 多张图片
                    productDetail: {
                        intro: '',
                        orderNotice: ""
                    }
                },
                // 编辑新增的规则
                saveFormRules: {
                    name: [
                        { required: true, message: '请输入服务名', trigger: 'blur' }
                    ],
                },
                // 加载属性
                saveLoading: false,
            }
        },
        methods: {
            // 状态转换
            /*formatState() {

            },*/
            // 多选框函数
            selsChange(val) {
                // console.debug(val)
                this.sels = val;
                console.debug(this.sels);
            },
            //1.查询数据函数
            loadListData() {
                // post请求
                this.$http.post("/product/queryPage", this.query).then(res => {
                    // 取出返回的total和list数据
                    let{total, list} = res.data;
                    // console.debug(res.data);
                    // 给属性赋值
                    this.total = total;
                    this.listData = list;
                    // console.debug(list);
                })
            },
            // 2.高级查询
            serach() {
                // 查询的数据都在query中,调用查询数据函数即可
                // console.debug(this.query);
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
                    this.$http.delete("/product/" + id).then(res => {
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
            // 6.上架
            onSale() {
                console.debug(this.sels);
                // 遍历sels将其中的id取出并且返回一个新的id数组ids
                var ids = this.sels.map(item => item.id);
                this.$confirm('确认上架吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    // 发送请求patch请求
                    this.$http.patch("/product/onSale", ids).then(res => {
                        let{success, message} = res.data
                        if (success) { // 成功提示消息
                            this.$message({
                                type: 'success',
                                message: message
                            });
                        } else {
                            // 失败提示
                            this.$message.error({
                                type: 'warning',
                                message: '操作异常!!'
                            });
                        }
                        // 重新加载页面
                        this.loadListData();
                    })
                }).catch(() => {
                    // 取消提示
                    this.$message({
                        type: 'info',
                        message: '已取消上架'
                    });
                });
            },
            // 下架
            offSale() {
                // 遍历sels将其中的id取出并且返回一个新的id数组ids
                var ids = this.sels.map(item => item.id);
                this.$confirm('确认下架吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    // 发送请求patch请求
                    this.$http.patch("/product/offSale", ids).then(res => {
                        let{success, message} = res.data
                        if (success) { // 成功提示消息
                            this.$message({
                                type: 'success',
                                message: message
                            });
                        } else {
                            // 失败提示
                            this.$message.error({
                                type: 'warning',
                                message: '操作异常!!'
                            });
                        }
                        // 重新加载页面
                        this.loadListData();
                    })
                }).catch(() => {
                    // 取消提示
                    this.$message({
                        type: 'info',
                        message: '已取消下架'
                    });
                });
            },
            // 7.编辑
            handleEdit(index, row) { // index数据编号/下标(不是id), row是具体数据包含id
                // 清空表单
                this.saveForm = {
                    name: '',
                    saleprice: '',
                    costprice: '',
                    resources: "", // 多张图片
                    productDetail: {
                        intro: '',
                        orderNotice: ""
                    }
                }
                // 清空图片
                this.fileList = [];
                // 回显数据,row里面包含id,所以回显后,this.saveForm就有id了
                this.saveForm = Object.assign({}, row);
                // 回显图片
                let picArr = row.resources.split(",");
                // console.debug(row.resources)
                // console.debug(picArr);
                if (row.resources !== "") {
                    for (var i = 0; i < picArr.length; i++) {
                        this.fileList.push({
                            name: '图片' + (i + 1),
                            url: "http://47.95.117.210:8888/" + picArr[i]
                        });
                    }
                }
                // console.debug(this.fileList);
                // 点击编辑弹出编辑界面
                this.saveFormVisible = true;
            },
            // 8.新增
            handleAdd() {
                // 清空表单
                this.saveForm = {
                    name: '',
                    saleprice: '',
                    costprice: '',
                    resources: '',
                    productDetail :  {
                        orderNotice: '',
                        intro: ''
                    }
                }
                // 清空图片
                this.fileList = [];
                // 点击新增弹出编辑界面
                this.saveFormVisible = true;

            },
            // 9.提交保存
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
                    console.debug(this.fileList);
                    // 发送请求
                    this.$http.put("/product", this.saveForm).then(res => {
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
            // 10.多文件文件上传成功回调
            handleSuccess(response, file, fileList){
                var str = '';
                console.debug("fileList"+fileList);
                for (let i = 0; i < fileList.length; i++) {
                    if (i < fileList.length - 1) {
                        if (fileList[i].response != null) {
                            str += fileList[i].response.resultObj + ",";
                        }
                        console.debug(fileList[i]);
                    } else {
                        str += fileList[i].response.resultObj;
                        console.debug(fileList[i]);
                    }
                }
                // 将返回的path赋值给resources
                this.saveForm.resources = str;
                console.debug(str);
                console.debug(this.saveForm.resources);
            },
            // 11.文件删除
            handleRemove(file, fileList) {
                // console.debug(fileList);
                // console.debug(file);
                // 文件删除准备参数
                let path = file.url;
                // 文件删除发送请求
                this.$http.delete("/fastDfs/?path=" + path).then(res => {
                    let{success, message} = res.data;
                    if (success) {
                        this.$message({
                            type: 'success',
                            message: '已删除'
                        });
                        this.saveForm.resources = "";
                    } else {
                        this.$message.error({
                            type: 'warning',
                            message: '操作异常'
                        });
                    }
                })
            },
        },
        mounted() {
            // 调用查询函数
            this.loadListData();
        }
    }



</script>

<style scoped>
    .demo-table-expand {
        font-size: 0;
    }
    .demo-table-expand label {
        width: 90px;
        color: #99a9bf;
    }
    .demo-table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }
</style>