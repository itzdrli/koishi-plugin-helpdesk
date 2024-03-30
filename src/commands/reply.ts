import { Context, $ } from 'koishi';
import { Config } from '../index';
import { ticketStatus } from '../index';

export function reply(ctx: Context, config: Config) {
  ctx.command("helpdesk.reply <id:integer> <message>", "回复工单", { authority: 0 })
    .action(async ({ session }, id, message) => {
    const res = await ctx.database.get("helpdesk_list", { 
      id: id
    })
    const initiator = res[0].participants[0].userId
    if (!config.adminId.includes(session.userId) && session.userId !== initiator) return "你没有权限回复工单"
    const date = new Date()
    const dateIso = date.toISOString()

    const [ticketRecord] = await ctx.database.get('helpdesk_list', id)
    const contents = ticketRecord.contents
    for (const key in contents) {
      if (!contents[+key+1]) {
        contents[+key+1] = {
          username: session.username,
          userId: session.userId,
          date: dateIso,
          message: message
        }
        break
      }
    }
    await ctx.database.set('helpdesk_list', id, {contents, ticketStatus: ticketStatus[2]})
    for (let i = 0; i < config.adminId.length; i++) {
      session.bot.sendPrivateMessage(config.adminId[i], `工单编号: ${id}
        回复内容: ${message}
        回复时间: ${dateIso}
        工单状态: ${ticketStatus[2]}
        使用指令
        \`hd reply ${id} 信息\`
        来回复工单`)
    }
    return `工单已回复，编号为 ${id}
      回复内容: ${message}
      回复时间: ${dateIso}
      工单状态: ${ticketStatus[2]}`
    })
}