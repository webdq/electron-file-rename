<template>
  <div class="page-index">
    <div class="select-row">
      <a-upload-dragger
        :multiple="true"
        :fileList="fileList"
        :remove="handleRemove"
        :beforeUpload="beforeUpload"
        :showUploadList="false"
        @change="handleChange"
      >
        <p class="ant-upload-drag-icon">
          <a-icon type="inbox" />
        </p>
        <p class="ant-upload-text">点击或拖拽文件到这里</p>
      </a-upload-dragger>
    </div>

    <div class="files-row">
      <h3>已选择的文件： <a-button @click="removeAll">移除所有</a-button></h3>
      <div class="list-wrap">
        <div class="list-head">
          <a-row class="list-row" type="flex" justify="space-between">
            <a-col class="list-col" :span="5">文件名</a-col>
            <a-col class="list-col" :span="10">文件路径</a-col>
            <a-col class="list-col" :span="3">类型</a-col>
            <a-col class="list-col" :span="3">操作</a-col>
            <a-col class="list-col" :span="3">结果</a-col>
          </a-row>
        </div>
        <div v-if="fileList.length === 0" class="list-body">
          <a-row class="list-row" type="flex" justify="space-between">
            <a-col class="list-col" :span="24">暂无文件</a-col>
          </a-row>
        </div>
        <div v-else class="list-body">
          <draggable
            v-model="fileList"
            v-bind="dragOptions"
            @start="drag = true"
            @end="drag = false"
            handle=".list-row"
          >
            <transition-group type="transition" name="flip-list">
              <a-row
                class="list-row"
                v-for="(item, index) in fileList"
                :key="item.uid"
                type="flex"
                justify="space-between"
              >
                <a-col class="list-col" :span="5">{{ item.name }}</a-col>
                <a-col class="list-col" :span="10">{{ item.path }}</a-col>
                <a-col class="list-col" :span="3">{{ item.type }}</a-col>
                <a-col class="list-col" :span="3">
                  <a @click="removeRow(item)" href="javascript:;" draggable="false">移除 <a-icon type="delete"/></a>
                  <div class="ant-divider ant-divider-vertical"></div>
                  <a href="javascript:;" draggable="false">拖动 <a-icon type="drag"/></a>
                </a-col>
                <a-col class="list-col" :span="3">
                  <a-icon
                    v-if="item.changed === 1"
                    :style="{ fontSize: '20px' }"
                    type="check-circle"
                    theme="twoTone"
                    twoToneColor="#52c41a"
                  />
                  <a-icon
                    v-if="item.changed === 0"
                    :style="{ fontSize: '20px' }"
                    type="close-circle"
                    theme="twoTone"
                    twoToneColor="#f5222d"
                  />
                </a-col>
              </a-row>
            </transition-group>
          </draggable>
        </div>
      </div>
    </div>

    <div class="options-row">
      <div style="margin-bottom: 10px">
        <a-alert message="说明：使用{n}代表数字序号位置" type="info"></a-alert>
      </div>
      <div style="margin-bottom: 10px">
        <a-alert message="提示：没有数字序号或者文件名为空会导致文件被覆盖" type="warning"></a-alert>
      </div>
      <div class="op-row">
        <a-row type="flex" justify="space-between" :gutter="10">
          <a-col :span="8">前缀</a-col>
          <a-col :span="8">文件名</a-col>
          <a-col :span="8">后缀</a-col>
        </a-row>
        <a-row type="flex" justify="space-between" :gutter="10">
          <a-col :span="8">
            <a-input v-model="filenamePrefix" placeholder="前缀" />
          </a-col>
          <a-col :span="8">
            <a-input v-model="filenameInput" placeholder="文件名" />
          </a-col>
          <a-col :span="8">
            <a-input v-model="filenameSuffix" placeholder="后缀" />
          </a-col>
        </a-row>
      </div>

      <div class="op-row">
        <a-row type="flex" :gutter="10">
          <a-col :span="5">
            <div style="display: flex; align-items: baseline;">
              <span>序号起始值：</span>
              <a-input-number :precision="0" :min="1" v-model="fillStart" />
            </div>
          </a-col>
          <a-col :span="5">
            <div style="display: flex; align-items: baseline;">
              <span>序号增量：</span>
              <a-input-number :precision="0" :min="0" :max="10" v-model="fillStep" />
            </div>
          </a-col>
          <a-col :span="5">
            <div style="display: flex; align-items: baseline;">
              <span>序号位数：</span>
              <a-input-number :precision="0" :min="0" :max="10" v-model="fillPos" />
            </div>
          </a-col>
          <a-col :span="5">
            <a-checkbox @change="fillChange" :checked="fillChecked">不足位补齐</a-checkbox>
          </a-col>
        </a-row>
      </div>

      <a-row type="flex" justify="space-between" :gutter="10">
        <a-col :span="24">
          <a-button @click="valid" type="primary" :loading="isRename" size="large" block>
            {{ renameBtnText }}
          </a-button>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
