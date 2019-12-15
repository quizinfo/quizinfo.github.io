var d=document, q=e=>{
return d.querySelector(e);
}, _q=e=>{
return d.querySelectorAll(e);
}, l=(e, ev, c)=>{
return e.addEventListener(ev, (f)=>c(f));
}, wait=(t, f)=>{
return setTimeout(f, t);
}

window.timer=0;
var oflow=_q(".overflow")[1], acon=q(".alert-con"), atext=q(".alert-text");
var alert=(text)=>{
sld.classList.add("s-hidden");
sending=0;
oflow.classList.remove("ovflow-hid");
atext.innerHTML=text;
acon.classList.add("alerting");
wait(2000, ()=>{
acon.classList.remove("alerting");
wait(200, ()=>{
oflow.classList.add("ovflow-hid");
})
})
}

var screens=_q(".screen"), canstart=0;
var _uuid=()=>{
return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(
c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
}

var color=str=>{
var hash=0;
for(var i=0, len=str.length;i<len;i++){
hash=str.charCodeAt(i)+((hash<<5)-hash);
}
var cr='#';
for(var i=0;i<3;i++){
var value=(hash>>(i*8))&0xFF;
cr+=('00'+value.toString(16)).substr(-2);
}
return cr;
}

var key="bBPgpQ.VU20Uw:JEHRl0uaL8fYak9z";
var ably=new Ably.Realtime(key);
ably.connection.on('connected', function(){
quiz.start();
});

window.quiz={};
var ovflow=q(".overflow"), form=q("form"), inp=q("[name='name']");

var sending=0, uuid, sld=q(".s-loader");

quiz.start=()=>{

ovflow.classList.add("ovflow-hid");
inp.focus();

l(form, "submit", (e)=>{
e.preventDefault();
sld.classList.remove("s-hidden");
if(sending) return;
sending=1;
var value=inp.value;
if(value.length<1){
alert("Nume prea scurt");
return;
} else {

quiz.reg(value);

}
})

var err=ably.channels.get('errors');
var rounds=ably.channels.get('round');
var done=ably.channels.get("done");
var rems=ably.channels.get("rems");
rems.subscribe("data", quiz.rem);
done.subscribe("data", quiz.end);
err.subscribe("data", (data)=>{
quiz.error(data.data);
if(timer) clearTimeout(timer);
})
rounds.subscribe("data", (data)=>{
quiz.round(JSON.parse(data.data));
})

var start=ably.channels.get("start");
start.subscribe("data", (data)=>{
quiz._start();
})

var accepted=ably.channels.get("accept");
accepted.subscribe("data", (data)=>{
data=JSON.parse(data.data);
quiz.accept(data.uuid, data.name);
if(timer) clearTimeout(timer);
})
}

quiz.rem=data=>{
data=JSON.parse(data.data);
if(data.uuid==uuid){
alert("Ai fost eliminat definitiv din competitie");
localStorage.setItem("claws", 1);
wait(2000, ()=>location.reload());
}
}

quiz.reg=name=>{
uuid=_uuid();
var data={
name:name,
uuid:uuid,
}
var regs=ably.channels.get('regs');
regs.publish('data', JSON.stringify(data));
window.timer=wait(5000, ()=>{
alert("Quiz-ul nu a inceput inca sau a aparut o eroare de retea");
})
}

quiz.accept=(_uuid, name)=>{
if(_uuid==uuid){
if(timer) clearTimeout(timer);
screens[0].classList.remove("screen-active");
screens[1].classList.add("screen-active");
canstart=1;
quiz.color(name);
}
}

quiz.error=data=>{
data=JSON.parse(data);
if(data.uuid!=uuid) return;
sld.classList.add("s-hidden");
sending=0;
if(timer) clearTimeout(timer);

if(data.type==1) alert("Numele este deja folosit");
if(data.type==2){
screens[0].classList.remove("screen-active");
screens[2].classList.add("screen-active");
}
}

var cor=0;
quiz._start=()=>{
if(!canstart) return;
canstart=0;
q(".screen-active").classList.remove("screen-active");
screens[3].classList.add("screen-active");
}

var gl=q(".screen-game>.s-loader"), game=q(".game");
quiz.round=(data)=>{
if(dd) return;
q(".overflow").classList.add("ovflow-hid");
var con=document.createElement("div"), qu=document.createElement("span");
con.classList.add("round");
qu.classList.add("question");
qu.innerHTML=data.question;
con.appendChild(qu);
data.answers.forEach(e=>{
var ans=document.createElement("span");
ans.classList.add("answer");
ans.innerHTML="<span class='cbox unc'></span><span class='answer-text'>"+e+"</span>";
con.appendChild(ans);
});
gl.classList.add("s-hidden");
game.innerHTML="";
game.appendChild(con);
quiz.events(data.correct, data);
}

quiz.events=(correct, data)=>{
var ans=_q(".answer"), ansd=0;
ans.forEach((e, i)=>{
l(e, "click", ()=>{
if(ansd) return;
ansd=1;
if(i==correct){
cor++;
e.classList.add("ans-correct");
quiz.ans({uuid:uuid, c:1, va:i, data:null});
} else {
e.classList.add("ans-wrong");
quiz.ans({uuid:uuid, c:0, va:i, data:data});
}
})
})
}

var answers=ably.channels.get("answers");
quiz.ans=data=>{
_q(".crect").forEach(e=>e.remove());
q(".overflow").classList.remove("ovflow-hid");
answers.publish("data", JSON.stringify(data));
if(!data.data) return;
var crect=document.createElement("div");
crect.classList.add("crect");
crect.innerHTML="<span class='crect-label'>Raspuns corect</span><span class='crect-que'>"+data.data.question+"</span>"+
"<span class='crect-ans'>"+data.data.answers[data.data.correct]+"</span>";
q(".overflow").insertBefore(crect, q(".overflow").firstChild);
wait(200, ()=>{
crect.classList.add("crect-anim");
})
}

var dd=0;
quiz.end=()=>{
dd=1;
q(".overflow").classList.add("ovflow-hid");
q(".youd>span").innerHTML=cor;
q(".screen-active").classList.remove("screen-active");
screens[4].classList.add("screen-active");
q(".cline").style.width=100*cor/9+"%";
}

quiz.color=(name)=>{
var col=color(name);
document.documentElement.style.setProperty('--main', col);
}
