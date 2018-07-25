const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const config = require("./config.json");

const name = config.name;
const token = config.token;
const prefix = config.prefix;

switch(config.vipReaction){
  case "baguette": vipReaction = "🥖"; break;
  case "rofl": vipReaction = "🤣"; break;
  case "frankreich": vipReaction = "🇫🇷"; break;
  case "poop": vipReaction = "💩"; break;
  case "herz": vipReaction = "❤️"; break;
  default: vipReaction = "👍";
}
client.on('ready', () => {
  console.log('Ready to play '+name+' stuff!');
});

// Create an event listener for messages
client.on('message', message => {
  if(message.author.id == config.vip){ //console.log("MARKUS YAY")
    message.react(vipReaction).then(() => {
                //console.log("Reacted to message")
            }).catch(reason => {
                //console.log(`Problem while reacting to message: ${reason}`);
            });
      }
  if(message.content.startsWith(prefix+name)){

        parseMessage(message);

       //console.log("Already playing");
    }
  });


client.on("disconnect", closeevent => {
        logger.log(client.shard, "Disconnected with code " + closeevent.code + " (" + closeevent.reason + ")!");

        // 4005 == already authenticated
        // 4004 == authentication failed
        if (closeevent.code == 4005 ||
            closeevent.code == 4004) {
            return;
        }

        logger.log(client.shard, "Reconnecting!");
        client.destroy().then(() => client.login(token))
      });
client.login(token)



function parseMessage(message){

    var content = message.content.toLowerCase();
    var textChannel = message.channel;
    var guild = message.guild;
    var author = message.author;

    //console.log("Message received: "+message);

    if (textChannel.type != "text") {
        textChannel.send("Server only, sorry bruv.");
        return;
    }
    if(message.content.startsWith(prefix+name)){

      //var arguments = message.content.
      var options = new Object();
     // default, will be overwritten by argument if needed
     options.voiceChannel = message.member.voiceChannel;
     options.play = true;
     options.loop = true;
     var arguments = message.content.trim().replace(prefix+name,"").trim();
     //console.log("ARgument:"+arguments)
     arguments = arguments.toLowerCase();
     if(arguments=="") options.file = getRandomAudio();
     else if(arguments=="leave"){
       options.voiceChannel.leave();
       options.play = false;
     }
     else if (arguments == "mama"|| arguments =="help"){
       const embed = {
                    "color": 16000000,
                    author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                  },
                    "image": {
                      "url": config.helpPicture
                    },
                    "fields": [
                        {
                          "name": "MAMA WIE GEHT DAS?",
                          "value": "Du tippst "+prefix+name+" und fertig ..."
                        },
                        {
                        "name": "ABER WAS WENN ICH EINEN BESTIMMTEN CLIP HÖREN MÖCHTE?",
                        "value":"Dann machste einfach "+prefix+name+" [Nummer des Clips]"
                        },
                        {
                        "name": "WIE WEIß ICH WELCHER CLIP ZU WELCHER ZAHL GEHÖRT?",
                        "value": getAllAudio()
                        },
                        {
                        "name": "MAMA ES GEHT NICHT",
                        "value": "Frag Tim -> baguette ron#4984"
                        },
                        {
                          "name": name+" <3",
                        "value": "Nicht zu ernst nehmen bitte."
                      }

                    ]
                    };

                textChannel.send({ embed });
       options.play = false;
     }
     else if(!isNaN(arguments)){
        options.file = getAudio(Number(arguments));
        if(options.file=="./audio/undefined"){
          textChannel.send("Clip nicht vorhanden :()");
          options.play = false;
        }
      }
     else{
        textChannel.send("wtf willst du von mir???");
        options.play = false;
      }
     //console.log(options.file);
     if (options.play) {

          if (options.voiceChannel) {
              playAudio(options.voiceChannel, options.file, textChannel);
          } else {
              textChannel.send("Bist nicht in nem Voicechannel du kek.");
          }
      }
  }

}
function getRandomAudio(){
   var files = fs.readdirSync("./audio/");
   var index = Math.floor(Math.random() * (files.length));

   return "./audio/" + files[index];
}
function getAudio(i){
  var files = fs.readdirSync("./audio/");
  return "./audio/"+files[i-1];
}
function playAudio(voiceChannel, file, textChannel) {

    // check for permissions first
    if (!voiceChannel.permissionsFor(client.user.id).has("CONNECT")) {
        textChannel.send("ICH KOMM DA NICHT REIN DU WICHSER")
        return;
    };
    if (!voiceChannel.permissionsFor(client.user.id).has("SPEAK")) {
        textChannel.send("DA DARF ICH NICHT REDEN DU SPAST")
        return;
    };

    voiceChannel.join().then(connection => {

        connection.playFile(file).on("end", () => {
            connection.disconnect();
            voiceChannel.leave();
        });

    }).catch(error => {
        textChannel.send(error.toString());
    });
}
function getAllAudio(){
  var files = fs.readdirSync("./audio/");
  var s = "";
  for(var i = 1;i<=files.length;i++){
    var t = (i+"." + files[i-1]+"\n").replace(".WMV","");
    t = t.replace(/_/g, ' ');
    s+=t;
  }
  return s;
}
