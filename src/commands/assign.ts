import { Context, h } from 'koishi';
import { Config } from '../index';

export function assign(ctx: Context, config: Config) {
  ctx.command("helpdesk.assign <ticketId:integer>", "添加参与者", { authority: 0 })
    .action(async ({ session }, ticketId, user) => {
      if (!ticketId) return "请提供工单ID"
      if (!user) return "请提供用户信息(@)"
      const { type, attrs } = h.parse(user)[0]

      const [ticketRecord] = await ctx.database.get("helpdesk_list", ticketId)
      const participants = ticketRecord.participants
      for (const key in participants) {
        if (participants[key].userId === attrs.id) return `工单 ${ticketId} 已有参与者 ${attrs.name}`
        if (!participants[+key+1]) {
          participants[+key+1] = {
            username: attrs.name,
            userId: attrs.id,
            avatar: (await session.bot.getGuildMember(session.guildId, attrs.id)).user.avatar
          }
          break
        }
      }
      await ctx.database.set('helpdesk_list', ticketId, {participants})
      return `工单 ${ticketId} 已添加参与者 ${attrs.name}`
    })
}