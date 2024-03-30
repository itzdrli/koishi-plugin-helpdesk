import { Context } from "koishi";
import { Config } from "./index";

export async function exportToJson(ctx: Context, config: Config, id){
    const data = await generateJson(ctx, config, id)
    return data
}

async function generateJson(ctx: Context, config: Config, id){
    const res = await ctx.database.get("helpdesk_list", { 
        id: parseInt(id)
    })
    const firstDate = new Date(res[0].contents[0].date)
    const lastDate = new Date(res[0].contents[Object.keys(res[0].contents).length - 1].date)
    const duration = lastDate.getTime() - firstDate.getTime()
    let jsonData = {
        "ticketId": `${res[0].id}`,
        "asker": `${res[0].participants[0].userId}`,
        "parameters": {
            "duration": duration
        },
        "participants": {},
        "timeline": [],
        "conversation": [

        ],
    }

    // participants
    for (const key in res[0].participants) {
        const participant = res[0].participants[key]
        const participantId = participant.userId
        jsonData.participants[participantId] = {
            "name": participant.username,
            "avatarUrl": participant.avatar
        };
    }

    // timeline
    const timelineKeys = Object.keys(res[0].contents);
    for (let i = 0; i < timelineKeys.length; i++) {
        const key = timelineKeys[i];
        const timelineEntry = res[0].contents[key];
        let label = "";
        if (i === 0) {
            label = "工单创建";
        } else if (i === timelineKeys.length - 1) {
            label = "工单关闭";
        } else {
            label = "工单被回复";
        }
        jsonData.timeline.push({
            "label": label,
            "timestamp": timelineEntry.date
        });
        jsonData.conversation.push({
            "senderId": timelineEntry.userId,
            "timestamp": timelineEntry.date,
            "content": {
                "type": "text",
                "text": timelineEntry.message
            }
        });
    }
    const result = JSON.stringify(jsonData)
    return result
}
