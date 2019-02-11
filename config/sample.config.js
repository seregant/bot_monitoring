module.exports = {
    "port": 3500,
    "poll_interval":"5", //in minutes
    "poll_CPU_thershold":"90", //in percent
    "bot_token": "", //set your bot telegram token here
    "bot_username": "@indra_ag_bot", //your bot username (use '@')
    "group_chat_id" : "", //allowed group chat
    "owner_username" : [""], //set your telegram username here
    "server_key": "Th1s_is_K3Y", //the key must same
    "command":["/start","/monitor","/startpoll"],
    "server":[
        {
            "name": "My Local",
            "slug":"my_local", //must unique, use underscore for separate
            "host":"127.0.0.1",
            "port":"3600"
        },
        // {
        //     "name":"",
        //     "slug":"",
        //     "host":"",
        //     "port":""
        // },
    ]
}