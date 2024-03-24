import { Context } from 'koishi';
import { Config } from '../index';
import { ticketStatus } from '../index';

export function adminReply(ctx: Context, config: Config) {
  ctx.command("helpdesk.adminReply <id:integer> <message>", "回复工单", { authority: 0 })
    .action(async ({ session }, id, message) => {
      if (session.userId !== config.adminId) return "你没有权限回复工单"
      const res = await ctx.database.get("helpdesk_list", { 
        id: id
      })
      if (res.length === 0) return "工单不存在"
      if (res[0].ticketStatus === ticketStatus[3]) return "工单已关闭，管理员无法回复"
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
      await ctx.database.set('helpdesk_list', id, {contents, ticketStatus: ticketStatus[1]})

      const reciverId = res[0].participants[0].userId
      session.bot.sendPrivateMessage(reciverId, `工单编号: ${id}\n
        回复内容: ${message}
        回复时间: ${dateIso}
        工单状态: ${ticketStatus[1]}\n
        使用指令
        \`reply ${id} 信息\`
        来回复工单`)

      return `工单已回复，编号为 ${id}
        回复内容: ${message}
        回复时间: ${dateIso}
        工单状态: ${ticketStatus[1]}`
    })
}