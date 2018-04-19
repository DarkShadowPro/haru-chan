const Discord = require('discord.js');
const client = new Discord.Client();
const math = require("mathjs");

var fs = require('fs')
  , ini = require('ini');

var new_user = ini.parse(fs.readFileSync('./user_sample.ini', 'utf-8'));
var new_server = ini.parse(fs.readFileSync('./server_sample.ini', 'utf-8'));
var user_ini, server_ini, server_dir, user_dir;
var cmd;
var emoji = {
    error:"<:haruError:433615947220254722>",
    checked:"<:haruChecked:433617429109932033>"
}

//Client Config

client.prefix = "=";
client.color = 0xffff55;
client.color = 0x00a5f9;
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
    };
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }
function t_resp(x, t_username){
    if(x.user.tag.toLowerCase() === t_username){
        return true;
    }
    else if(x.user.username.toLowerCase().indexOf(t_username)===0){
      return true;
    }else if(x.nickname != undefined){
      return (x.nickname.toLowerCase().indexOf(t_username)===0);
    }else{
      return (x.user.id === t_username);
    }
  }
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
      return fs.statSync(path+'/'+file).isDirectory();
    });
  }
function is_enabled(command){
    return (server_ini.commands[command] === "1");
}
function is_command(b){
    if(cmd !== b) return false;
    return is_enabled(cmd);
}
function is_a_command(m_cmd){
    var m_cmd_list = [];
    m_cmd_list.push("avatar");
    m_cmd_list.push("choose");
    m_cmd_list.push("icon");
    m_cmd_list.push("info");
    m_cmd_list.push("invite");
    m_cmd_list.push("math");
    m_cmd_list.push("nickme");
    m_cmd_list.push("ping");
    m_cmd_list.push("purge");
    m_cmd_list.push("rank");
    m_cmd_list.push("roles");
    m_cmd_list.push("say");
    m_cmd_list.push("server");
    m_cmd_list.push("warn");
    m_cmd_list.push("xp");
    return (m_cmd_list.indexOf(m_cmd) !==-1);
}
client.on('message', message => {
    if (message.channel.type !== "text") return;
    if (message.author.bot === true) return;
    server_dir = `./servers/${message.guild.id}/`;
    user_dir = `./users/${message.author.id}/`;
    if (fs.existsSync(user_dir)){
        if (fs.existsSync(`${user_dir}info.ini`)){
            user_ini = ini.parse(fs.readFileSync(`${user_dir}info.ini`, 'utf-8'));
            user_ini.info.xp = (parseInt(user_ini.info.xp) + getRndInteger(0, 3)).toString();
            user_ini.info.tag = message.author.tag;
            fs.writeFileSync(`${user_dir}info.ini`, ini.stringify(user_ini));
        }
    }else{
        fs.mkdirSync(user_dir);
        user_ini = new_user;
        user_ini.info.name = message.author.username;
        user_ini.info.tag = message.author.tag;
        user_ini.info.xp = "0";
        user_ini.info.credits = "0";
        fs.writeFileSync(`${user_dir}info.ini`, ini.stringify(user_ini));
    }
    if (fs.existsSync(server_dir)){
        if (fs.existsSync(`${server_dir}info.ini`)){
            server_ini = ini.parse(fs.readFileSync(`${server_dir}info.ini`, 'utf-8'));
            fs.writeFileSync(`${server_dir}info.ini`, ini.stringify(server_ini));
        }
    }else{
        fs.mkdirSync(server_dir);
        server_ini = new_server;
        server_ini.info.name = message.guild.name;
        fs.writeFileSync(`${server_dir}info.ini`, ini.stringify(server_ini));
    }
    let prefix = client.prefix;
    if (!message.content.startsWith(prefix)){
        for(var i=0;i<server_ini.banned.word.length;i++){
            if (server_ini.banned.word[i] !== "*"){
                if (message.content.toLowerCase().indexOf(server_ini.banned.word[i]) !== -1){
                    try{
                        message.delete();
                    }catch(ex){

                    }
                }
            }
        }
    }
    if (!message.content.startsWith(prefix)) return;
    var msg;
    msg = message.content.split(/\s+/g);
    if (msg.length > 0){
        cmd = msg[0].slice(1).toLowerCase();
    }
    // Comandos
    try{
        if (is_command("avatar")){
          let user, avatarURL, embed, member, t_user;
          user = message.mentions.users.first();
          if (user == null){
            if(message.content.toLowerCase() !== client.prefix + "avatar"){
              var t_username = message.content.substring((client.prefix + " avatar").length, message.content.length).toLowerCase();
              var my_users;
              my_users = message.guild.members.filter(x => t_resp(x, t_username));
              var my_users_tag = my_users.map(y => y.user.tag);
              var my_users_id = my_users.map(y => y.user.id);
              var if_is_id;
              if_is_id = parseInt(t_username);
              if (if_is_id){
                client.fetchUser(t_username).then((user)=>{
                  t_user = user;
                  avatarURL = t_user.avatarURL;
                  return message.channel.send(avatarURL);
                });
                return;
              }
              if(my_users.size === 0 && !if_is_id) return message.reply("Não encontrei nenhum usuário com esse nome.");
              if(my_users.size === 1 && !if_is_id){
                member = message.guild.members.get(my_users_id[0]);
                if(!member || member == undefined) return message.channel.send('O comando **avatar** foi cancelado!');;
                avatarURL = member.user.avatarURL;
                return message.channel.send(avatarURL);
              }
              var my_text = "**" + message.author.username + '**, sua pesquisa encontrou **' + my_users.size.toString() + ' usuários**:```ini\n';
              for(var i = 0; i < my_users.size;i+=1){
                my_text += "[" + (i + 1).toString() + "] " + my_users_tag[i] + " (" + my_users_id[i] + ")\n";
              }
              my_text += "[X] Cancelar (30 segundos)```";
              if (my_text.length >= 2000){
                  return message.channel.send(`${emoji.error} Muitos usuários encontrados, por favor, seja mais específico.`);
              }
              message.channel.send(my_text)
             .then(() => {
               message.channel.awaitMessages(response => response.author.id === message.author.id, {
                 max: 1,
                 time: 30000,
                 errors: ['time'],
               })
               .then((collected) => {
                   var get_collected = collected.first().content;
                   if (get_collected.toLowerCase() === "x"){
                     return message.channel.send('O comando **avatar** foi cancelado!');;
                   }
                   var num = parseInt(get_collected);
                   if (!num){
                     for(var i = 0;i < my_users.size;i++){
                       if(my_users_tag[i].toLowerCase() === get_collected.toLowerCase()){
                         member = message.guild.members.get(my_users_id[i]);
                       }
                     }
                   }else{
                     member = message.guild.members.get(my_users_id[num-1]);
                   }
                   if(!member){
                     member = message.guild.members.get(get_collected);
                   }
                   if(member && !t_user){
                     t_user = member.user;
                   }
                   if(!t_user) return message.channel.send('O comando `avatar` foi cancelado!');;
                   avatarURL = t_user.avatarURL;
                   message.channel.send(avatarURL);
                 })
                 .catch(() => {
                   message.channel.send('O comando `avatar` foi cancelado!');
                 });
             });
           }else{
            user = message.author;
            avatarURL = message.client.users.get(user.id).avatarURL;
            message.channel.send(avatarURL);
          }
          }
          else{
            avatarURL = message.client.users.get(user.id).avatarURL;
            message.channel.send(avatarURL);
          }
        }
        if (cmd === "banword"){
            if (msg.length > 1){
                var my_word = message.content.substring((prefix + " banword").length, message.content.length).toLowerCase();
                if (server_ini.banned.word.indexOf(my_word) === -1 || my_word !== "*"){
                    if (message.member.hasPermission("MANAGE_GUILD")){
                        server_ini.banned.word.push(my_word);
                        fs.writeFileSync(`${server_dir}info.ini`, ini.stringify(server_ini));
                        message.channel.send(`${emoji.checked} Essa palavra foi censurada com sucesso!`);
                    }else{
                        message.channel.send(`${emoji.error} Você não tem permissão para censurar uma palavra!`);
                    }
                }else{
                    message.channel.send(`${emoji.error} Essa palavra já foi censurada!`);
                }
            }
        }
        if (cmd === "bannedwords"){
            var text = "";
            if(server_ini.banned.word.length === 1){
                message.channel.send("A lista de palavras censuradas está vazia!");
            }else{
                text += `Essa é a lista de palavras censuradas: `;
                for (var i=0;i<server_ini.banned.word.length;i++){
                    if (server_ini.banned.word[i] !== "*"){
                        text += "[" + server_ini.banned.word[i] + "] ";
                    }
                }
                message.channel.send(text);
            }
        }
        if (is_command("choose")){
            var args = msg.slice(1);
            var t_choose = args.join(" ").split("|");
            message.channel.send(t_choose[getRndInteger(0, t_choose.length)]);
        }
        if (cmd === "disable"){
            if (message.member.hasPermission("MANAGE_GUILD")){
                if (msg.length === 1){
                    message.channel.send(`${emoji.error} A forma correta de usar esse comando é: **=disable [comando]**`);
                }else if (is_a_command(msg[1])){
                    server_ini.commands[msg[1]] = "0";
                    message.channel.send(`${emoji.checked} O comando **${msg[1]}** foi desabilitado.`);
                    fs.writeFileSync(`${server_dir}info.ini`, ini.stringify(server_ini));
                }
            }else{
                message.channel.send(`${emoji.error} Você não tem permissão para habilitar/desabilitar um comando!`)
            }
        }
        if (cmd === "enable"){
            if (message.member.hasPermission("MANAGE_GUILD")){
                if (msg.length === 1){
                    message.channel.send(`${emoji.error} A forma correta de usar esse comando é:\n**=enable [comando]**`);
                }else if (is_a_command(msg[1])){
                    server_ini.commands[msg[1]] = "1";
                    message.channel.send(`${emoji.checked} O comando **${msg[1]}** foi habilitado.`);
                    fs.writeFileSync(`${server_dir}info.ini`, ini.stringify(server_ini));
                }
            }else{
                message.channel.send(`${emoji.error} Você não tem permissão para habilitar/desabilitar um comando!`)
            }
        }
        if (cmd === "help"){
            if (msg.length === 1){
                var my_commands_list = "";
                my_commands_list = "**[Lista de comandos]**\n";
                my_commands_list += "**Configuração**\n";
                my_commands_list += "•**disable**: desabilita um comando\n";
                my_commands_list += "•**enable**: habilita um comando\n";
                my_commands_list += "**Moderação**\n";
                my_commands_list += "•**banword**: adiciona uma palavra ou frase à lista de palavras censuradas\n";
                my_commands_list += "•**bannedwords**: mostra a lista de palavras censuradas\n";
                my_commands_list += "•**unbanword**: remove uma palavra ou frase da lista de palavras censuradas\n";
                my_commands_list += "•**purge**: apaga um certo número de mensagens em um canal\n";
                my_commands_list += "•**warn**: alertar um membro com uma mensagem\n";
                my_commands_list += "**Utilitário**\n";
                my_commands_list += "•**avatar**: veja a foto de perfil de um usuário\n";
                my_commands_list += "•**icon**: veja ícone do servidor em que você está\n";
                my_commands_list += "•**info**: obtém informações de um usuário\n";
                my_commands_list += "•**nickme**: muda o seu apelido no servidor\n";
                my_commands_list += "•**roles**: envia uma lista com todos os cargos do servidor\n";
                my_commands_list += "•**server**: mostra informações sobre o servidor\n";
                my_commands_list += "**Outros**\n";
                my_commands_list += "•**choose**: faço as escolhas mais difíceis\n";
                my_commands_list += "•**invite**: recebe um link para me convidar a outros servidores\n";
                my_commands_list += "•**math**: posso calcular um monte de coisas\n";
                my_commands_list += "•**ping**: cheque a minha latência\n";
                my_commands_list += "•**roles**: envia uma lista com todos os cargos do servidor\n";
                my_commands_list += "•**say**: repete a frase que você disse\n";
                message.member.send(my_commands_list);
                message.channel.send(`${emoji.checked} Enviei os meus comandos para você nas **Mensagens Diretas**!`);
            }
        }
        if (is_command("icon")){
            message.channel.send(message.guild.iconURL);
        }
        if (is_command("info")){
            let user_id, user, avatarURL, embed;
            user = message.mentions.users.first();
            if (user != null){
                user_id = user.id
            }else{
                if (msg.length === 1){
                    user_id = message.author.id;
                }else{
                    user_id = msg[1];
                    try{
                        var t_username = message.content.substring((client.prefix + " info").length, message.content.length).toLowerCase();
                        var my_users = message.guild.members.filter(x => t_resp(x, t_username));
                        var my_users_tag = my_users.map(y => y.user.tag);
                        var my_users_id = my_users.map(y => y.user.id);
                        if (my_users_id.length > 0){
                            user_id = my_users_id[0];
                        }
                    }catch(exx){

                    }
                }
            }
            client.fetchUser(user_id).then((t_user)=>{
                user = t_user;
                var _member;
                var date2 = "Nenhum dia";
                var _nickname = "Nenhum";
                try{
                 var date2_test = message.guild.members.get(user.id).joinedAt.toString();
                 _member = message.guild.members.get(user.id);
                 if (date2_test){
                     date2 = date2_test;
                 }
                 _nickname = message.guild.members.get(user.id).nickname;
                }catch(exx){

                }
                var date1 = user.createdAt.toString();
                if (_nickname == null){
                    _nickname = "Nenhum";
                //_nickname = message.guild.members.get(user.id).user.username;
                }
                var qnt = "0";
                var string_roles = "Nenhum";
                if (date2 !== "Nenhum dia"){
                    qnt = message.guild.members.get(user.id).roles.size.toString();
                    string_roles = message.guild.members.get(user.id).roles.map(x => x.name).join(', ');
                }else{

                }
                message.channel.send({embed: {
                    color: client.color,
                    author: {
                        name: `${user.username}#${user.discriminator}`,
                        icon_url: user.avatarURL
                    },
                    thumbnail: {
                        url: user.avatarURL
                    },
                    title: "",
                    description: "",
                    fields: [
                        {
                            name: "Apelido",
                            value: _nickname,
                            inline: true
                        },
                        {
                            name: "ID",
                            value: user.id,
                            inline: true
                        },
                        {
                            name: "Status",
                            value: user.presence.status,
                            inline: true
                        },
                        {
                            name: "Conta criada em",
                            value: date1,
                            inline: true
                        },
                        {
                            name: "Entrou em",
                            value: date2,
                            inline: true
                        },
                        {
                            name: `Cargos[${qnt}]`,
                            value: string_roles,
                            inline: true
                        }
                    ]   
                }});
        });
        }
        if (is_command("invite")){
            message.channel.send(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=204483584`);
        }
        if (is_command("math")){
                var to_math = message.content.substring((prefix + "math").length, message.content.length);
                to_math = replaceAll(to_math.toLowerCase(), "x", "*");
                to_math = replaceAll(to_math.toLowerCase(), ":", "/");
                message.channel.send(math.eval(to_math));
        }
        if (is_command("nickme")){
            var new_nickname = message.content.substring((client.prefix + " nickme").length, message.content.length);
            console.log(new_nickname);
            if (new_nickname.length === 0){
                message.channel.send(`${emoji.error} Por favor, digite um apelido válido.`);
            }else{
                if (message.guild.members.get(client.user.id).hasPermission("MANAGE_NICKNAMES")){
                    try{
                        message.member.setNickname(new_nickname);
                        message.channel.send(`${emoji.checked} Seu apelido agora é **${new_nickname}**.`);
                    }catch(exx){
                        message.channel.send(`${emoji.error} Não tenho permissão para mudar o seu apelido.`);
                    }
                }else{
                    message.channel.send(`${emoji.error} Desculpe-me ${message.member.user.username}, mas não tenho permissão para mudar apelido de usuários. Por favor, peça para um administrador me dar essa permissão`);
                }
            }
        }
        if (is_command("ping")){
            message.channel.send("Pingando...")
            .then(sentMsg => {
                sentMsg.edit(`:ping_pong: Pong! Demorei \`${sentMsg.createdTimestamp - message.createdTimestamp}ms\``);
            });
        }
        if (is_command("purge")){
            if (!message.member.hasPermission('MANAGE_GUILD')) return message.reply("<:haruError:433615947220254722> Você não tem permissão para excluir mensagens.");
            if (!message.guild.members.get(client.user.id).hasPermission('MANAGE_MESSAGES')) return message.reply(client.lang[language].icant_purge);
            var user = message.mentions.users.first();
            var amount = 0;
            if (!user){
                amount = parseInt(msg[1]);
            }else{
                amount = parseInt(msg[2]);
            }
            if (amount > 99) return message.channel.send("<:haruError:433615947220254722> Por favor, insira uma quanidade entre 1 e 99.");
            if (!amount) return message.channel.send("<:haruError:433615947220254722> Por favor, especifique uma quantidade válida.");
            amount += 1;
            if (!amount && !user) return message.channel.send("<:haruError:433615947220254722> Por favor, especifique uma quantidade, ou usuário e quantidade.");
            var correct = 100;
            if(!user){
                correct = amount;
            }
            message.channel.fetchMessages({
                limit: correct
            }).then((messages) => {
                if (user) {
                    const filterBy = user ? user.id : client.user.id;
                    messages = messages.filter(m => (m.author.id === filterBy || m.id === message.id)).array().slice(0, amount);
                }
                message.channel.bulkDelete(messages).then(function(){
                    if(amount === 2){
                        message.channel.send(`<:haruChecked:433617429109932033> Foi apagada **1** mensagem desse canal.`).then(msg => {
                            msg.delete(2000);
                        });
                    }else{
                        message.channel.send(`<:haruChecked:433617429109932033> Foram apagadas **${amount-1}** mensagens desse canal.`).then(msg => {
                            msg.delete(2000);
                        });
                    }
                });
            }
            );
        }
        if (is_command("roles")){
            message.channel.send({embed: {
                color: client.color,
                title: "Cargos" + " [" + message.guild.roles.size.toString() + "]",
                description: message.guild.roles.sort((a, b) => (-a.calculatedPosition  +b.calculatedPosition)).map(rp => rp.name).join(", ")
                }
            });
        }
        if (is_command("rank")){
            var users_id = getDirectories("./users/");
            var users_to_sort = [];
            for(var i = 0; i < users_id.length;i++){
                var i_user = ini.parse(fs.readFileSync(`./users/${users_id[i]}/info.ini`, 'utf-8'));
                users_to_sort[users_id[i]] = parseInt(i_user.info.xp);
            }
            var keys = [];
            for (var key in users_to_sort) {
                keys.push(key);
            }
            keys.sort(function(k0, k1) {
                var a = users_to_sort[k0];
                var b = users_to_sort[k1];
                return a < b ? -1 : (a > b ? 1 : 0);
            });
            var text = "**Ranking Global**\n```ini\n";
            text += "📋 Rank | Nome\n";
            for (var i = 0; i < Math.min(10, keys.length); i++) {
                var key = keys[keys.length - i - 1];
                var value = users_to_sort[key];
                var i_user = ini.parse(fs.readFileSync(`./users/${key}/info.ini`, 'utf-8'));
                // Do something with key and value.
                text += "[" +  (i + 1).toString() + `]  ${(i === 9 ? "" : " ")}  > ` + (i_user.info.tag != undefined ? i_user.info.tag : i_user.info.name) + "\n";
                text += "            XP: " + value.toString() + "\n";
            }
            text += "-------------------------------------\n";
            text += "#Sua colocação no ranking:\n";
            text += `[Rank]: ${-keys.indexOf(message.author.id)+keys.length}    [XP]: ${user_ini.info.xp}`;
            text += "```";
            message.channel.send(text);
        }
        if (is_command("say")){
            if (msg.length > 1){
                message.channel.send(message.content.substring((client.prefix + " say").length), message.content.length);
              }else{
                message.channel.send(`${emoji.error} A forma correta de usar esse comando é: **=say [frase]**`);
              }
        }
        if (is_command("server")){
            var date1 = message.guild.createdAt.toString();
            var server;
            server = message.guild;
            var textvoice_channels = message.guild.channels.filter(x => (x.type === "text")).size.toString() + " de texto";
            textvoice_channels += "\n"+ message.guild.channels.filter(x => (x.type === "voice")).size.toString() + " de voz";
            var lvl = [];
            lvl.push("none");
            lvl.push("low");
            lvl.push("medium");
            lvl.push("hard");
            lvl.push("expert");
            message.channel.send({embed: {
                color: client.color,
                author: {
                    name: server.name,
                    icon_url: server.iconURL
                },
                thumbnail: {
                    url: server.iconURL
                },
                title: "",
                description: "ID  " + server.id,
                fields: [{
                    name: "Nível de verificação",
                    value: lvl[server.verificationLevel],
                    inline: true
                },
                {
                    name: "Região",
                    value: server.region,
                    inline: true
                },
                {
                    name: "Membros [" + message.guild.memberCount.toString() + "]",
                    value: message.guild.members.filter(x => (x.user.presence.status !== "offline")).size + " online",
                    inline: true
                },
                {
                    name: "Canais",
                    value: textvoice_channels,
                    inline: true
                },
                {
                    name: "Proprietário",
                    value: message.guild.owner.user.tag + " (" + message.guild.owner.user.id + ")",
                    inline: true
                },
                {
                    name: "Criado em",
                    value: date1,
                    inline: true
                },
                {
                    name: "Cargos [" + message.guild.roles.size.toString() + "]",
                    value: "Digite **=roles** para ver uma lista com todos os cargos do servidor.",
                    inline: false
                }
                ]
            }});
        }
        if (cmd === "unbanword"){
            if (msg.length > 1){
                var m_msg = message.content.substring((prefix + " unbanword").length, message.content.length);
                var index = server_ini.banned.word.indexOf(m_msg.toLowerCase());
                if (index !== -1 && m_msg !== "*"){
                    if (message.member.hasPermission("MANAGE_GUILD")){
                        server_ini.banned.word.splice(index, 1);
                        fs.writeFileSync(`${server_dir}info.ini`, ini.stringify(server_ini));
                        message.channel.send(`${emoji.checked} Essa palavra foi descensurada com sucesso!`);
                    }else{
                        message.channel.send(`${emoji.error} Você não tem permissão para descensurar uma palavra!`);
                    }
                }else{
                    message.channel.send(`${emoji.error} Essa palavra não está censurada!`);
                }
            }
        }
        if (is_command("warn")){
            let user;
            user = message.mentions.users.first();
            if (message.member.hasPermission("MANAGE_GUILD")){
                user.send(`**Você foi alertado(a) no servidor ${message.guild.name}:**\n` + msg.slice(2).join(" "));
            }
        }
        if (is_command("xp")){
            if (parseInt(user_ini.info.xp) > 0){
                message.channel.send(`**${message.author.username}**, você tem **${user_ini.info.xp}** xp.`);
            }else{
                message.channel.send(`**${message.author.username}**, você não tem xp.`);
            }
        }
    }catch(ex){
        console.log(ex);
    }
});

client.login(process.env.BOT_TOKEN);
