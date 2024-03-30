# HelpDesk

[![Github](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/itzdrli/koishi-plugin-helpdesk) [![npm](https://img.shields.io/npm/v/koishi-plugin-helpdesk?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-helpdesk) [![Build Status](https://app.travis-ci.com/itzdrli/koishi-plugin-helpdesk.svg?token=TLryNrQDdx1XD7LvpF49&branch=master)](https://app.travis-ci.com/itzdrli/koishi-plugin-helpdesk)

请我喝杯咖啡 -->[![ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/itzdrli) [爱发电](https://afdian.net/a/itzdrli)

HelpDesk工单系统

## 指令

 根指令: `helpdesk`, 别名: `hd`
 子指令: `create`, `close`, `adminreply`, `reply`, `assign`

 - `create <信息>`: 创建工单
 - `close <工单号>`: 关闭工单
 - `adminreply <工单号> <信息>`: 管理员回复工单
 - `reply <工单号> <信息>`: 用户回复工单
 - `assign <工单号> <用户>`: 添加参与者

## 工单预览器

  `0.2.0-alpha.0` 版本开始，在工单被关闭时，将会提示是否导出工单，如果选择导出，可以将导出的文件上传到 [**工单预览器**](https://ticket.itzdrli.com/) 中查看工单内容

Feature Request: [![Github](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/itzdrli/koishi-plugin-helpdesk/issues)

Copyright © 2024 [Itz_Dr_Li](https://github.com/itzdrli)