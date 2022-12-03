const { Intents, MessageEmbed } = require('discord.js');
const Discord = require('discord.js');
const dotenv = require('dotenv');
dotenv.config()

var token = process.env.TOKEN;
var channelId = process.env.CHANNELID

const client = new Discord.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
})

client.login(token) //client token

var ws = require('nodejs-websocket');
var port = 6000;
var date = new Date();


function toJSON(str) {
    if (typeof str == 'string') {
        try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) { return obj; } else { return false; }
        } catch (e) {}
    }
}

client.on("ready", (msg) => {
    var channel = client.channels.cache.get(channelId)
    var server = ws.createServer(function(conn) {
        console.log('New Connect Join\n');
        conn.on("text", function(str) {
            var Message = toJSON(str)
            switch (Message.type) {
                case 'chat':
                    if (Message.message.includes("<@")) return;
                    if (Message.message.includes("<@everyone>")) return;
                    if (Message.message.includes("<")) return;
                    if (Message.message.includes("@everyone")) return;
                    if (Message.message.includes("@here")) return;
                    if (Message.message.includes("!list")) return;
                    if (Message.message.includes('!tps')) return;
                    channel.send('[' + Message.time + ' | Chat]' + '<' + Message.player + '>' + Message.message);
                    break;
                case 'PlayerDie':
                    channel.send('[' + Message.time + ' | 死亡]' + '玩家 **' + Message.DiePlayer + '** 被 ' + '**' + Message.KillBy + ' **殺死了')
                    break;
                case 'serverstart':
                    channel.send("Server Open")
                    break;
                case 'PlayerSuicide':
                    channel.send('`[' + Message.time + ' | 玩家非正常死亡]' + '玩家 ' + Message.player + Message.randomtext + '`')
                    break;
                case 'PlayerJoin':
                    channel.send('`[' + Message.time + ' | Player Join]' + 'Player ' + Message.JoinPlayer + ' Join`')
                    break;
                case 'PlayerLeft':
                    channel.send('`[' + Message.time + ' | Player Left]' + 'Player ' + Message.LeftPlayer + ' Left`')
                    break;
                case 'Playerlist':
                    console.log('list')
                    channel.send(Message.list)
                    break;
                case 'tps':
                    console.log('tps')
                    channel.send(Message.tps)
                    break;
            }
        })
        conn.on("close", function(code, reason) {
            console.log("Connect Close\n");
            channel.send('Server Close')
        })
        conn.on("error", function(err) {
            console.log("header err\n");
            console.log(err);
        })

        client.on("messageCreate", (msg) => {
            if (msg.channel.id === channelId) {
                if (msg.author.id === client.user.id) return;
                if (!msg.content || msg.content === "") return;
                if (msg.content == "!list") {
                    if (msg.author.id === client.user.id) return;
                    conn.send(JSON.stringify({
                        type: 'Playerlist'
                    }))
            }
            if (msg.channel.id === channelId) {
                if (msg.author.id === client.user.id) return;
                if (!msg.content || msg.content === "") return;
                if (msg.content == "!tps") {
                    if (msg.author.id === client.user.id) return;
                    conn.send(JSON.stringify({
                        type: 'tps'
                    }))
                }
            }
            conn.send(JSON.stringify({
                type: 'message',
                gomsg: msg.content,
                sender: msg.author.tag
            }))
            }
        })
    }).listen(port);

    console.log("websocket server listen port is " + port + "\n");
})
