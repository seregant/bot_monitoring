const config = require('./config/config.js')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const TelegramBot = require('node-telegram-bot-api')
const token = config.bot_token
const bot = new TelegramBot(token, {polling: true})
const Promise = require('promise')
const request = require('request')
const interval = config.poll_interval, interval_in_ms = interval * 60 * 1000
const cpu_thershold = config.poll_CPU_thershold
bot.on('message', (msg) => {
    // console.log(msg) 
    if(config.owner_username.includes(msg.from.username)|| config.group_chat_id == msg.chat.id){
        let searchCommand = new Promise((resolve,reject)=>{
            for (let i = 0; i < config.command.length; i++) {
                var command = config.command[i]
                if(msg.text.toString() == command || msg.text.toString() == command+config.bot_username){
                    resolve(command+config.bot_username)
                }
            }
        })
        
        searchCommand.then((perintah)=>{
            console.log(perintah)
            if(perintah != ''){
                if (perintah =='/start'+config.bot_username) {
                    bot.sendMessage(msg.chat.id, 'Selamat datang '+msg.from.first_name+' '+msg.from.last_name + '\n Daftar Command : \n - /startpoll : Memulai poller monitoring \n - /monitor : Menampilkan penggunaan resource')
                }
                if (perintah == '/monitor'+config.bot_username) {
                    let list_server = []
                    let collectServer = new Promise((resolve,reject)=>{
                        for (let i = 0; i < config.server.length; i++) {
                            list_server.push([{text:config.server[i].name, callback_data:config.server[i].slug}])                        
                        }
                        resolve('done')
                    })
                    
                    collectServer.then((done)=>{
                        if(done){
                            var options = {
                                reply_markup: JSON.stringify({
                                  inline_keyboard: list_server
                                })
                            }
                            bot.sendMessage(msg.chat.id, 'Silahkan pilih server : ',options)
                        }
                    })
                }
                if (perintah == '/startpoll'+config.bot_username) {
                    bot.sendMessage(msg.chat.id,"Poller monitoring dijalankan!")
                    let a=1
                    setInterval(function(){
                        console.log('Polling'+a)
                        for (i=0; i < config.server.length; i++){
                            let poll = new Promise ((resolve, reject)=>{
                                request({
                                     url:'http://'+config.server[i].host+':'+config.server[i].port+'/sysinfo',
                                    headers:{
                                        'Authorization': 'Bearer '+ config.server_key
                                    }
                                },(err, res, body)=>{
                                    var result = JSON.parse(body)
                                    result = result.data
                                    resolve(result)
                                })
                            })

                            poll.then((data)=>{
                                let diskFreePrecentage = data.disk2.free / data.disk2.total * 100
                                let diskUsage = 100 - diskFreePrecentage
                                if (data.cpu_usage2 > cpu_thershold) {
                                   bot.sendMessage(msg.chat.id, '\u26A0 WARNING!! \u26A0 \n Penggunaan CPU server '+data.srv_name+ ' lebih dari '+thershold+'% \n Penggunaan saat ini : '+data.cpu_usage,{parse_mode: "HTML"})
                                }

                                if (diskFreePrecentage < 50) {
                                    bot.sendMessage(msg.chat.id, '\u26A0 WARNING!! \u26A0 \n Penggunaan Harddisk server '+data.srv_name+' sudah mecapai '+diskUsage.toFixed(2)+'% \n - Harddisk total : '+data.disk.total+'\n - Hardisk free : '+data.disk.free)
                                }
                                console.log('cpu : '+data.cpu_usage2)
                                console.log('diskFree :'+diskFreePrecentage+'%')
                                console.log('diskUsage : '+diskUsage+'%')
                            })
                        }
                        a++
                    }, interval_in_ms)
                }
            }
            
        })
    }else{
        bot.sendMessage(msg.chat.id, '<b> \u26A0 DANGER !!! \u26A0 </b> \n Anda bukan owner.', {parse_mode: "HTML"}) 
    }
})

bot.on('callback_query', function onCallbackQuery(server_choosen) {
    let collectServer = new Promise((resolve,reject)=>{
        for (let i = 0; i < config.server.length; i++) {
            if(config.server[i].slug == server_choosen.data){
                resolve(config.server[i])
            }                   
        }
    })
    
    collectServer.then((server)=>{
        monitorSrv(server,bot,server_choosen)
    })
})

function monitorSrv(server,bot,server_choosen){
    request({
            url:'http://'+server.host+':'+server.port+'/sysinfo',
            headers:{
                'Authorization': 'Bearer '+ config.server_key
            }
        },(err, res, body)=>{
            var result = JSON.parse(body)
            result = result.data
            let data = ''
            data += "Server   : "+ server.name +"\n\n"
            data += "Platform : "+ result.platform + "\n"
            data += "CPU      : " +result.cpu + "\n"
            data += "Number of CPUs : " +result.num_cpu + "\n"
            data += "CPU Usage (%)  : " + result.cpu_usage + "\n"
            data += "Total Memory   : " + result.total_mem + "\n"
            data += "Free Memory    : " + result.free_mem + "\n"
            data += "System Uptime  : " + result.uptime + "\n"
            data += "\n"
            data += "Disk Size      : " + result.disk.total + "\n"
            data += "Disk Free Space: " + result.disk.free + "\n"
            let opts = {
                chat_id: server_choosen.message.chat.id,
                message_id: server_choosen.message.message_id,
                parse_mode: "HTML"
            }
            bot.editMessageText(data, opts);
        })
}

app.use(bodyParser.json())
console.log('Telegram Bot server is running')