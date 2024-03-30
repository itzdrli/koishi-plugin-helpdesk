import { Context, Schema, h } from 'koishi'
import { assign } from './commands/assign'
import { close } from './commands/close'
import { reply } from './commands/reply'
import { adminReply } from './commands/adminReply'
import { create } from './commands/create'

export const name = 'helpdesk'

export interface Config {
  adminId: any
}

export const Config: Schema<Config> = Schema.object({
  adminId: Schema.array(Schema.string()).role('table').description("管理员的用户id (可以使用 inspect 指令获取)")
})

export function getAvatar(session) {
  const avatar = session.author.avatar
  return avatar
}

export const usage = `
<h1><a href="https://ticket.itzdrli.com/">工单预览器</a></h1> <p>👆点我</p>
<p>请我喝杯咖啡 👉<a href="https://ko-fi.com/itzdrli"><img src="https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white" alt="ko-fi"></a></p> <a href="https://afdian.net/a/itzdrli">爱发电</a>
`

export const inject = ['database']

export interface Participant {
  userId: string
  username: string
  avatar: string
}

export interface Participants {
  [key: number]: Participant
}

export interface content {
  username: string
  userId: string
  date: string
  message: string
}

export interface contents {
  [key: number]: content
}

declare module 'koishi' {
  interface Tables {
    helpdesk_list: HelpdeskList
  }
}

export interface HelpdeskList {
  id: number
  platform: string
  participants: Participants
  contents: contents
  ticketStatus: string
  creationDate: string
}

export const ticketStatus = ['等待管理员处理', '等待用户回复', '等待管理员回复', '工单已关闭']

export function apply(ctx: Context, config: Config) {
  ctx.model.extend('helpdesk_list', {
    id: 'unsigned',
    platform: 'string',
    participants: {
      type: 'json',
      initial: {}
    },
    contents: {
      type: 'json',
      initial: {}
    },
    ticketStatus: 'string',
    creationDate: 'string',
  }, {
    autoInc: true,
  })
  ctx.command("helpdesk", "工单系统", { authority: 0 }).alias('hd')
  create(ctx, config)
  assign(ctx, config)
  close(ctx, config)
  reply(ctx, config)
  adminReply(ctx, config)
}