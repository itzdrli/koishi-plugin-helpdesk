import { Context, $ } from 'koishi';
import { Config } from '../index';
import { ticketStatus } from '../index';

export function close(ctx: Context, config: Config) {
  ctx.command("helpdesk.close <id>", "关闭工单", { authority: 0 })
  .action(async ({ session }, id) => {
    const res = await ctx.database.get("helpdesk_list", { 
      id: parseInt(id)
    })
    const initiatorId = res[0].participants[0].userId
    if (session.userId !== initiatorId || session.userId !== config.adminId) {
      return "你没有权限关闭此工单"
    }
    if (res[0].ticketStatus === ticketStatus[3]) return "工单已经关闭"
    await ctx.database.set("helpdesk_list", { id: parseInt(id) }, { 
      ticketStatus: ticketStatus[3] 
    })

    return `工单已关闭，编号为 ${id}`
  })
}