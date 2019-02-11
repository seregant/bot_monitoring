module.exports = {
    "port": 3500,
    "poll_interval":"5", //in minutes
    "bot_token": "", //set your bot telegram token here
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