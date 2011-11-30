(function(a,b,c,d,e){function h(c){return this.options=c,a.extend(!0,this.options,{updateUser:function(a){f.options.currentUser=a,g&&(g.options.currentUser=a)},updateSubscriptions:function(a){f.subscriptions=a,g&&(g.subscriptions=a)}}),this.subscriptions=[],this.fayeClient=new Faye.Client(b.location.protocol+"//"+b.location.host+"/faye",{timeout:10}),this.critError=!1,this.lastMessages=[],f.init(this)}"use strict";var f={},g;f.auth={initLogin:function(){function c(b){f.options.updateUser(a.extend(!0,{},f.options.currentUser,b)),f.channel.userChannel(),a.fn.ufc().login.hide(),a.fn.ufc().user.highlightMe(),a.fn.ufc().user.filterIgnore(),a.fn.ufc().layers.hide(),a("#container").fadeTo("fast",1),a("#top #user #channel-list .count").text(a("#channel-list header .count").text())}a("#login").submit(function(){return a(this).find("input").hasClass("ui-state-error")?(a.jGrowl("Ошибка отправки, сообщение пустое.",{position:"bottom-right",header:"Ошибка"}),!1):(a.blockUI({message:"Авторизация...",css:{border:"none",background:"transparent",height:"25px","line-height":"25px",color:"#C4B1C4","font-size":"1.2em"},overlayCSS:{opacity:.4,backgroundColor:"#4A324A"}}),a.post("/user/login",{user:a("#login input").serializeObject(),channels:f.subscriptions}).success(function(b){if(b.error)return a.jGrowl(b.error,{header:"Ошибка"});c(b);try{yaCounter6276298.hit("/user/login")}catch(d){}}).error(function(){a.jGrowl("Ошибка отправки данных",{header:"Ошибка"})}).complete(function(){a.unblockUI()}),!1)}),e.init("display=window&fields=first_name,last_name,sex,email&callback=uLoginAction&redirect_uri=http%3A%2F%2F"+b.location.host+"/ulogin"),b.uLoginAction=function(b){a.post("/oauth",{token:b,channels:f.subscriptions}).success(function(b){if(b.error)return a.jGrowl(b.error,{header:"Ошибка"});c(b);try{yaCounter6276298.hit("/user/login/oauth")}catch(d){}}).error(function(){a.jGrowl("Ошибка отправки данных",{header:"Ошибка"})})}},initLogout:function(){a("body").on("click","#logout",function(){return a.post("/user/logout").success(function(){for(var a=0;a<f.subscriptions.length;a++)f.fayeClient.unsubscribe("/channel/"+f.subscriptions[a]),f.fayeClient.unsubscribe("/channel/"+f.subscriptions[a]+"/users");f.fayeClient.unsubscribe("/user/"+f.options.currentUser.id),f.fayeClient.unsubscribe("/channel-list");try{yaCounter6276298.hit("/user/logout",null,null,{user:f.options.currentUser.name})}catch(c){}b.location.reload()}).error(function(){a.jGrowl("Ошибка отправки данных",{header:"Ошибка"})}),!1})}},f.audio={sounds:{},init:function(){f.audio.sounds.incomingMessage=AudioFX("/sounds/incoming_message",{formats:["ogg","mp3"],volume:1}),f.audio.sounds.outgoingMessage=AudioFX("/sounds/outgoing_message",{formats:["ogg","mp3"],volume:1}),f.audio.sounds.mentionMessage=AudioFX("/sounds/mention_message",{formats:["ogg","mp3"],volume:1}),f.audio.sounds.popup=AudioFX("/sounds/popup",{formats:["ogg","mp3"]})},message:function(a,b){f.options.currentUser.id!="0"?f.options.currentUser.settings.audio.onMessage&&(f.options.currentUser.settings.audio.whenAway||f.options.currentUser.settings.audio.whenUnavailable?!f.options.currentUser.settings.audio.whenAway||f.options.currentUser.status!="A"&&f.options.currentUser.status!="U"?f.options.currentUser.settings.audio.whenUnavailable&&f.options.currentUser.status=="U"&&(a=="in"?f.audio.sounds.incomingMessage.play():f.audio.sounds.outgoingMessage.play()):a=="in"?f.audio.sounds.incomingMessage.play():f.audio.sounds.outgoingMessage.play():a=="in"?f.audio.sounds.incomingMessage.play():f.audio.sounds.outgoingMessage.play()):a=="in"?f.audio.sounds.incomingMessage.play():f.audio.sounds.outgoingMessage.play(),typeof b=="function"&&b()},mention:function(a){f.options.currentUser.id!="0"&&(f.options.currentUser.settings.audio.onMention||f.options.currentUser.settings.audio.onMessage)&&(f.options.currentUser.settings.audio.whenAway||f.options.currentUser.settings.audio.whenUnavailable?!f.options.currentUser.settings.audio.whenAway||f.options.currentUser.status!="A"&&f.options.currentUser.status!="U"?f.options.currentUser.settings.audio.whenUnavailable&&f.options.currentUser.status=="U"&&f.audio.sounds.mentionMessage.play():f.audio.sounds.mentionMessage.play():f.audio.sounds.mentionMessage.play()),typeof a=="function"&&a()},popup:function(a){f.options.currentUser.id!="0"&&f.audio.sounds.popup.play(),typeof a=="function"&&a()}},f.activity={init:function(){a.activity.init({interval:500,inactive:18e5,intervalFn:f.interval,inactiveFn:f.inactive}),a("body").on("mousemove",function(){a.activity.isActive()?a.activity.update():a.activity.reActivate()})},interval:function(a){if(f.options.currentUser.id=="0")return;a.diff>=6e6?!f.options.currentUser.overrideStatus&&f.options.currentUser.status!="A"&&f.status.change("away"):f.options.currentUser.status!="O"&&!f.options.currentUser.overrideStatus&&f.status.change("online")},inactive:function(){if(f.options.currentUser.id=="0")return;f.options.currentUser.status!="U"&&f.status.change("unavailable")}},f.channel={init:function(){f.channel.addExtensions(),a("#bottom form").submit(function(b){b.preventDefault();if(f.options.currentUser.id=="0")return a.jGrowl("Гости не могут отправлять сообщения, пожалуйста зарегистрируйтесь.",{position:"bottom-right",header:"Ошибка"}),!1;if(a("#container").css("opacity")=="0")return!1;a("#bottom").block({message:"Отправка...",css:{border:"none",background:"transparent",height:"25px","line-height":"25px",color:"#FFF","font-size":"1.2em"}});try{var c=a("#channels .current button.channel").attr("id"),d=c.substr(8,c.length),e=[];a("#"+c+"-content .sendto li").length>0&&a("#"+c+"-content .sendto li button.name").each(function(a,b){e[a]=b.innerHTML}),f.lastMessages.length>=10&&f.lastMessages.shift(),f.lastMessages.push(f.parsers.links(a("#message").val())),f.fayeClient.publish("/channel/"+d,{text:a("#message").val(),to:e}),yaCounter6276298.hit("/message/send",null,null,{user:f.options.currentUser.name})}catch(b){f.options.env=="development"&&console.log(b.stack)}return a("#message").val("").focus(),!1});var b=0,c=0;a("#bottom #message").keydown(function(d){if((new Date).getTime()-b>1e3&&(d.keyCode>=48&&d.keyCode<=90||d.keyCode>=96&&d.keyCode<=111||d.keyCode>=186&&d.keyCode<=222)){b=(new Date).getTime();var e=a("#channels .current button.channel").attr("id"),g=e.substr(8,e.length);a("#channels li button#channel-"+g).data("private")&&f.fayeClient.publish("/channel/"+g+"/private",{action:"type"})}if(d.keyCode==38||d.keyCode==40)d.keyCode==38?(c++,c>f.lastMessages.length&&(c=0)):d.keyCode==40&&(c--,c<0&&(c=f.lastMessages.length)),c==0?a("#bottom #message").val(""):f.lastMessages[c-1]&&a("#bottom #message").val(f.lastMessages[c-1])}),f.options.currentUser.id!="0"&&f.channel.userChannel()},subscribe:function(b,d,e,g){if(f.subscriptions.indexOf(d)>-1){a("#channels li button#channel-"+d).trigger("click");return}a.fn.ufc().tab.add(b,d,e,function(){a.blockUI({message:'Загрузка чата "'+b+'"',css:{border:"none",background:"transparent",height:"25px","line-height":"25px",color:"#C4B1C4","font-size":"1.2em"},overlayCSS:{opacity:.4,backgroundColor:"#4A324A"}});var h=!1,i,j=f.fayeClient.subscribe("/channel/"+d,function(b){if(f.options.currentUser.id!="0"&&f.options.currentUser.ignore.indexOf(b.name)>-1)return;a("#channel-"+d+"-content .scrollableArea").children().size()>=300&&a("#channel-"+d+"-content .scrollableArea div:first-child").remove(),a("#channel-"+d+"-content .scrollableArea .notifications").before(a.fn.ufc().message.format(b)),a("#channel-"+d+"-content .scrollableArea").prop({scrollTop:a("#channel-"+d+"-content .scrollableArea").prop("scrollHeight")});if(f.options.currentUser.id=="0")return;if(b.name==f.options.currentUser.name)return;var e=a("#channels .current button.channel").attr("id");if(!e)return;var g=e.substr(8,e.length),h=a("button#channel-"+d);if(g!=d||f.options.currentUser.status!="O"&&!f.options.currentUser.overrideStatus){var i=h.find("span.count");i.length>0?i.text(i.text().replace(/(?!\()\d+(?!\()/,parseInt(i.text().match(/(?!\()\d+(?!\()/))+1)):h.append('<span class="count">(1)</span>');var j=a(c).prop("title").match(/(?!\()\d+/);if(j!=null)try{a(c).prop("title",a(c).prop("title").replace(/(?!\()\d+/,(parseInt(j[0])+1).toString()))}catch(k){}else a(c).prop("title","(1) "+a(c).prop("title"));if(g==d)return;if(f.options.currentUser.settings["interface"].flashTabOnMessage||f.options.currentUser.settings["interface"].flashTabOnMention)h.stop(!0,!0).next().stop(!0,!0),f.options.currentUser.settings["interface"].flashTabOnMessage?b.to&&b.to.indexOf(f.options.currentUser.name)>=0?a.fn.ufc().tab.flash(d,"#344974"):a.fn.ufc().tab.flash(d,"#000000"):f.options.currentUser.settings["interface"].flashTabOnMention&&b.to&&b.to.indexOf(f.options.currentUser.name)>=0&&a.fn.ufc().tab.flash(d,"#344974")}});j.callback(function(){a.post("/channel/"+d+"/messages").success(function(b){if(b!="OK"){var c="";b.reverse().forEach(function(b){if(f.options.currentUser.id!="0"&&f.options.currentUser.ignore.indexOf(b.name)>-1)return;c+=a.fn.ufc().message.format(b)}),a("#channel-"+d+"-content .scrollableArea .notifications").before(c).attr({scrollTop:a("#channel-"+d+"-content .scrollableArea").attr("scrollHeight")})}i=f.fayeClient.subscribe("/channel/"+d+"/users",function(b){if(!h)return;switch(b.action){case"con":b.users.forEach(function(b){a.fn.ufc().user.connect(d,b)});break;case"dis":b.users.forEach(function(b){a.fn.ufc().user.disconnect(d,b)});break;case"update":b.user.gender&&a.fn.ufc().user.updateGender(d,b.user),b.user.status&&a.fn.ufc().user.updateStatus(d,b.user)}}),i.callback(function(){a.fn.ufc().sidebar.init("#channel-"+d+"-content",e),a.post("/channel/"+d+"/users").success(function(b){if(b.length>0&&b!="OK"){a("#channel-"+d+"-content .sidebar header span").html(b.length);for(var c=0,e="";c<b.length;c++)e+=a.fn.ufc().user.format(b[c]);a("#channel-"+d+"-content .sidebar ul").append(e),a.fn.ufc().user.highlightMe()}h=!0}).error(function(){a.jGrowl("Ошибка: невозможно получить список пользователей",{header:"Ошибка"})}).complete(function(){if(e["private"]){var b=f.fayeClient.subscribe("/channel/"+d+"/private",function(b){if(b.name==f.options.currentUser.name)return;a.fn.ufc().channel.type.update(b.name,d)});b.callback(function(){a.unblockUI(),a.fn.ufc().tab.height(d),f.subscriptions.push(d),f.options.updateSubscriptions(f.subscriptions),typeof g=="function"&&g()})}else a.unblockUI(),a.fn.ufc().tab.height(d),f.subscriptions.push(d),f.options.updateSubscriptions(f.subscriptions),typeof g=="function"&&g()})})}).error(function(){a.jGrowl("Ошибка: невозможно получить историю сообщений",{header:"Ошибка"})})})})},addExtensions:function(){f.fayeClient.addExtension({outgoing:function(a,b){if(f.critError)return;a.token=f.options.currentUser.id,a.data&&a.data.text&&(a.data.text=d.enc(a.data.text,f.options.serverKey+f.options.currentUser.id)),a.channel=="/meta/connect"&&(a.activeChannels=f.subscriptions),b(a)},incoming:function(c,e){if(f.critError)return;if(c.error){if(f.options.env=="production"){if(c.error.match(/^[\d]{3}:/)==null)switch(c.error){case"Ключ не верный":return a.jGrowl("Ошибка соединения, через 5 секунд страница будет обновлена",{header:"Критическая ошибка",life:5e3,close:function(){b.location.reload()},open:function(){f.critError=!0}});default:a.jGrowl(c.error,{header:"Ошибка"})}}else switch(c.error){case"Ключ не верный":return a.jGrowl("Ошибка соединения",{header:"Критическая ошибка",life:1e3,close:function(){b.location.reload()},open:function(){f.critError=!0}});default:a.jGrowl(c.error,{header:"Ошибка"})}a("#bottom").unblock()}if(c.data&&c.data.text)try{c.data.text=d.dec(c.data.text,f.options.serverKey)}catch(g){return a.jGrowl("Ошибка декодирования сообщения",{header:"Ошибка"})}try{e(c)}catch(g){return setTimeout(function(){a("#bottom").unblock()},1e3)}if(c.data&&c.data.text&&c.channel.match(/(?:^\/channel\/)([0-9a-z]+)$/)!=null)if(c.data.name==f.options.currentUser.name&&c.data.text==f.lastMessages[f.lastMessages.length-1])f.audio.message("out",function(){a("#bottom").unblock()});else if(f.options.currentUser.id!="0"){if(f.options.currentUser.ignore.indexOf(c.data.name)>-1)return;c.data.to&&c.data.to.length>0&&c.data.to.indexOf(f.options.currentUser.name)>-1?f.audio.mention(null):f.audio.message("in",null)}else f.audio.message("in",null)}})},userChannel:function(){f.fayeClient.subscribe("/user/"+f.options.currentUser.id,function(c){if(f.options.currentUser.ignore.indexOf(c.fromUser.name)>-1)return;switch(c.action){case"private.request":if(f.actions["private"].queue.indexOf(c.fromUser.name)>-1)return;f.actions["private"].queue.length==0?(a.fn.ufc().channel.qtips["private"](c.fromUser.name),f.options.currentUser.settings.audio.onPrivate?f.audio.popup(function(){f.actions.popup=!0,f.actions["private"].queue.push(c.fromUser.name),a(b).qtip("api").show()}):(f.actions.popup=!0,f.actions["private"].queue.push(c.fromUser.name),a(b).qtip("api").show())):f.actions["private"].queue.push(c.fromUser.name);break;case"private.no":a.jGrowl('Пользователь "'+c.fromUser.name+'" отказался от приглашения в приват',{header:"Уведомление"});break;case"private.yes":f.channel.subscribe(c.privateChannel.name,c.privateChannel.id,{"private":!0},function(){a.jGrowl('Пользователь "'+c.fromUser.name+'" принял ваше приглашение в приват',{header:"Уведомление"})});break;case"private.reopen":f.channel.subscribe(c.privateChannel.name,c.privateChannel.id,{"private":!0},function(){a.jGrowl('Пользователь "'+c.fromUser.name+'" вернулся в приват',{header:"Уведомление"})});break;case"re-entry":return a.jGrowl("Попытка повторного входа",{header:"Уведомление"})}})},list:function(){f.fayeClient.subscribe("/channel-list",function(b){switch(b.action){case"rem":break;case"add":break;case"upd":b.channels.forEach(function(b){var c=a("#channel-list menu button").filter(function(){return a(this).data("id")==b.id}).find(".count");c.html(b.count.toString())})}}).callback(function(){(a.jStorage.get("channel-list")||a.jStorage.get("channel-list")==null)&&a.fn.ufc().channels.showChannelList(!1),a("#channel-list").block({message:"Загрузка...",css:{border:"none",background:"transparent",height:"25px","line-height":"25px",color:"#C4B1C4","font-size":"1.2em"},overlayCSS:{opacity:.2,backgroundColor:"#000"}}),a.post("/channel/list").success(function(b){if(b.length>0&&b!="OK"){a("#top #user #channel-list .count").html(b.length),a("#channel-list header .count").html(b.length);for(var c=0,d="";c<b.length;c++)d+=a.fn.ufc().channel.format(b[c]);a("#channel-list menu").append(d)}}).error(function(){a.jGrowl("Невозможно получить список комнат",{header:"Ошибка"})}).complete(function(){a("#channel-list").unblock()})}),a.fn.ufc().channels.init(),a("#channel-list").on("click","button",function(){f.channel.subscribe(a(this).find("span.name").text(),a(this).data("id"),{"private":!1})})}},f.helpers={browserCheck:function(){return a.browser.name=="firefox"&&a.browser.versionNumber>=4||a.browser.name=="msie"&&a.browser.versionNumber>=9||a.browser.name=="chrome"&&a.browser.versionNumber>=10||a.browser.name=="opera"&&a.browser.versionNumber>=9.8||a.browser.name=="safari"&&a.browser.versionNumber>=5}},f.parsers={links:function(a){return a.replace(/((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/,'<a href="$1" class="userLink" target="_blank">$1</a>')}},h.prototype.channel={notify:function(b,c,d){if(f.options.currentUser.id!="0"&&!f.options.currentUser.settings["interface"].chatNotifications)return;if(f.options.currentUser.id!="0"&&(c.name==f.options.currentUser.name||f.options.currentUser.ignore.indexOf(c.name)>-1))return;a("#channel-"+b+"-content .scrollableArea").children().size()>=300&&a("#channel-"+b+"-content .scrollableArea div:first-child").remove(),a("#channel-"+b+"-content .scrollableArea .notifications").before("<div class='message cleafix'><time>["+f.time.format(new Date)+"]</time>"+'<button class="name">$</button>:'+"<p>"+d+"</p>"+"</div>"),a("#channel-"+b+"-content .scrollableArea").prop({scrollTop:a("#channel-"+b+"-content .scrollableArea").prop("scrollHeight")})}},h.prototype.actions={"private":{popup:!1,queue:[],overlay:{message:"Пожалуйста подождите...",css:{border:"none",background:"transparent",height:"25px","line-height":"25px",color:"#fff","font-size":"1.2em"},overlayCSS:{opacity:.6,backgroundColor:"#333366"}},request:function(b,c){a(".qtip").qtip("api").hide();if(c=="F"){a.jGrowl('Пользователь "'+b+'" сейчас отключен',{header:"Ошибка"});return}a.post("/user/private",{toUser:b,action:"request"}).success(function(b){if(b.error)return a.jGrowl(b.error,{header:"Ошибка"});b.id&&b.name?f.channel.subscribe(b.name,b.id,{"private":!0},null):a.jGrowl("Запрос на приват отправлен, если пользователь согласится откроется новый приватный чат",{header:"Уведомление"})}).error(function(){a.jGrowl("Ошибка при отправке запроса",{header:"Ошибка"})})},yes:function(c){a("div.qtip").block(f.actions["private"].overlay),a.post("/user/private",{toUser:c,action:"yes"}).success(function(b){if(b.error)return a.jGrowl(b.error,{header:"Ошибка"});f.channel.subscribe(b.name,b.id,{"private":!0},null)}).error(function(){a.jGrowl("Ошибка при передачи данных",{header:"Ошибка"})}).complete(function(){a("div.qtip").unblock(),a(b).qtip("api").hide(),f.actions.popup=!1,f.actions["private"].queue.shift(),f.actions["private"].queue.length>0&&(a.fn.ufc().channel.qtips["private"](f.actions["private"].queue[0]),f.actions.popup=!0,a(b).qtip("api").show())})},no:function(c){a("div.qtip").block(f.actions["private"].overlay),a.post("/user/private",{toUser:c,action:"no"}).success(function(b){if(b.error)return a.jGrowl(b.error,{header:"Ошибка"})}).error(function(){a.jGrowl("Ошибка при передачи данных",{header:"Ошибка"})}).complete(function(){a("div.qtip").unblock(),a(b).qtip("api").hide(),f.actions.popup=!1,f.actions["private"].queue.shift(),f.actions["private"].queue.length>0&&(a.fn.ufc().channel.qtips["private"](f.actions["private"].queue[0]),f.actions.popup=!0,a(b).qtip("api").show())})}},ignore:function(b,c){a(".qtip").qtip("api").hide(),a.post("/user/ignore",{toUser:b,action:c}).success(function(b){if(b.constructor!=Array)return a.jGrowl("Ошибка получения списка игнорируемых пользователей",{header:"Ошибка"});f.options.updateUser(a.extend({},f.options.currentUser,{ignore:b})),c=="add"?a.jGrowl("Пользователь добавлен в список игнорируемых",{header:"Уведомление"}):c=="remove"&&a.jGrowl("Пользователь удален из списка игнорируемых",{header:"Уведомление"}),a.fn.ufc().user.filterIgnore()}).error(function(){a.jGrowl("Ошибка при передачи данных",{header:"Ошибка"})})}},h.prototype.status={change:function(b){a.post("/user/status",{status:f.status.toLiteral(b)}).success(function(c){if(c.error)return a.jGrowl(c.error,{header:"Ошибка"});b=="online"&&a.fn.ufc().tab.unreadCounter(a("#channels .current button.channel"))}).error(function(){a.jGrowl("Ошибка отправки данных",{header:"Ошибка"})})},toString:function(a){switch(a){case"O":return"online";case"F":return"offline";case"A":return"away";case"U":return"unavailable"}return!1},toStringDisplay:function(a){switch(a){case"O":return"В сети";case"F":return"Отключен";case"A":return"Отошел";case"U":return"Недоступен"}return!1},toLiteral:function(a){switch(a){case"online":return"O";case"offline":return"F";case"away":return"A";case"unavailable":return"U"}return!1}},h.prototype.gender={toStringDisplay:function(a){return a!="N"?a=="M"?"Мужской":"Женский":"Не задан"}},h.prototype.time={zero:function(a){return["00","0",""][a.toString().length]+a.toString()},format:function(a){return f.time.zero(a.getHours())+":"+f.time.zero(a.getMinutes())+":"+f.time.zero(a.getSeconds())},date:function(a){return f.time.zero(a.getDate())+"."+f.time.zero(a.getMonth()+1)+"."+a.getFullYear()},parse:function(a){var b=new Date(a.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,"$1/$2/$3 $4:$5:$6").split(".")[0]);return new Date(b.setHours(b.getHours()+(new Date).getTimezoneOffset()/60*-1))}},f.init=function(b){return a.extend(!0,f,b),f.helpers.browserCheck()?(f.auth.initLogin(),f.auth.initLogout(),f.audio.init(),f.activity.init(),f.channel.init(),f.channel.subscribe(f.options.channels.main.name,f.options.channels.main.id,{"private":!1},function(){f.options.channels.req?f.channel.subscribe(f.options.channels.req.name,f.options.channels.req.id,{"private":!1},function(){f.channel.list()}):f.channel.list();if(!f.options.errors)return b;f.options.errors.oauth&&a.jGrowl(f.options.errors.oauth,{header:"Ошибка"})}),b):alert("Внимание: ваш браузер устарел, для работы чата обновите его.")},a.fn.sys=function(a,b,c,d,e){return g?g:g=new h({currentUser:a,channels:b,serverKey:c,env:d,errors:e||null})}})(jQuery,window,document,GibberishAES,uLogin)
