import { Context } from 'koishi';
import { Config } from '../index';
import { ticketStatus } from '../index';
import { exportToJson } from '../export';

export function close(ctx: Context, config: Config) {
  ctx.command("helpdesk.close <id:integer>", "关闭工单", { authority: 0 })
  .action(async ({ session }, id) => {
    const res = await ctx.database.get("helpdesk_list", { 
      id: id
    })
    const initiatorId = res[0].participants[0].userId
    if (session.userId !== initiatorId && !config.adminId.includes(session.userId)) {
      return "你没有权限关闭此工单"
    }
    if (res[0].ticketStatus === ticketStatus[3]) return "工单已经关闭"
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
          message: "Ticket Closed"
        }
        break
      }
    }
    await ctx.database.set("helpdesk_list", { id: id }, {
      contents, 
      ticketStatus: ticketStatus[3] 
    })
    session.send("工单已关闭, 编号为" + id + "\n是否导出工单(回复y/n)")
    const exportConfirmation = await session.prompt(600000)
    if (exportConfirmation === "y") {
      const data = await exportToJson(ctx, config, id)
      const data64 = "data:application/json;base64," + Buffer.from(data).toString('base64')
      const date = new Date()
      const dateIso = date.toISOString()
      const fileName = "Transcript_"+dateIso
      session.send("工单导出内容:\n" + data + "\n可以将上方内容保存至json文件后打开网站 https://ticket.itzdrli.com/ 进行预览")
      return `<file src="${data64}" title="${fileName}.json"/>`
    } else {
      return
    }
  })
}