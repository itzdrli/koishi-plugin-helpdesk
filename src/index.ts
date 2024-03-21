import { $, Field } from 'koishi'
import { Context, Schema } from 'koishi'

export const name = 'helpdesk'

export interface Config {
  adminId: string
}

export const Config: Schema<Config> = Schema.object({
  adminId: Schema.string().required(),
})

export const inject = ['database']

declare module 'koishi' {
  interface Tables {
    helpdesk_list: HelpdeskList
  }
}

export interface HelpdeskList {
  id: number
  platform: string
  participantId: string
  initialContent: string
  furtherContent: string
  tickedStatus: string
  creationDate: Date
}

export function apply(ctx: Context, config: Config) {
  ctx.model.extend('helpdesk_list', {
    id: 'unsigned',
    platform: 'string',
    participantId: 'string',
    initialContent: 'string',
    furtherContent: 'string',
    tickedStatus: 'string',
    creationDate: 'timestamp',
  }, {
    autoInc: true,
  })

  let ticketStatus = ['等待管理员处理', '等待用户回复', '等待管理员回复', '工单已关闭']

  ctx.command('helpdesk', '工单系统', { 
    authority: 0 
  })

  ctx.command("helpdesk/create <message>", "创建新工单")
    .action(async ({ session }, message) => {
      const date = new Date()
      const res = await ctx.database.create("helpdesk_list", {
        platform: session.platform,
        participantId: `${session.userId}, `,
        initialContent: message,
        tickedStatus: ticketStatus[0],
        creationDate: date,
      })
      session.bot.sendPrivateMessage(config.adminId, 
        `新工单: ${res.id}\n内容: ${message}\n创建时间: ${date}\n工单状态: ${ticketStatus[0]}\n使用指令 \nrespond ${res.id} 信息\n来回复工单`)
      return`工单已创建，编号为 ${res.id}\n内容: ${message}\n创建时间: ${date}\n工单状态: ${ticketStatus[0]}`
    })

  ctx.command("helpdesk/list", "查看所有与你有关的工单")
    .action(async ({ session }) => {
      const res = await ctx.database.get("helpdesk_list", {
        platform: session.platform,
        participantId: `${session.userId}, `
      })
      if (res.length === 0) {
        return "未查询到与你有关的工单"
      }
      return res.map(item => {
        const furtherContent = item.furtherContent.replace(/;;;;/g, '\n')
        return `> 工单编号: ${item.id}\n> 起始内容: ${item.initialContent} \n> 回复内容: \n ${furtherContent}\n> 创建时间: ${item.creationDate}\n> 工单状态: ${item.tickedStatus} \n`
      }).join("\n\n")
    })

    ctx.command("helpdesk/adminRespond <id> <message>", "回复工单", { authority: 4 })
      .action(async ({ session }, id, message) => {
        const res = await ctx.database.get("helpdesk_list", { 
          id: parseInt(id)
        })
        if (res.length === 0) return "工单不存在"
        if (res[0].tickedStatus === ticketStatus[3]) return "工单已关闭，管理员无法回复"
        const date = new Date()
        await ctx.database.set("helpdesk_list", { id: parseInt(id) }, { 
          furtherContent: $.concat(`${session.username} [${date}]: ` + message + ";;;;"),
          tickedStatus: ticketStatus[1] 
        })
        const reciver = res[0].participantId.split(", ")[0]
        session.bot.sendPrivateMessage(reciver, `工单编号: ${id}\n回复内容: ${message}\n回复时间: ${date}\n工单状态: ${ticketStatus[1]}\n\n使用指令 \nrespond ${id} 信息\n来回复工单`)

        return `工单已回复，编号为 ${id}\n回复内容: ${message}\n回复时间: ${date}\n工单状态: ${ticketStatus[1]}`
      })

      ctx.command("helpdesk/respond <id> <message>", "回复工单", { authority: 0 })
      .action(async ({ session }, id, message) => {
        const res = await ctx.database.get("helpdesk_list", { 
          id: parseInt(id)
        })
        const initiator = res[0].participantId.split(", ")[0]
        if (session.userId !== config.adminId || session.userId !== initiator) return "你没有权限回复工单"
        const date = new Date()
        await ctx.database.set("helpdesk_list", { id: parseInt(id) }, { 
          furtherContent: $.concat(`${session.username} [${date}]: ` + message + ";;;;"),
          tickedStatus: ticketStatus[2] 
        })
        session.bot.sendPrivateMessage(config.adminId, `工单编号: ${id}\n回复内容: ${message}\n回复时间: ${date}\n工单状态: ${ticketStatus[2]}`)

        return `工单已回复，编号为 ${id}\n回复内容: ${message}\n回复时间: ${date}\n工单状态: ${ticketStatus[2]}`
      })

      ctx.command("helpdesk/close <id>", "关闭工单", { authority: 0 })
        .action(async ({ session }, id) => {
          const res = await ctx.database.get("helpdesk_list", { 
            id: parseInt(id)
          })
          const initiator = res[0].participantId.split(", ")[0]
          if (session.userId !== initiator || session.userId !== config.adminId) {
            return "你没有权限关闭此工单"
          }
          if (res[0].tickedStatus === ticketStatus[3]) return "工单已经关闭"
          await ctx.database.set("helpdesk_list", { id: parseInt(id) }, { 
            tickedStatus: ticketStatus[3] 
          })

          return `工单已关闭，编号为 ${id}`
        })

      ctx.command("helpdesk/addParticipant <id> <userId>", "添加参与者", { authority: 0 })
        .action(async ({ session }, id,userId) => {
          const res = await ctx.database.get("helpdesk_list", { 
            id: parseInt(id)
          })
          const initiator = res[0].participantId.split(", ")[0]
          if (session.userId !== initiator || session.userId !== config.adminId) {
            return "你没有权限为此工单添加成员"
          }

          await ctx.database.set("helpdesk_list", { id: parseInt(id) }, {
            participantId: $.concat(`${userId}, `)
          })
        })
}