const path = require('path');
const fs = require('fs');
const bluebird = require('bluebird');
bluebird.promisifyAll(fs);
import draggable from 'vuedraggable';
import { Row, Col, Input, Checkbox, Button, Divider, Icon, InputNumber, Upload, Alert } from 'ant-design-vue';
const AUploadDragger = Upload.Dragger;
export default {
  data() {
    return {
      drag: false,
      filenamePrefix: '',
      filenameInput: '',
      filenameSuffix: '',
      fillChecked: false,
      fillStart: 1,
      fillStep: 1,
      fillPos: 2,
      isRename: false,
      fileList: []
    };
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: 'files',
        disabled: false,
        ghostClass: 'ghost'
      };
    },
    renameBtnText() {
      return this.isRename ? '正在重命名中...' : '开始重命名';
    }
  },
  components: {
    draggable,
    ARow: Row,
    ACol: Col,
    AInput: Input,
    ACheckbox: Checkbox,
    AButton: Button,
    ADivider: Divider,
    AIcon: Icon,
    AInputNumber: InputNumber,
    AUploadDragger: AUploadDragger,
    AAlert: Alert
  },
  methods: {
    fillChange(e) {
      this.fillChecked = e.target.checked;
    },
    handleChange(info) {
      // console.log(info);
    },
    handleRemove(file) {
      const index = this.fileList.indexOf(file);
      const newFileList = this.fileList.slice();
      newFileList.splice(index, 1);
      this.fileList = newFileList;
    },
    beforeUpload(file) {
      let has = this.fileList.find(item => item.path === file.path);
      let obj = {
        name: file.name,
        path: file.path,
        size: file.size,
        type: file.type,
        uid: file.uid,
        changed: -1
      };
      if (!has) this.fileList = [...this.fileList, obj];
      return false;
    },
    removeRow(file) {
      let list = this.fileList.filter(item => item.uid !== file.uid);
      this.fileList = list;
    },
    removeAll() {
      this.fileList = [];
    },
    createNewFilename(index) {
      let num = String(this.fillStart + this.fillStep * index);
      let n = this.fillChecked ? num.padStart(this.fillPos, '0') : num;
      let name = this.filenamePrefix + this.filenameInput + this.filenameSuffix;
      let newName = name.replace(/\{n\}/g, n);
      return newName;
    },
    valid() {
      if (this.fileList.length === 0) {
        this.$message.warn('请添加文件');
        return false;
      }
      let name = this.filenamePrefix + this.filenameInput + this.filenameSuffix;
      let reg = /\{n\}/g;
      if (!reg.test(name)) {
        this.$modal.confirm({
          title: '提示：',
          content: '没有数字序号或者文件名为空，会导致文件被覆盖，确定要重命名吗？',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            this.startRename();
          },
          onCancel: () => {}
        });
        return false;
      }
      this.startRename();
    },
    startRename() {
      this.isRename = true;
      this.fileList.forEach(async (file, index) => {
        try {
          let { dir, ext } = path.parse(file.path);
          let newFilename = this.createNewFilename(index);
          let oldPath = file.path;
          let newPath = path.format({
            dir,
            base: newFilename + ext
          });
          await fs.renameAsync(oldPath, newPath);
          file.changed = 1;
        } catch (err) {
          file.changed = 0;
          console.log(err);
        }
      });
      this.isRename = false;
    }
  }
};
</script>
<style lang="scss">
.page-index {
  padding: 40px;
  .select-row {
    margin-bottom: 30px;
    height: 300px;
  }

  .options-row {
    margin-bottom: 30px;
    .op-row {
      padding: 10px 0;
      border-bottom: 1px solid #e8e8e8;
      margin-bottom: 10px;
    }
  }

  .files-row {
    margin-bottom: 30px;
    background: #fff;
    border-radius: 10px;
    .list-head {
      margin-bottom: -1px;
    }
    .list-row {
      border: 1px solid #e8e8e8;
      margin-bottom: -1px;
    }
    .list-row:last-child {
      margin-bottom: 0;
    }
    .list-col {
      /*border-right: 1px solid #e8e8e8;*/
      border-right: 1px solid #e8e8e8;
      padding: 10px;
      position: relative;
      word-break: break-all;
    }
    .list-col:last-child {
      border-right: 0;
    }
  }
}

.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
