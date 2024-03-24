import { Context } from 'koishi';
import { Config } from '../index';
import { ticketStatus } from '../index';
import { getAvatar } from '../index';

export function create (ctx: Context, config: Config) {
    ctx.command("helpdesk.create <message>", "创建新工单")
    .action(async ({ session }, message) => {
      const date = new Date()
      const dateIso = date.toISOString()
      const avatar = getAvatar(session)
      const res = await ctx.database.create("helpdesk_list", {
        platform: session.platform,
        participants: {
          0: {
            username: session.username,
            userId: session.userId,
            avatar: avatar
          }
        },
        contents: {
          0: {
            username: session.username,
            userId: session.userId,
            date: dateIso,
            message: message
          }
        },
        ticketStatus: ticketStatus[0],
        creationDate: dateIso
      })
      session.bot.sendPrivateMessage(config.adminId, 
        `新工单: ${res.id}
        内容: ${message}
        创建时间: ${dateIso}
        工单状态: ${ticketStatus[0]}
        使用指令
        \`adminreply ${res.id} 信息\`
        来回复工单`)
      return`工单已创建，编号为 ${res.id}
        内容: ${message}
        创建时间: ${dateIso}
        工单状态: ${ticketStatus[0]}`
    })
}