/* ============ Adelcare SPA ============ */
const App = (() => {
  const state = { user: null, route: "dashboard", params: {}, sidebarOpen: false, doctorsSearch: "", globalSearch: "", dashScroll: 0 };

  /* ── Notification system ── */
  let _notifs = [];          // {id,type,msg,sub,time,read}
  let _notifOpen = false;
  let _prevPresent = null;   // Set of doctor ids known to be present
  let _notifSeen = new Set();// ids of already-triggered one-time notifs
  let _notifInterval = null;
  let _notifDateKey = "";    // tracks date to reset daily notifs
  let _notifFadeTimer = null;// مؤقّت واحد لتلاشي تمييز "غير مقروء" — لا حلقة تكرار

  // دوال الوقت — ثابتة على توقيت الرياض UTC+3
  function _riyadhNow(){return new Date(Date.now()+3*3600000);}
  function _todayStr(){const d=_riyadhNow(),p=x=>String(x).padStart(2,'0');return`${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())}`;}
  function _tomorrowStr(){const d=_riyadhNow();d.setUTCDate(d.getUTCDate()+1);const p=x=>String(x).padStart(2,'0');return`${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())}`;}
  function _timeLabel(){const d=_riyadhNow(),p=x=>String(x).padStart(2,'0');return`${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;}

  const _NOTIF_ICONS={
    arrived:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="9 11 12 14 15 11" transform="translate(0 2)"/></svg>`,
    departed:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,
    leave:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    "leave-end":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>`
  };

  function _relTime(timeStr){
    if(!timeStr) return "";
    const [h,m]=timeStr.split(":").map(Number);
    const rn=_riyadhNow(), nowMin=rn.getUTCHours()*60+rn.getUTCMinutes();
    const tMin=h*60+m, diff=nowMin-tMin;
    if(diff<1) return "الآن";
    if(diff<60) return `منذ ${diff} د`;
    const hr=Math.floor(diff/60);
    return hr===1?"منذ ساعة":`منذ ${hr} س`;
  }

  function _pushNotif(id,type,msg,sub){
    if(_notifSeen.has(id)) return;
    _notifSeen.add(id);
    _notifs.unshift({id,type,msg,sub,time:_timeLabel(),read:false});
    if(_notifs.length>50) _notifs=_notifs.slice(0,50);
    _renderBell(true);
    if(typeof Notification!=="undefined"&&Notification.permission==="granted"){
      try{ new Notification("عادل الطبية — "+msg,{body:sub,icon:"/favicon.ico",dir:"rtl"}); }catch(e){}
    }
  }

  // تحديث الشارة وحدها — عملية رخيصة لا تلمس اللوحة، آمنة الاستدعاء بأي وقت
  function _updateBadge(){
    const wrap=document.getElementById("notif-wrap"); if(!wrap) return;
    const badge=wrap.querySelector(".notif-badge");
    if(!badge) return;
    const unread=_notifs.filter(n=>!n.read).length;
    badge.textContent=unread>0?unread:""; badge.style.display=unread>0?"flex":"none";
  }

  function _renderBell(ring=false){
    const wrap=document.getElementById("notif-wrap"); if(!wrap) return;
    _updateBadge();
    if(ring){
      const btn=wrap.querySelector(".notif-btn");
      if(btn){
        btn.classList.remove("ringing");
        void btn.offsetWidth; // reflow لإعادة تشغيل الحركة — يحدث فقط عند وصول إشعار فعلي (نادر)
        btn.classList.add("ringing");
        setTimeout(()=>btn.classList.remove("ringing"),700);
      }
    }
    // إشعار جديد وصل واللوحة مفتوحة ⇒ أظهره فوراً. نداء واحد غير متكرر.
    if(_notifOpen) _renderPanel();
  }

  function _renderPanel(){
    let panel=document.getElementById("notif-panel");
    if(!panel){
      panel=document.createElement("div");
      panel.id="notif-panel"; panel.className="notif-panel";
      document.body.appendChild(panel);
    }
    const unread=_notifs.filter(n=>!n.read).length;
    const itemsHTML=_notifs.length?_notifs.map(n=>`
      <div class="notif-item${n.read?"":" unread"}">
        <div class="notif-ico ${n.type}">${_NOTIF_ICONS[n.type]||""}</div>
        <div class="notif-body">
          <div class="notif-msg">${n.msg}</div>
          ${n.sub?`<div class="notif-sub">${n.sub}</div>`:""}
          <div class="notif-time">${_relTime(n.time)} · ${n.time}</div>
        </div>
      </div>`).join(""):`<div class="notif-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="12" y1="2" x2="12" y2="1"/></svg>
        <span>لا توجد إشعارات</span>
      </div>`;
    panel.innerHTML=`<div class="notif-head">
      <span class="notif-head-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        الإشعارات
        ${unread>0?`<span class="notif-badge" style="position:static;margin-inline-start:2px">${unread}</span>`:""}
      </span>
      ${_notifs.length?`<button class="notif-clear" id="notif-clr">مسح الكل</button>`:""}
    </div>
    <div class="notif-list">${itemsHTML}</div>
    ${_notifs.length?`<div class="notif-footer">آخر تحديث: ${_timeLabel()}</div>`:""}`;
    panel.querySelector("#notif-clr")?.addEventListener("click",()=>{
      clearTimeout(_notifFadeTimer);
      _notifs=[];_notifSeen=new Set();_notifOpen=false;panel.remove();_updateBadge();
    });
    // نفس سلوك السابق تماماً: تُعلَّم كمقروءة فور الفتح — لكن بلا إعادة بناء متكررة.
    _notifs.forEach(n=>n.read=true);
    _updateBadge();
    // تمييز "غير مقروء" يتلاشى بسلاسة بعد لحظة قصيرة (تبديل صنف + انتقال CSS)
    // بدل اختفاء مفاجئ أو إعادة بناء اللوحة بالكامل — نداء واحد محدود لا حلقة.
    clearTimeout(_notifFadeTimer);
    if(unread>0){
      _notifFadeTimer=setTimeout(()=>{
        if(!document.body.contains(panel)) return;
        panel.querySelectorAll(".notif-item.unread").forEach(el=>el.classList.remove("unread"));
      }, 900);
    }
  }

  function _closePanel(){
    _notifOpen=false;
    clearTimeout(_notifFadeTimer);
    const p=document.getElementById("notif-panel");
    if(!p || p.classList.contains("closing")) return;
    p.classList.add("closing");
    const done=()=>{ if(p.parentNode) p.remove(); };
    p.addEventListener("animationend", done, {once:true});
    setTimeout(done, 200); // شبكة أمان لو لم يُطلَق الحدث (تبويب غير مرئي مثلاً)
  }

  // أول يوم عمل فعلي بعد نهاية الإجازة — يتخطى الإجازات الأسبوعية والإجازات المتداخلة
  function _nextWorkDay(endDateStr, workDays, docLeaves){
    if(!workDays||!workDays.length||!endDateStr) return null; // لا جدول معروف
    const covered=(ds)=>(docLeaves||[]).some(l=>!l.synthetic&&l.start_date<=ds&&l.end_date>=ds);
    const p=endDateStr.split("-").map(Number);
    const dt=new Date(Date.UTC(p[0],p[1]-1,p[2]));
    const pad=x=>String(x).padStart(2,'0');
    for(let i=1;i<=21;i++){
      dt.setUTCDate(dt.getUTCDate()+1);
      const dow=dt.getUTCDay();
      const ds=`${dt.getUTCFullYear()}-${pad(dt.getUTCMonth()+1)}-${pad(dt.getUTCDate())}`;
      if(workDays.includes(dow)&&!covered(ds)) return {dow,ds,offset:i};
    }
    return null;
  }
  // صياغة "يعاود العمل" — دائماً باسم اليوم صراحةً (بلا غداً/بعد غد)
  function _returnPhrase(nx){
    if(!nx) return "";
    return `يعاود العمل يوم ${DAYS[nx.dow]}`;
  }

  async function checkNotifications(){
    const dk=_todayStr();
    if(dk!==_notifDateKey){ _notifDateKey=dk; _notifSeen=new Set([]); }
    try{
      const leavesRes = await api("/leaves");
      const today=_todayStr(), tomorrow=_tomorrowStr();
      const leaves=leavesRes.leaves||[];
      const _docLeaves=(id)=>leaves.filter(x=>x.doctor_id===id);
      // ── Leaves ending today — مع حساب أول يوم عمل فعلي ──
      leaves.filter(l=>!l.synthetic&&l.end_date===today).forEach(l=>{
        const nx=_nextWorkDay(l.end_date,l.work_days,_docLeaves(l.doctor_id));
        const isSec=l.type==="ندب";
        const verb=isSec?"يعود من الندب":"";
        const back=_returnPhrase(nx);
        const subParts=[verb,back].filter(Boolean).join(" — ");
        const sub=[subParts,l.branch_name].filter(Boolean).join(" · ");
        _pushNotif(`leave-end-${l.id}-${today}`,"leave-end",
          `تنتهي ${isSec?"ندب":"إجازة"} ${l.doctor_name} اليوم`,sub);
      });
      // ── Leaves ending tomorrow ──
      leaves.filter(l=>!l.synthetic&&l.end_date===tomorrow).forEach(l=>{
        const nx=_nextWorkDay(l.end_date,l.work_days,_docLeaves(l.doctor_id));
        const back=_returnPhrase(nx);
        const sub=[back,l.branch_name].filter(Boolean).join(" · ");
        _pushNotif(`leave-tmrw-${l.id}-${today}`,"leave",
          `تنتهي ${l.type==="ندب"?"ندب":"إجازة"} ${l.doctor_name} غداً`,sub);
      });
    }catch(e){}
  }

  function startNotifPolling(){
    if(_notifInterval) clearInterval(_notifInterval);
    checkNotifications();
    _notifInterval=setInterval(checkNotifications,60000);
    if(typeof Notification!=="undefined"&&Notification.permission==="default"){
      setTimeout(()=>Notification.requestPermission(),3000);
    }
  }

  const DAYS = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  // week starts on Saturday (Saudi). Display order of JS getDay() indices:
  const WEEK_ORDER = [6,0,1,2,3,4,5];   // السبت، الأحد، ... الجمعة
  const colOf = (jsDay)=>(jsDay+1)%7;   // calendar column for a getDay() value
  const DEPT_ORDER = ["طب عام","باطنة","صدرية","أطفال","نساء وولادة","جلدية","عظام",
    "أنف وأذن وحنجرة","عيون","مسالك بولية","جراحة","أسنان","علاج طبيعي","المختبر","الأشعة"];
  const deptRank = (s)=>{ const i=DEPT_ORDER.indexOf(s); return i<0?999:i; };
  // availability priority: present -> upcoming(soonest) -> finished -> off -> leave
  const STATE_PRIORITY = {in_visit:0, present:1, upcoming:2, finished:3, off:4, secondment:5, leave:5, terminated:6, archived:7};
  function availSort(a,b){
    const pa=STATE_PRIORITY[a.live.state]??9, pb=STATE_PRIORITY[b.live.state]??9;
    if(pa!==pb) return pa-pb;
    if(a.live.state==="upcoming") return (a.live.next_start??9999)-(b.live.next_start??9999) || a.name.localeCompare(b.name);
    if(a.live.state==="present") return (b.live.shift_end??0)-(a.live.shift_end??0) || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  }
  const normAr = s=>(s||"").trim().replace(/[ً-ٰٟـ]/g,"")
    .replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").toLowerCase();

  // ── البحث الموحّد — نفس محرك SmartSearch المستخدم في البحث الرئيسي ──
  function scoreDoctorMgmt(q,d,bname){
    if(!q) return 1;
    return SmartSearch.score(q,{
      name:d.name, en_name:d.en_name||d.name_en||"",
      specialty:d.specialty,
      branch:(bname&&bname[d.branch_id])||d.branch_name||"",
      nationality:d.nationality,
      status:SmartSearch.statusText(d.live),
      rank:d.rank, qualification:d.qualification, gender:d.gender,
      experience:d.experience, hours:d.hours_raw, cases:d.cases,
      coord:d.notes_coord, languages:d.languages, id:d.id
    });
  }
  // ─────────────────────────────────────────────────────────────────────────

  const $ = (s, r=document) => r.querySelector(s);
  const el = (h) => { const d=document.createElement("div"); d.innerHTML=h.trim(); return d.firstElementChild; };
  const esc = (s) => (s==null?"":String(s)).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  // ---------- API ----------
  async function api(path, opts={}) {
    try {
      return await LocalDB.call(path, opts);
    } catch(e) {
      if (e.isAuth && state.user) { state.user=null; render(); }
      throw e;
    }
  }
  const PERMS_META = [
    {key:"schedule_edit",label:"تعديل الممارس من بطاقته فقط (بدون صفحة الإدارة)"},
    {key:"doctor_add",label:"إضافة ممارس جديد"},
    {key:"doctor_edit",label:"تعديل بيانات الممارسين (مع صفحة الإدارة)"},
    {key:"doctor_delete",label:"حذف / أرشفة الممارسين"},
    {key:"status_manage",label:"إدارة حالة الممارس: إجازات/ندب/إنهاء عقد (من البطاقة فقط)"},
    {key:"visit_manage",label:"تفعيل/إلغاء حالة الزيارة (زر الزيارة في البطاقة فقط)"},
    {key:"leave_manage",label:"إدارة الإجازات (مع صفحة الإدارة)"},
    {key:"branch_manage",label:"إدارة الفروع"},
    {key:"specialty_manage",label:"إدارة الأقسام"},
    {key:"settings_access",label:"الوصول للإعدادات"},
    {key:"users_manage",label:"إدارة المستخدمين"},
    {key:"audit_view",label:"عرض سجل العمليات"},
  ];
  const hasPerm = (u, perm) => { if(!u||!u.auth) return false; const p=u.permissions||[]; return p.includes("*")||p.includes(perm); };
  const can = (perm) => hasPerm(state.user, perm);
  const canBranch = (bid) => { if(!state.user||!state.user.auth) return false; const b=state.user.branches||[]; return b.includes("*")||b.includes(bid)||b.includes(String(bid)); };
  const canSpecialty = (spec) => { if(!spec||!state.user||!state.user.auth) return true; const sp=state.user.specialties||[]; return sp.includes("*")||sp.includes(spec); };

  // ---------- Toast ----------
  function toast(msg,type="",ms){
    const cls=type==="ok"?" toast-ok":type==="err"?" toast-err":type==="warn"?" toast-warn":type==="info"?" toast-info":"";
    const t=el(`<div class="toast${cls}">${esc(msg)}</div>`);
    $("#toast-root").appendChild(t);
    const dur=ms||(type==="err"?3500:2400);
    setTimeout(()=>{t.classList.add("toast-out");t.addEventListener("animationend",()=>t.remove());},dur);
  }

  // ---------- Theme ----------
  function initTheme(){ const t=localStorage.getItem("theme")||"light";
    document.documentElement.setAttribute("data-theme",t); }
  function toggleTheme(){ const c=document.documentElement.getAttribute("data-theme");
    const n=c==="dark"?"light":"dark"; document.documentElement.setAttribute("data-theme",n);
    localStorage.setItem("theme",n); const b=$("#theme-ico"); if(b)b.textContent=n==="dark"?"☀️":"🌙"; }

  // ---------- helpers ----------
  const initials = (n)=> (n||"؟").replace(/^د\.?\s*/,"").trim().slice(0,2);
  const avatar = (d)=> d.photo ? `<div class="avatar"><img src="${esc(d.photo)}"></div>`
      : `<div class="avatar">${esc(initials(d.name))}</div>`;
  const STATE_CLS = {present:"present",upcoming:"upcoming",finished:"finished",leave:"leave",off:"off",archived:"off",in_visit:"in-visit",terminated:"terminated",secondment:"secondment"};
  function statusPill(live){ const s=live.state;
    // عند الزيارة: تظهر شارة «زيارة» فقط بدل «متواجد الآن» (لوضوح الاسم) —
    // دون التأثير على العدّادات التي تعتمد على live.state / live.in_visit
    if(live.in_visit)
      return `<span class="status-pill sp-in-visit"><span class="dot" style="background:currentColor"></span>🏠 في زيارة الآن</span>`;
    if(!live.label) return ""; // بلا شارة (عرض يوم آخر: أوقات الدوام تكفي)
    return `<span class="status-pill sp-${STATE_CLS[s]}"><span class="dot" style="background:currentColor"></span>${esc(live.label)}</span>`; }

  // دوام يوم معيّن (أو اليوم الحالي إن لم يُحدَّد)
  function todayShift(d, dayIdx){
    if(!d.schedule) return "";
    const day=(dayIdx===undefined||dayIdx===null||dayIdx<0)?_riyadhNow().getUTCDay():dayIdx;
    const sh=d.schedule[day]||d.schedule[String(day)];
    if(!sh||!sh.length) return "";
    return sh.map(([s,e])=>fmtRange(s,e)).join(" ، ");
  }
  // viewDay اختياري: عند تمريره تُعرض ورديات ذلك اليوم مع بقاء كل الشارات كما هي
  function doctorCard(d, viewDay){
    const live=d.live||{state:"off",label:""};
    const isLeave=live.state==="leave";
    const isTerminated=live.state==="terminated";
    const isSecondment=!!live.isSecondment;
    const meta=[d.rank&&d.rank!==d.specialty?d.rank:null, d.nationality, d.experience?fmtExp(d.experience):null]
      .filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('<span class="shift-sep">·</span>');
    let shift=(isLeave||isTerminated)?"":todayShift(d, viewDay);
    // العرض الحي (viewDay غير مُمرَّر): إن كانت الحالة "موجود الآن" بسبب
    // امتداد دوام الأمس بعد منتصف الليل، فجدول اليوم الحالي فارغ ولن
    // يُعيد todayShift شيئاً — نعرض مدى الوردية الممتدة بدل تركه فارغاً.
    if(!shift && !isLeave && !isTerminated && viewDay===undefined &&
       live.state==="present" && live.disp_start!=null && live.disp_end!=null){
      shift=fmtRange(live.disp_start, live.disp_end);
    }
    // ملاحظة: إنهاء العقد المجدول لا يظهر على البطاقة الخارجية — يُرى فقط داخل تفاصيل البطاقة (quickCard)، كالإجازات القادمة
    const infoRow=isTerminated
      ?`<div class="dcard-shift" style="color:#475569">⛔ منتهي العقد${d.terminated_date?` · ${esc(d.terminated_date)}`:""}  </div>`
      :isSecondment
        ?(shift
          ?`<div class="dcard-shift">${shift.split(" ، ").map(s=>`<span class="shift-seg">🕐 ${esc(s)}</span>`).join('<span class="shift-sep"> · </span>')}</div>`
          :"")
        +`<div class="dcard-shift" style="color:#0e7490;font-size:12px;margin-top:2px">🔀 منتدب إلى: ${esc(live.secondmentBranchName||"")}${live.secondmentShiftLabel?` — ${esc(live.secondmentShiftLabel)}`:""}</div>`
      :shift
        ?`<div class="dcard-shift">${shift.split(" ، ").map(s=>`<span class="shift-seg">🕐 ${esc(s)}</span>`).join('<span class="shift-sep"> · </span>')}</div>`
        :isLeave
          ?`<div class="dcard-shift dcard-leave-info"><span>🔴 ${esc(live.leaveType||"إجازة")}${live.leave&&live.leave.end_date?` · حتى ${esc(fmtDate(live.leave.end_date))}`:""}  </span></div>`
          :"";
    const branchRow=d.branch_name?`<div class="dcard-meta" style="margin-top:3px"><span>🏥 ${esc(d.branch_name)}</span></div>`:"";
    return `<div class="dcard st-${live.in_visit?"in-visit":(isSecondment?"secondment":(STATE_CLS[live.state]||"off"))}" data-doc="${d.id}">
      ${avatar(d)}
      <div class="dcard-body">
        <div class="dcard-top">
          <div class="dcard-name">${esc(d.name)}</div>
          ${statusPill(live)}
        </div>
        <div class="dcard-meta"><span class="spec-tag">${esc(d.specialty||"")}</span>${meta}</div>
        ${infoRow}
        ${branchRow}
      </div></div>`;
  }
  function bindCards(root){ root.querySelectorAll("[data-doc]").forEach(c=>
    c.addEventListener("click",()=>quickCard(c.dataset.doc).catch(e=>toast(e.message||"خطأ","err")))); }

  // ---------- Quick doctor card (modal) ----------
  // تعديل موعد إنهاء العقد المجدول — مثل تعديل الإجازة القادمة
  function editSchedTerm(d){
    const cur=d.termination_scheduled||(d.live&&d.live.termSched)||"";
    const _n=_riyadhNow(),_p=x=>String(x).padStart(2,'0');
    const today=`${_n.getUTCFullYear()}-${_p(_n.getUTCMonth()+1)}-${_p(_n.getUTCDate())}`;
    const body=`<form id="etf">
      <div class="field" style="margin-bottom:0"><label>📅 تاريخ إنهاء العقد الجديد *</label>
        <input type="date" id="et-date" value="${esc(cur)}" min="${esc(today)}">
        <div style="font-size:11.5px;color:var(--muted);margin-top:6px">يستمر «${esc(d.name)}» بالعمل حتى هذا التاريخ ثم يصبح «منتهي العقد» تلقائياً.</div>
      </div>
    </form>`;
    openModal({title:"تعديل موعد إنهاء العقد", bodyHTML:body,
      footHTML:`<button class="btn btn-primary" id="et-save">حفظ التعديل</button><button class="btn btn-ghost" data-xet>إلغاء</button>`,
      onMount:(m)=>{
        m.querySelector("[data-xet]").onclick=closeModal;
        m.querySelector("#et-save").onclick=()=>requireAny(["doctor_edit","status_manage"],async()=>{
          const nd=m.querySelector("#et-date").value;
          if(!nd){toast("اختر التاريخ","warn");return;}
          if(nd===cur){toast("لم يتغيّر التاريخ","warn");return;}
          if(nd<=today && !confirm("التاريخ اليوم أو سابق — سيُنهى العقد فوراً ويصبح «منتهي العقد». متابعة؟"))return;
          try{
            await api("/doctors/"+d.id+"/terminate",{method:"POST",body:{date:nd}});
            toast(nd>today?"✅ تم تحديث موعد إنهاء العقد":"✅ تم إنهاء العقد","ok");
            closeModal(); go(state.route);
          }catch(e){toast("❌ "+e.message,"err");}
        },d.branch_id,d.specialty);
      }});
  }

  async function quickCard(id){
    const {doctor:d}=await api("/doctors/"+id);
    const live=d.live||{};
    const isOnLeave=live.state==="leave";
    const isSecondmentCard=!!live.isSecondment;
    const sc=d.schedule||{};
    const sched = WEEK_ORDER.map(i=>[i,sc[i]||sc[String(i)]]).filter(([i,v])=>v&&v.length)
      .map(([i,v])=>`<div><b>${DAYS[i]}:</b> ${v.map(([s,e])=>fmtRange(s,e)).join(" ، ")}</div>`).join("")||"—";
    const offs=(d.dayoff||[]).slice().sort((a,b)=>WEEK_ORDER.indexOf(a)-WEEK_ORDER.indexOf(b)).map(i=>DAYS[i]).join("، ")||"—";

    // Active leave from live status
    const activeLv=(isOnLeave||isSecondmentCard) ? (live.leave || (d.leaves||[]).find(l=>{const n=new Date();const p=x=>String(x).padStart(2,'0');const t=`${n.getFullYear()}-${p(n.getMonth()+1)}-${p(n.getDate())}`;return l.start_date<=t&&l.end_date>=t;})) : null;
    // Upcoming (future) leaves
    const today=(()=>{const n=new Date(),p=x=>String(x).padStart(2,'0');return `${n.getFullYear()}-${p(n.getMonth()+1)}-${p(n.getDate())}`;})();
    const upcomingLeaves=(d.leaves||[]).filter(l=>l.start_date>today).sort((a,b)=>a.start_date.localeCompare(b.start_date));

    const rows=[
      ["التخصص", `${esc(d.specialty)}${d.rank?` — ${esc(d.rank)}`:""}`],
      ["الحالة الآن", statusPill(live)+(live.detail?` <span style="color:var(--muted)">${esc(live.detail)}</span>`:"")],
      ["الفرع", esc(d.branch_name)],
      ["الجنسية", esc(d.nationality)||"—"],
      ["الخبرة", esc(fmtExp(d.experience))||"—"],
      ["الجنس", esc(d.gender)||"—"],
      ["الدوام", `<div style="font-size:13px;line-height:1.9">${sched}</div>`],
      ["الإجازة الأسبوعية", offs],
      ["الحالات المستقبلة", esc(d.cases)||"—"],
      ["ملاحظات التنسيق", esc(d.notes_coord)||"—"],
    ];
    // بصمة التعديل — تاريخ يرجع للخلف = تراجع في البيانات.
    // تُعرض لأصحاب الصلاحيات فقط: الموظف (مشاهدة) لا يفيده أن يعرفها،
    // وإظهارها له يكشف أسماء المديرين لكل من يفتح الموقع.
    if(d.updated_at && state.user && state.user.edit) rows.push(["آخر تعديل",
      `<span style="font-size:12.5px">${esc(d.updated_by||"—")} — ${esc(fmtStamp(d.updated_at))}</span>`]);

    const hasLeaveRecord=!!activeLv;
    // اسم الفرع المنتدب إليه — من السجل أو من الحالة الحيّة (موحّد لكل طرق فتح البطاقة)
    const secBranchName=(activeLv&&activeLv.secondment_branch_name)||live.secondmentBranchName||"";
    const leaveSection=(isOnLeave||isSecondmentCard)?`
      <div class="leave-active-row" style="${isSecondmentCard?"border-color:#06b6d4;background:color-mix(in srgb,#cffafe 30%,var(--surface))":""}">
        <div>
          <div class="la-info">${isSecondmentCard
            ?`🔀 منتدب إلى: ${esc(secBranchName||"—")}${live.secondmentShiftLabel?` <span style="font-size:12px">· الشفت: ${esc(live.secondmentShiftLabel)}</span>`:""}`
            :`🔴 ${esc(activeLv?activeLv.type:live.leaveType||"إجازة")}`}</div>
          ${activeLv?`<div class="la-dates">من ${esc(fmtDate(activeLv.start_date))} إلى ${esc(fmtDate(activeLv.end_date))}${activeLv.reason?` · ${esc(activeLv.reason)}`:""}</div>`:""}
        </div>
        ${hasLeaveRecord&&can("leave_manage")?`<div class="la-actions">
          <button class="btn btn-xs btn-ghost" data-edit-leave="${activeLv.id}">تعديل</button>
          <button class="btn btn-xs btn-danger" data-del-leave="${activeLv.id}">${isSecondmentCard?"إلغاء الندب":"إلغاء"}</button>
        </div>`:""}
      </div>`:"";

    // ندبات الشفت لهذا اليوم — تُعرض مجتمعة (صباحي + مسائي) مع إبراز الفترة الحالية
    // الندب الساري الآن معروض في القسم العلوي — نستثنيه من القائمة السفلية
    // منعاً للتكرار. حين ينتهي وقته، ينزل تلقائياً إلى القائمة.
    const _allShiftSecs=Array.isArray(live.shiftSecondments)?live.shiftSecondments:[];
    const _activeSecId=(live.isSecondment&&live.leave)?live.leave.id:null;
    const shiftSecs=_allShiftSecs.filter(sv=>sv.id!==_activeSecId);
    const shiftSecSection=shiftSecs.length?`
      <div style="margin-top:10px">
        <div style="font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:6px">🔀 ندب الشفت</div>
        ${shiftSecs.map(sv=>{
          const isNow=sv.shift_state==="now";
          // الحالة الزمنية: سارٍ الآن / انتهى وقته اليوم / يبدأ لاحقاً / لا وردية اليوم
          const badge={
            now:'<span class="status-pill sp-secondment" style="font-size:11px">سارٍ الآن</span>',
            ended:'<span class="status-pill sp-off" style="font-size:11px">انتهى وقته اليوم</span>',
            later:'<span class="status-pill sp-upcoming" style="font-size:11px">يبدأ لاحقاً</span>',
            noshift:'<span class="status-pill sp-off" style="font-size:11px">لا وردية اليوم</span>'
          }[sv.shift_state]||"";
          return `<div class="leave-active-row" style="border-color:#06b6d4;${isNow?"background:color-mix(in srgb,#cffafe 35%,var(--surface))":"opacity:.72"}">
            <div>
              <div class="la-info">منتدب إلى: ${esc(sv.secondment_branch_name||"—")} · الشفت: ${esc(sv.shift_label||"")} ${badge}</div>
              <div class="la-dates">من ${esc(fmtDate(sv.start_date))} إلى ${esc(fmtDate(sv.end_date))}</div>
            </div>
            ${can("leave_manage")?`<div class="la-actions">
              <button class="btn btn-xs btn-ghost" data-edit-leave="${sv.id}">تعديل</button>
              <button class="btn btn-xs btn-danger" data-del-leave="${sv.id}">إلغاء</button>
            </div>`:""}
          </div>`;}).join("")}
      </div>`:"";

    const upcomingSection=upcomingLeaves.map(ul=>`
      <div class="leave-upcoming-row" data-ul-id="${ul.id}">
        <div>
          <div class="lu-info">🟡 إجازة قادمة · ${esc(ul.type||"إجازة")}</div>
          <div class="lu-dates">من ${esc(fmtDate(ul.start_date))} إلى ${esc(fmtDate(ul.end_date))}${ul.reason?` · ${esc(ul.reason)}`:""}</div>
        </div>
        ${can("leave_manage")?`<div class="lu-actions">
          <button class="btn btn-xs btn-ghost" data-edit-ul="${ul.id}">تعديل</button>
          <button class="btn btn-xs btn-danger" data-del-ul="${ul.id}">إلغاء</button>
        </div>`:""}
      </div>`).join("");

    const schedTermSection=live.termSched?`
      <div class="leave-upcoming-row" style="border-color:#d97706;background:color-mix(in srgb,#fef3c7 40%,var(--surface))">
        <div>
          <div class="lu-info" style="color:#92400e">⏳ إنهاء عقد مجدول</div>
          <div class="lu-dates">بتاريخ ${esc(fmtDate(live.termSched))} · سيصبح "منتهي العقد" تلقائياً</div>
        </div>
        ${canTerm()?`<div class="lu-actions">
          <button class="btn btn-xs btn-ghost" data-edit-sched-term="${d.id}">✎ تعديل</button>
          <button class="btn btn-xs btn-danger" data-cancel-term="${d.id}">حذف</button>
        </div>`:""}
      </div>`:"";

    const visitToggle=can("visit_manage")&&canBranch(d.branch_id)&&canSpecialty(d.specialty)?`<button class="btn btn-xs ${d.in_visit?"btn-visit-on":"btn-ghost"}" data-toggle-visit="${d.id}" style="margin-inline-start:8px">${d.in_visit?"🏠 إلغاء الزيارة":"🏠 في زيارة"}</button>`:"";
    const body=`
      <div class="qd-head">
        <div class="avatar qd-avatar">${d.photo?`<img src="${esc(d.photo)}">`:esc(initials(d.name))}</div>
        <div>
          <div class="qd-name">${esc(d.name)}</div>
          <div style="margin-top:6px;display:flex;align-items:center;flex-wrap:wrap;gap:4px">${statusPill(live)}${visitToggle}</div>
        </div>
      </div>
      ${schedTermSection}${leaveSection}${shiftSecSection}${upcomingSection}
      <div class="qd-rows">${rows.map(([k,v])=>`<div class="qd-row"><div class="k">${k}</div><div class="vv">${v}</div></div>`).join("")}</div>`;

    const foot=`
      ${canEditCard()?`<button class="btn btn-primary" data-edit="${d.id}">✎ تعديل</button>`:""}
      ${canStatus()&&isOnLeave&&!hasLeaveRecord?`<button class="btn btn-ghost" data-end-leave="${d.id}">إلغاء الإجازة</button>`:""}
      ${canStatus()&&!d.terminated?`<button class="btn btn-ghost" data-leave="${d.id}">＋ جدولة إجازة / ندب</button>`:""}`;

    openModal({title:d.name, bodyHTML:body, footHTML:foot, onMount:(m)=>{
      const vb=m.querySelector("[data-toggle-visit]"); if(vb)vb.onclick=()=>requirePerm("visit_manage",async()=>{
        try{await api("/doctors/"+d.id+"/visit",{method:"POST",body:{in_visit:!d.in_visit}});
          toast(d.in_visit?"✅ تم إلغاء الزيارة":"✅ تم تفعيل حالة الزيارة","ok");closeModal();go(state.route);}
        catch(e){toast("❌ "+e.message,"err");}
      },d.branch_id,d.specialty);
      const eb=m.querySelector("[data-edit]"); if(eb)eb.onclick=()=>requireAny(["doctor_edit","schedule_edit"],()=>doctorForm(d),d.branch_id,d.specialty);
      const lb=m.querySelector("[data-leave]"); if(lb)lb.onclick=()=>requireAny(["leave_manage","status_manage"],()=>leaveForm(d.id,d.name),d.branch_id,d.specialty);
      const ctb=m.querySelector("[data-cancel-term]"); if(ctb)ctb.onclick=()=>requireAny(["doctor_edit","status_manage"],async()=>{
        if(!confirm(`حذف جدولة إنهاء عقد "${d.name}"؟\nسيستمر الممارس بالعمل كالمعتاد.`))return;
        try{await api("/doctors/"+d.id+"/terminate",{method:"POST",body:{unterm:true}});
          toast("✅ تم حذف جدولة إنهاء العقد","ok");closeModal();go(state.route);}
        catch(e){toast("❌ "+e.message,"err");}
      },d.branch_id,d.specialty);
      const etb=m.querySelector("[data-edit-sched-term]"); if(etb)etb.onclick=()=>requireAny(["doctor_edit","status_manage"],()=>editSchedTerm(d),d.branch_id,d.specialty);
      // Active leave inline buttons
      const elb=m.querySelector("[data-edit-leave]"); if(elb)elb.onclick=()=>requireAny(["leave_manage","status_manage"],()=>leaveEditForm(activeLv,()=>{closeModal();quickCard(id);}),d.branch_id,d.specialty);
      const dlb=m.querySelector("[data-del-leave]"); if(dlb)dlb.onclick=()=>requireAny(["leave_manage","status_manage"],async()=>{
        if(!confirm("إلغاء الإجازة الحالية؟"))return;
        try{await api("/leaves/"+activeLv.id,{method:"DELETE"});toast("✅ تم حذف الإجازة بنجاح","ok");closeModal();go(state.route);}
        catch(e){toast("❌ "+e.message,"err");}
      },d.branch_id,d.specialty);
      // End manual leave (doctor.status="leave" with no leave record)
      const elv=m.querySelector("[data-end-leave]"); if(elv)elv.onclick=()=>requireAny(["leave_manage","status_manage"],async()=>{
        if(!confirm("إلغاء الإجازة وإعادة الممارس للعمل؟"))return;
        try{await api("/doctors/"+d.id,{method:"PUT",body:{status:"active"}});
          toast("✅ تم حذف الإجازة بنجاح","ok");closeModal();go(state.route);}
        catch(e){toast("❌ "+e.message,"err");}
      },d.branch_id,d.specialty);
      // Upcoming leave inline buttons
      upcomingLeaves.forEach(ul=>{
        const eul=m.querySelector(`[data-edit-ul="${ul.id}"]`);
        if(eul)eul.onclick=()=>requirePerm("leave_manage",()=>leaveEditForm(ul,()=>{closeModal();quickCard(id);}),d.branch_id,d.specialty);
        const dul=m.querySelector(`[data-del-ul="${ul.id}"]`);
        if(dul)dul.onclick=()=>requirePerm("leave_manage",async()=>{
          if(!confirm("إلغاء الإجازة القادمة؟"))return;
          try{await api("/leaves/"+ul.id,{method:"DELETE"});toast("✅ تم حذف الإجازة بنجاح","ok");closeModal();quickCard(id);}
          catch(e){toast("❌ "+e.message,"err");}
        },d.branch_id,d.specialty);
      });
    }});
  }
  function fmtDate(iso){
    if(!iso) return "";
    const p=iso.split("-");
    if(p.length<3) return iso;
    return `${+p[2]}/${+p[1]}/${p[0]}`;
  }
  function fmtRange(s,e){ return `${fmtMin(s)}–${fmtMin(e)}`; }

  // "2026-08-17T15:00:12" → "17/08 الساعة 15:00" (التوقيت مخزَّن بتوقيت الرياض)
  function fmtStamp(ts){
    if(!ts) return "—";
    const m=String(ts).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    return m ? `${m[3]}/${m[2]} الساعة ${m[4]}:${m[5]}` : String(ts);
  }
  function fmtMin(m){ m=((m%1440)+1440)%1440; let h=Math.floor(m/60),mm=m%60;
    const suf=h<12?"ص":"م"; let h12=h%12||12;
    return mm?`${h12}:${String(mm).padStart(2,"0")}${suf}`:`${h12}${suf}`; }
  // Format experience: "3" → "3 سنوات", "13" → "13 سنة", already-formatted → as-is
  function fmtExp(v){
    if(!v)return "";
    const s=String(v).trim();
    if(/[أ-ي]/.test(s)) return s; // already has Arabic text
    const n=parseFloat(s);
    if(isNaN(n)) return s;
    if(n===1) return "سنة واحدة";
    if(n===2) return "سنتان";
    if(n>=3&&n<=10) return `${n} سنوات`;
    return `${n} سنة`;
  }

  // ---------- Modal infra ----------
  function openModal({title,bodyHTML,footHTML,wide,onMount}){
    const back=el(`<div class="modal-back"><div class="modal ${wide?'wide':''}">
      <div class="modal-head"><h3>${esc(title)}</h3><button class="icon-btn" data-x>✕</button></div>
      <div class="modal-body">${bodyHTML}</div>
      ${footHTML?`<div class="modal-foot">${footHTML}</div>`:""}
    </div></div>`);
    back.addEventListener("click",e=>{if(e.target===back)closeModal();});
    back.querySelector("[data-x]").onclick=closeModal;
    const root=$("#modal-root");
    root.querySelectorAll(".modal-back").forEach(b=>b.remove()); // replace any open modal instantly
    root.appendChild(back);
    document.body.classList.add("modal-open");   // lock background scroll (no reflow flash)
    if(onMount)onMount(back.querySelector(".modal"));
  }
  function closeModal(){
    const root=$("#modal-root"); const back=root.querySelector(".modal-back");
    const finish=()=>{
      root.innerHTML=""; document.body.classList.remove("modal-open");
      if(state.globalSearch){
        const inp=$("#gsearch"), dd=_searchDD;
        if(inp&&dd&&dd.innerHTML){ positionDD(inp,dd); dd.style.display="block"; }
      }
      // تحديث مؤجّل حدث أثناء فتح النافذة — طبّقه الآن
      if(_softPending){ _softPending=false; softRender(); }
    };
    if(back){ back.classList.add("closing"); setTimeout(finish,150); }
    else finish();
  }

  // ---------- Permission-based action gating ----------
  function requireEdit(fn){ requirePerm("doctor_edit",fn); }
  function requirePerm(perm, fn, branchId, specialty){
    if(!state.user) return;
    if(!hasPerm(state.user, perm)){ toast("🔒 لا تملك صلاحية لهذا الإجراء","warn"); return; }
    if(branchId!==undefined && !canBranch(branchId)){ toast("🔒 لا تملك صلاحية للتعديل على هذا الفرع","warn"); return; }
    if(specialty!==undefined && !canSpecialty(specialty)){ toast("🔒 لا تملك صلاحية للتعديل على هذا القسم","warn"); return; }
    fn();
  }
  // يسمح بالإجراء إذا امتلك المستخدم أياً من الصلاحيات المذكورة (لدمج صلاحيات متعددة على نفس الزر)
  function requireAny(perms, fn, branchId, specialty){
    if(!state.user) return;
    if(!perms.some(p=>hasPerm(state.user,p))){ toast("🔒 لا تملك صلاحية لهذا الإجراء","warn"); return; }
    if(branchId!==undefined && !canBranch(branchId)){ toast("🔒 لا تملك صلاحية للتعديل على هذا الفرع","warn"); return; }
    if(specialty!==undefined && !canSpecialty(specialty)){ toast("🔒 لا تملك صلاحية للتعديل على هذا القسم","warn"); return; }
    fn();
  }
  // فحوص مجمّعة للعرض (إظهار/إخفاء الأزرار)
  const canEditCard = () => can("doctor_edit")||can("schedule_edit");   // تعديل بطاقة الممارس بالكامل
  const canStatus   = () => can("leave_manage")||can("status_manage");  // إجازات/ندب
  const canTerm     = () => can("doctor_edit")||can("status_manage");   // إنهاء العقد

  // ============================================================ ROUTER
  const routes={};
  async function go(route,params={}){
    const sameRoute=state.route===route;
    if(sameRoute) state.dashScroll=window.scrollY||0;
    state.route=route; state.params=params; state.sidebarOpen=false;
    location.hash=route+(params.id?("/"+params.id):"");
    await render();
    if(sameRoute&&state.dashScroll) requestAnimationFrame(()=>window.scrollTo(0,state.dashScroll)); }
  window.addEventListener("hashchange",()=>{
    const [r,id]=location.hash.replace(/^#/,"").split("/");
    if(r&&routes[r]&&(r!==state.route||id!=state.params.id)){state.route=r;state.params=id?{id}:{};render();}
  });

  // ============================================================ LOGIN
  // لا قائمة أسماء ولا رمز مشترك — اسم مستخدم/بريد وكلمة مرور فقط.
  function renderLogin(){
    const root=$("#app");
    root.innerHTML=`<div class="login-wrap"><div class="login-card pin-card">
      <div class="brand" style="justify-content:center"><div class="brand-logo">ع</div>
        <div><div class="brand-name">مجموعة عادل الطبية</div><div class="brand-sub">إدارة الممارسين والفروع</div></div></div>
      <div class="pin-title">تسجيل الدخول</div>
      <form id="lf" autocomplete="on">
        <input id="lu" class="inp" type="text" autocomplete="username" autocapitalize="off"
          spellcheck="false" dir="ltr" placeholder="اسم المستخدم أو البريد"
          style="width:100%;margin-bottom:10px">
        <input id="lp" class="inp" type="password" autocomplete="current-password"
          placeholder="كلمة المرور" style="width:100%">
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:14px">دخول</button>
      </form>
    </div></div>`;
    const uu=$("#lu"), pw=$("#lp");
    try{ const last=localStorage.getItem("adelcare_last_user"); if(last) uu.value=last; }catch(e){}
    setTimeout(()=>(uu.value?pw:uu).focus(),60);
    $("#lf").onsubmit=async(e)=>{e.preventDefault();
      if(!uu.value.trim()){toast("أدخل اسم المستخدم","warn");return;}
      if(!pw.value){toast("أدخل كلمة المرور","warn");return;}
      const btn=e.target.querySelector("button"); btn.disabled=true; btn.textContent="جارٍ الدخول...";
      try{
        const u=await LocalDB.signIn(uu.value,pw.value);
        try{ localStorage.setItem("adelcare_last_user",uu.value.trim()); }catch(_){}
        state.user=u;
        toast(u.userId?("مرحباً "+u.name):"مرحباً — وضع المشاهدة","ok");
        startNotifPolling(); go("dashboard");
      }catch(err){
        toast(err.message,"err"); pw.value=""; pw.focus();
        btn.disabled=false; btn.textContent="دخول";
      }
    };
  }
  // ============================================================ SHELL
  const NAV=[
    {id:"dashboard",ico:"🏠",label:"دوام الفروع"},
    {id:"doctors",ico:"🩺",label:"الممارسون"},
  ];
  const MNAV_ITEMS=[
    {id:"dashboard",ico:"🏠",label:"الرئيسية"},
    {id:"doctors",ico:"🩺",label:"الممارسون"},
  ];

  function shell(contentHTML){
    const u=state.user||{};
    const showSettings=can("settings_access")||can("users_manage");
    const navItems=NAV.map(n=>
      `<a class="nav-item ${state.route===n.id?'active':''}" data-nav="${n.id}">
        <span class="ico">${n.ico}</span>${n.label}
        ${n.id==="available"?'<span class="nav-badge" id="avail-badge">·</span>':""}</a>`).join("");
    const mnav=MNAV_ITEMS.map(n=>
      `<a class="${state.route===n.id?'active':''}" data-nav="${n.id}"><span class="ico">${n.ico}</span>${n.label}</a>`).join("");
    const userTag=u.userId
      ?`<div class="user-info"><span class="user-info-name">${esc(u.name)}</span><span class="user-info-role">${u.permissions&&u.permissions.includes("*")?"مدير رئيسي":"مستخدم"}</span></div>`
      :`<div class="user-info"><span class="user-info-name">زائر</span><span class="user-info-role">قراءة فقط</span></div>`;
    $("#app").innerHTML=`<div class="app-shell">
      ${state.sidebarOpen?'<div class="scrim" data-scrim></div>':""}
      <aside class="sidebar ${state.sidebarOpen?'open':''}">
        <div class="brand"><div class="brand-logo">ع</div>
          <div><div class="brand-name">مجموعة عادل الطبية</div><div class="brand-sub">إدارة الممارسين والفروع</div></div></div>
        ${navItems}
        <div class="sidebar-foot">
          ${userTag}
          <div class="nav-sep"></div>
          <button class="btn btn-ghost btn-sm" id="logout">تسجيل الخروج</button>
        </div>
      </aside>
      <div class="main">
        <div class="topbar">
          <button class="icon-btn hamburger" id="ham">☰</button>
          <div class="search-wrap">
            <span class="ico">🔍</span>
            <input class="search-input" id="gsearch" placeholder="ابحث: اسم، تخصص، جنسية، فرع، شفت، حالة..." autocomplete="off">
          </div>
          ${buildTopbarDate()}
          <div class="notif-wrap" id="notif-wrap">
            <button class="icon-btn notif-btn" id="notif-btn" title="الإشعارات">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span class="notif-badge" style="display:none">0</span>
            </button>
          </div>
          ${showSettings?`<button class="icon-btn${state.route==="admin"?" active-ctrl":""}" id="ctrl-btn" title="الإعدادات">⚙️</button>`:""}
          <button class="icon-btn" id="theme-btn"><span id="theme-ico">${document.documentElement.getAttribute("data-theme")==="dark"?"☀️":"🌙"}</span></button>
          <button class="icon-btn topbar-logout" id="top-logout" title="تسجيل الخروج"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
        </div>
        <div class="content" id="content">${contentHTML}</div>
      </div>
      <nav class="mobile-nav">${mnav}</nav>
    </div>`;
    $("#app").querySelectorAll("[data-nav]").forEach(a=>a.onclick=()=>go(a.dataset.nav));
    const doLogout=async()=>{
      // يُنهي جلسة Firebase أيضاً — لا يكفي مسح الجلسة المحلية
      try{ await LocalDB.signOut(); }catch(_){ await api("/logout",{method:"POST"}); }
      state.user=null;
      if(_notifInterval){clearInterval(_notifInterval);_notifInterval=null;}
      _prevPresent=null; _notifs=[]; _notifSeen=new Set(); _closePanel();
      render();
    };
    $("#logout").onclick=doLogout;
    const tLogout=$("#top-logout"); if(tLogout)tLogout.onclick=doLogout;
    const ctrlBtn=$("#ctrl-btn"); if(ctrlBtn) ctrlBtn.onclick=()=>go("admin");
    $("#theme-btn").onclick=toggleTheme;

    const ham=$("#ham"); if(ham)ham.onclick=()=>{state.sidebarOpen=!state.sidebarOpen;render();};
    const scr=$("[data-scrim]"); if(scr)scr.onclick=()=>{state.sidebarOpen=false;render();};

    // Notification bell
    const nBtn=$("#notif-btn");
    if(nBtn){
      _renderBell();
      nBtn.onclick=(e)=>{
        e.stopPropagation();
        if(_notifOpen){_closePanel();}
        else{_notifOpen=true;_renderPanel();}
      };
    }
    // Close panel on outside click or navigation (persistent, not once)
    document.addEventListener("click",(e)=>{
      if(_notifOpen&&!e.target.closest("#notif-wrap")&&!e.target.closest("#notif-panel")){
        _closePanel();
      }
    });

    setupSearch();
    updateAvailBadge();
  }

  async function updateAvailBadge(){ try{ const d=await api("/dashboard");
    const b=$("#avail-badge"); if(b)b.textContent=d.stats.present; }catch(e){} }

  // ---------- Global search ----------
  // Dropdown lives at body level (position:fixed) — outside topbar stacking context.
  // We keep exactly ONE repos + ONE click handler across renders using module-level refs.
  let searchT=null, _searchDD=null, _searchRepos=null, _searchClick=null;

  function getDD(){
    if(!_searchDD||!document.body.contains(_searchDD)){
      _searchDD=document.createElement("div");
      _searchDD.id="search-dd";
      _searchDD.style.display="none";
      document.body.appendChild(_searchDD);
    }
    return _searchDD;
  }
  function positionDD(inp,dd){
    const r=inp.getBoundingClientRect();
    if(!r.width) return; // element not visible / not in layout
    const vvh=window.visualViewport?window.visualViewport.height:window.innerHeight;
    const spaceBelow=Math.max(160, vvh - r.bottom - 16);
    dd.style.top       =(r.bottom+5)+"px";
    dd.style.bottom    ="auto";
    if(window.matchMedia("(max-width:860px)").matches){
      // جوال: قائمة عريضة تملأ الشاشة تقريباً — ليظهر اسم الممارس كاملاً
      dd.style.left="8px"; dd.style.right="8px"; dd.style.width="auto";
    } else {
      dd.style.left=r.left+"px"; dd.style.right="auto"; dd.style.width=r.width+"px";
    }
    dd.style.maxHeight =Math.min(spaceBelow,520)+"px";
  }
  function setupSearch(){
    const inp=$("#gsearch"); if(!inp)return;
    const dd=getDD();

    // Remove previous listeners so they don't accumulate across renders
    if(_searchRepos){
      window.removeEventListener("scroll",_searchRepos);
      if(window.visualViewport) window.visualViewport.removeEventListener("resize",_searchRepos);
    }
    if(_searchClick) document.removeEventListener("click",_searchClick);

    _searchRepos=()=>{ if(dd.style.display!=="none") positionDD(inp,dd); };
    window.addEventListener("scroll",_searchRepos,{passive:true});
    if(window.visualViewport) window.visualViewport.addEventListener("resize",_searchRepos);

    _searchClick=(e)=>{
      if(!e.target.closest(".search-wrap")&&!e.target.closest("#search-dd")&&!e.target.closest("#modal-root"))
        dd.style.display="none";
    };
    document.addEventListener("click",_searchClick);

    inp.addEventListener("input",()=>{state.globalSearch=inp.value;clearTimeout(searchT);searchT=setTimeout(doSearch,80);});
    inp.addEventListener("focus",()=>{
      if(inp.value.trim()&&dd.innerHTML&&dd.style.display==="none"){ positionDD(inp,dd); dd.style.display="block"; }
    });

    if(state.globalSearch){
      inp.value=state.globalSearch;
      setTimeout(()=>{ doSearch().then(()=>{ if(document.activeElement!==inp) dd.style.display="none"; }); },50);
    }

    async function doSearch(){
      const q=inp.value.trim();
      state.globalSearch=q;
      if(!q){dd.style.display="none";return;}
      // Populate content first, then position + show — so errors in API don't hide the dropdown
      let html=`<div class="empty" style="padding:24px">لا نتائج</div>`;
      try{
        const {results}=await api("/search?q="+encodeURIComponent(q));
        if(results.length) html=`<div style="display:grid;gap:7px">${results.map(doctorCard).join("")}</div>`;
      }catch(err){ html=`<div class="empty" style="padding:24px">حدث خطأ في البحث</div>`; }
      dd.innerHTML=html;
      positionDD(inp,dd);
      dd.style.display="block";
      bindCards(dd);
      // dropdown stays visible so results remain in background while modal is open
    }
  }

  // ---------- Topbar date widget ----------
  function buildTopbarDate(){
    const now=new Date();
    const dayName=DAYS[now.getDay()];
    let hijri="";
    try{ hijri=new Intl.DateTimeFormat("ar",{calendar:"islamic",day:"numeric",month:"long",year:"numeric"}).format(now); }catch(e){}
    let greg="";
    try{ greg=new Intl.DateTimeFormat("ar",{calendar:"gregory",day:"numeric",month:"long",year:"numeric"}).format(now); }catch(e){
      const AR_MONTHS=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
      greg=`${now.getDate()} ${AR_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    }
    return `<div class="topbar-date">
      <span class="td-day">${esc(dayName)}</span>
      ${hijri?`<span class="td-hijri">🌙 ${esc(hijri)}</span>`:""}
      ${greg?`<span class="td-greg">📅 ${esc(greg)}</span>`:""}
    </div>`;
  }

  // ============================================================ DASHBOARD
  let dashBranch="";   // "" = all branches
  let dashSpec="";     // "" = all specialties
  let dashStat="";     // "" | present | morning | evening | leave (stat-card filter)
  let dashDay=-1;      // -1 = today (live), 0-6 = specific JS weekday
  routes.dashboard=async()=>{
    shell(`<div class="loader"><div class="spin"></div></div>`);
    const [{doctors},{branches},lvRes]=await Promise.all([api("/doctors"),api("/branches"),api("/leaves").catch(()=>({leaves:[]}))]);
    const allLeaves=(lvRes&&lvRes.leaves)||[];
    const bname={}; branches.forEach(b=>bname[b.id]=b.name);
    doctors.forEach(d=>d.branch_name=bname[d.branch_id]||"");
    const dayIdx=_riyadhNow().getUTCDay();

    // ── حالة الممارس في يوم مختار من الأسبوع (وليس اليوم الحالي) ──
    // تعتمد على تاريخ ذلك اليوم: الإجازة/الندب/إنهاء العقد + فترة دوامه
    const _dateOfWeekday=(jsDay)=>{               // أقرب تاريخ قادم لذلك اليوم (يشمل اليوم)
      const base=_riyadhNow();
      const diff=(jsDay-base.getUTCDay()+7)%7;
      base.setUTCDate(base.getUTCDate()+diff);
      const p=x=>String(x).padStart(2,'0');
      return `${base.getUTCFullYear()}-${p(base.getUTCMonth()+1)}-${p(base.getUTCDate())}`;
    };
    const liveForDay=(d,jsDay)=>{
      const ds=_dateOfWeekday(jsDay);
      // منتهي العقد بحلول ذلك التاريخ
      const termDate=d.terminated_date||d.termination_scheduled;
      if(d.terminated||(termDate&&termDate<=ds))
        return {state:"terminated",label:"منتهي العقد",color:"terminated"};
      // سجلات ذلك اليوم مفصولة: إجازة حقيقية / ندب شفت / ندب كامل.
      // بلا ندب شفت النتيجة مطابقة للسلوك السابق حرفياً.
      const _dayRecs=allLeaves.filter(l=>!l.synthetic&&String(l.doctor_id)===String(d.id)&&l.start_date<=ds&&l.end_date>=ds);
      const _isSecR=(l)=>!!(l&&l.type==="ندب"&&l.secondment_branch_id);
      const _dayShiftSecs=_dayRecs.filter(l=>_isSecR(l)&&l.shift);
      const lv=_dayRecs.find(l=>!_isSecR(l)) || _dayShiftSecs[0] || _dayRecs.find(l=>_isSecR(l)&&!l.shift);
      const isSec=_isSecR(lv);
      const sec=isSec?{isSecondment:true,secondmentBranchId:lv.secondment_branch_id,
        secondmentBranchName:bname[lv.secondment_branch_id]||"",leave:lv,
        ...(lv.shift?{secondmentShift:lv.shift,secondmentShiftLabel:(lv.shift_label||lv.shift)}:{}) ,
        ...(_dayShiftSecs.length?{shiftSecondments:_dayShiftSecs.map(x=>({...x,
          secondment_branch_name:bname[x.secondment_branch_id]||"",
          shift_label:(x.shift_label||x.shift)}))}:{})}:{};
      if(!isSec&&lv){
        const t=lv.type||"إجازة";
        return {state:"leave",label:"إجازة",color:"leave",leaveType:t,detail:`${t} · حتى ${lv.end_date}`,leave:lv};
      }
      const sh=(d.schedule&&(d.schedule[jsDay]||d.schedule[String(jsDay)]))||[];
      if(!sh.length) return {state:"off",label:"إجازة أسبوعية",color:"black",detail:"يوم إجازة",...sec};
      // يوم عمل عادي: بلا شارة حالة — أوقات الدوام المعروضة في البطاقة تكفي
      return {state:"off", label:"", dayShift:true,
        ...(d.in_visit?{in_visit:true}:{}), ...sec};
    };
    const firstStart=(d)=>{const sh=(d.schedule&&(d.schedule[dayIdx]||d.schedule[String(dayIdx)]))||[];
      return sh.length?Math.min(...sh.map(x=>x[0])):null;};
    const effBranch=(d)=>d.live.isSecondment?d.live.secondmentBranchId:d.branch_id;
    const presentInBranch=(bid)=>doctors.filter(d=>effBranch(d)==bid&&d.live.state==="present").length;
    const allSpecs=[...new Set(doctors.map(d=>d.specialty))].filter(Boolean).sort((a,b)=>deptRank(a)-deptRank(b)||a.localeCompare(b));

    const totalPresent=doctors.filter(d=>d.live.state==="present").length;
    // زر «الكل» يظهر بجانب العنوان في نفس السطر
    const allChip=`<button class="bchip bchip-all ${dashBranch===""?"on":""}" data-bf="">
        🏥 الكل <span class="bchip-n">${totalPresent}</span>
      </button>`;
    // الفروع في صف مستقل أسفل العنوان
    const branchBar=`<div class="branch-bar" id="branch-bar">
      ${branches.map(b=>`
        <button class="bchip bchip-branch ${String(dashBranch)===String(b.id)?"on":""}" data-bf="${b.id}">
          <span class="bchip-top"><span class="bc-info-btn bchip-info" role="button" data-binfo="${b.id}" title="بيانات الفرع"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="5.5" r=".8" fill="currentColor" stroke="none"/><line x1="8" y1="8" x2="8" y2="12"/></svg></span><span class="bchip-name">${esc(b.name)}</span><span class="bchip-n">${presentInBranch(b.id)}</span></span>
          <span class="bchip-hours">${b.hours?`🕐 ${esc(b.hours)}`:""}</span>
        </button>`).join("")}
    </div>`;

    // helper: does doctor have shifts on given JS weekday?
    const hasShiftOn=(d,jsDay)=>{const sh=d.schedule&&(d.schedule[jsDay]||d.schedule[String(jsDay)]);return sh&&sh.length>0;};

    function drawBody(){
      const body=$("#dash-body"); body.classList.add("fade");
      const isToday=dashDay===-1;
      const viewDay=isToday?dayIdx:dashDay;
      const effectiveBranch=(d)=>d.live.isSecondment?String(d.live.secondmentBranchId):String(d.branch_id);
      const branchDocs=doctors.filter(d=>!dashBranch||effectiveBranch(d)===String(dashBranch));

      // stat cards only for today view
      let statCardsHTML="";
      if(isToday){
        let present=0,leave=0,morning=0,evening=0,inVisit=0;
        branchDocs.forEach(d=>{const s=d.live.state;
          if(d.live.in_visit)inVisit++;   // الزيارة علامة — تُحسب مستقلة دون إخراجه من المتواجدين
          if(s==="present")present++;
          if(s==="leave"){leave++;return;}
          const fs=firstStart(d); if(fs!=null){if(fs<14*60)morning++;else evening++;}});
        const statLabels={present:"المتواجدون الآن",morning:"الشفت الصباحي",evening:"الشفت المسائي",leave:"الممارسون في إجازة",in_visit:"في زيارة الآن"};
        statCardsHTML=`<div class="mini-stats">${[
          {k:"present",v:present,l:"متواجد الآن",c:"green",b:"🟢"},
          {k:"morning",v:morning,l:"الشفت الصباحي",c:"amber",b:"🌅"},
          {k:"evening",v:evening,l:"الشفت المسائي",c:"brand",b:"🌙"},
          {k:"leave",v:leave,l:"في إجازة",c:"leave",b:"🔴"},
          {k:"in_visit",v:inVisit,l:"في زيارة الآن",c:"purple",b:"🏠"},
        ].map(x=>`<button class="mini-stat s-${x.c} ${dashStat===x.k?"active":""}" data-stat="${x.k}">
          <span class="ms-ico">${x.b}</span><div><div class="ms-v">${x.v}</div><div class="ms-l">${x.l}</div></div></button>`).join("")}</div>
          ${dashStat?`<button class="chip-clear" id="clear-stat">✕ ${statLabels[dashStat]} (إلغاء)</button>`:""}`;
      }

      // combined filter
      const matchStat=(d)=>{
        if(!isToday||!dashStat) return true;
        if(dashStat==="present") return d.live.state==="present";
        if(dashStat==="leave")   return d.live.state==="leave";
        if(dashStat==="in_visit")return !!d.live.in_visit;
        const fs=firstStart(d);
        if(dashStat==="morning") return fs!=null&&fs<14*60;
        if(dashStat==="evening") return fs!=null&&fs>=14*60;
        return true;
      };
      const listDocs=branchDocs.filter(d=>
        (!dashSpec||d.specialty===dashSpec) &&
        matchStat(d) &&
        (isToday || hasShiftOn(d,viewDay))
      );

      const bySpec={}; listDocs.forEach(d=>{(bySpec[d.specialty]=bySpec[d.specialty]||[]).push(d);});
      const ordered=Object.keys(bySpec).sort((a,b)=>deptRank(a)-deptRank(b)||a.localeCompare(b));

      const sections=ordered.map(sp=>{
        let arr=bySpec[sp];
        if(isToday) arr=arr.slice().sort(availSort);
        else arr=arr.slice().sort((a,b)=>{
          const sa=(a.schedule&&(a.schedule[viewDay]||a.schedule[String(viewDay)])||[])[0]?.[0]??9999;
          const sb=(b.schedule&&(b.schedule[viewDay]||b.schedule[String(viewDay)])||[])[0]?.[0]??9999;
          return sa-sb||a.name.localeCompare(b.name);
        });
        // نفس بطاقة العرض الرئيسي في كل الأيام — تُحسب الحالة والدوام حسب اليوم المعروض
        const cards=arr.map(d=>isToday
          ? doctorCard(d)
          : doctorCard({...d, live:liveForDay(d,viewDay)}, viewDay)).join("");
        return `<div class="section-head"><h2>${esc(sp)}</h2><span class="count">${arr.length}</span></div>
          <div class="status-grid">${cards}</div>`;
      }).join("")||`<div class="empty" style="padding:34px">لا يوجد ممارسون في هذا اليوم</div>`;

      const _rn=_riyadhNow(); const nowTxt=fmtMin(_rn.getUTCHours()*60+_rn.getUTCMinutes());
      const branchLabel=dashBranch?(" · "+(bname[dashBranch]||"")):"";
      const dayOpts=`<option value="-1" ${dashDay===-1?"selected":""}>اليوم</option>`+
        WEEK_ORDER.map(i=>`<option value="${i}" ${dashDay===i?"selected":""}>${DAYS[i]}</option>`).join("");

      body.innerHTML=`
        <div class="page-sub" style="margin:2px 0 12px">${DAYS[dayIdx]} · الساعة ${nowTxt} · ${branchDocs.length} ممارس${branchLabel}</div>
        ${statCardsHTML}
        <div class="toolbar" style="margin:12px 0 4px">
          <select class="select-mini" id="fday">${dayOpts}</select>
          <select class="select-mini" id="fspec"><option value="">كل التخصصات</option>
            ${allSpecs.map(s=>`<option ${dashSpec===s?"selected":""}>${esc(s)}</option>`).join("")}</select>
        </div>
        ${sections}`;
      bindCards(body);
      body.querySelectorAll("[data-stat]").forEach(btn=>btn.onclick=()=>{dashStat=dashStat===btn.dataset.stat?"":btn.dataset.stat;drawBody();});
      $("#fday").onchange=(e)=>{dashDay=e.target.value===-1||e.target.value==="-1"?-1:+e.target.value;dashStat="";drawBody();};
      $("#fspec").onchange=(e)=>{dashSpec=e.target.value;drawBody();};
      const cs=$("#clear-stat"); if(cs)cs.onclick=()=>{dashStat="";drawBody();};
      requestAnimationFrame(()=>body.classList.remove("fade"));
    }
    $("#content").innerHTML=`
      <div class="dash-head">
        <div class="page-title">ممارسو اليوم</div>
        ${allChip}
      </div>
      ${branchBar}
      <div id="dash-body"></div>`;
    // زر «الكل» + أزرار الفروع تعمل معاً كمجموعة فلترة واحدة
    const _filterBtns=()=>[...document.querySelectorAll('.dash-head [data-bf], #branch-bar [data-bf]')];
    _filterBtns().forEach(b=>b.onclick=(e)=>{
      const info=e.target.closest("[data-binfo]");
      if(info){
        e.stopPropagation();
        const br=branches.find(x=>String(x.id)===String(info.dataset.binfo));
        if(br)branchInfoModal(br);
        return;
      }
      dashBranch=b.dataset.bf;
      _filterBtns().forEach(x=>x.classList.toggle("on",x===b));
      drawBody();
    });
    drawBody();
  };

  // ============================================================ BRANCHES (kept for deep-links, not in nav)
  routes.branches=async()=>{
    if(state.params.id) return renderBranch(state.params.id);
    shell(`<div class="loader"><div class="spin"></div></div>`);
    const {branches}=await api("/branches");
    $("#content").innerHTML=`<div class="page-title">الفروع</div>
      <div class="page-sub">${branches.length} فروع — اضغط على الفرع لعرض أطبائه</div>
      <div class="branch-grid" style="margin-top:18px">${branches.map(b=>`
        <div class="branch-card" data-b="${b.id}">
          <div class="bc-top"><div><h3>${esc(b.name)}</h3><div class="grp">${esc(b.grp||"")}</div></div>
            <div class="bc-icons"><button type="button" class="bc-info-btn" data-binfo="${b.id}" title="بيانات الفرع"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="5.5" r=".8" fill="currentColor" stroke="none"/><line x1="8" y1="8" x2="8" y2="12"/></svg></button><span style="font-size:26px">🏥</span></div></div>
          ${b.info?`<div class="page-sub" style="margin-top:6px">${esc(b.info)}</div>`:""}
          <div class="bc-stat">
            <div><div class="n">${b.doctor_count}</div><div class="x">طبيب</div></div>
            <div><div class="n bc-live">${b.present}</div><div class="x">متواجد الآن</div></div>
            <div><div class="n">${b.specialties.length}</div><div class="x">تخصص</div></div>
          </div>
        </div>`).join("")}</div>`;
    $("#content").querySelectorAll("[data-b]").forEach(c=>c.onclick=(e)=>{
      if(e.target.closest("[data-binfo]")) return;
      go("branches",{id:c.dataset.b});
    });
    $("#content").querySelectorAll("[data-binfo]").forEach(btn=>btn.onclick=(e)=>{
      e.stopPropagation();
      const b=branches.find(x=>String(x.id)===String(btn.dataset.binfo));
      if(b) branchInfoModal(b);
    });
  };

  // ---- Branch info modal: fields config (extensible — add new fields here) ----
  const BRANCH_FIELDS=[
    {key:"name",label:"اسم الفرع",required:true},
    {key:"grp",label:"المجموعة"},
    {key:"info",label:"الوصف"},
    {key:"hours",label:"ساعات العمل"},
    {key:"phone",label:"رقم الجوال",type:"tel",dir:"ltr"},
    {key:"landline",label:"الهاتف الثابت",type:"tel",dir:"ltr"},
    {key:"bank_account",label:"رقم الحساب البنكي",dir:"ltr"},
    {key:"iban",label:"الآيبان (IBAN)",dir:"ltr"},
    {key:"extra_info",label:"معلومات إضافية",type:"textarea"},
  ];

  function branchInfoModal(b, opts={}){
    const editable=can("branch_manage")&&canBranch(b.id);

    /* ── VIEW renderers ── */
    const secItemView=(it)=>{
      if(!it.name&&!it.desc)return"";
      return`<div class="bsec-item-v">
        <div class="biv-name">${esc(it.name||"")}</div>
        ${it.desc?`<div class="biv-desc">${esc(it.desc||"")}</div>`:""}
      </div>`;};
    const secView=(sec)=>{
      const items=(sec.items||[]).filter(it=>it.name||it.desc);
      if(!sec.title&&!items.length)return"";
      return`<div class="bsec-v">
        <div class="bsec-head-v">${esc(sec.title||"")}</div>
        <div class="bsec-items-v">${items.map(secItemView).join("")}</div>
      </div>`;};

    /* ── EDIT renderers ── */
    const secItemHTML=(it,isNew)=>{
      const hasDesc=(it.desc&&String(it.desc).trim())||(!it.name&&!it.desc&&isNew);
      const inner=hasDesc
        ?`<div class="bi-pair">
          <textarea class="bi-name" placeholder="اسم الجهاز / البند" rows="1">${esc(it.name||"")}</textarea>
          <textarea class="bi-desc" placeholder="التفاصيل" rows="2">${esc(it.desc||"")}</textarea>
        </div>`
        :`<textarea class="bi-name" placeholder="البند" rows="2">${esc(it.name||"")}</textarea>`;
      return`<div class="bsec-item">${inner}<button type="button" class="sbtn sbtn-del" data-del-item title="حذف">✕</button></div>`;};
    const secHTML=(sec)=>`<div class="bsec">
      <div class="bsec-head">
        <input class="bsec-title" placeholder="عنوان القسم" value="${esc(sec.title||"")}">
        <button type="button" class="sbtn sbtn-del" data-del-sec title="حذف القسم">✕</button>
      </div>
      <div class="bsec-items">${(sec.items||[]).map(it=>secItemHTML(it)).join("")}</div>
      <button type="button" class="btn btn-ghost btn-xs" data-add-item>+ بند</button>
    </div>`;

    if(!opts.edit){
      /* ── VIEW MODE ── */
      const hasFields=BRANCH_FIELDS.some(f=>b[f.key]);
      const fieldsHTML=hasFields?`<div class="binfo-fields">${BRANCH_FIELDS.filter(f=>b[f.key]).map(f=>`
        <div class="binfo-row"><span class="bir-lbl">${f.label}</span><span class="bir-val"${f.dir?` dir="${f.dir}"`:""}>${esc(b[f.key])}</span></div>`).join("")}</div>`:"";
      const secsHTML=(b.details||[]).length
        ?`<div class="bsec-sep"><span>أقسام تفصيلية</span></div>${(b.details||[]).map(secView).join("")}`:"";
      const body=`<div class="binfo-view">${fieldsHTML}${secsHTML}</div>`;
      const foot=editable
        ?`<button class="btn btn-ghost" data-x2>إغلاق</button><button class="btn btn-primary" data-edit>✏️ تعديل</button>`
        :`<button class="btn btn-ghost" data-x2>إغلاق</button>`;
      openModal({title:`📋 بيانات الفرع — ${b.name}`,bodyHTML:body,footHTML:foot,wide:true,onMount:(m)=>{
        m.querySelector("[data-x2]").onclick=closeModal;
        const eb=m.querySelector("[data-edit]");
        if(eb)eb.onclick=()=>{closeModal();setTimeout(()=>branchInfoModal(b,{edit:true}),200);};
      }});
    } else {
      /* ── EDIT MODE ── */
      const body=`<form id="binfo-form">${BRANCH_FIELDS.map(f=>{
        const v=esc(b[f.key]||"");
        const attrs=`name="${f.key}" ${f.dir?`dir="${f.dir}"`:""} ${f.required?"required":""}`;
        return`<div class="field"><label>${f.label}${f.required?" *":""}</label>${
          f.type==="textarea"?`<textarea ${attrs} rows="3">${v}</textarea>`
          :`<input type="${f.type||"text"}" ${attrs} value="${v}">`}</div>`;
      }).join("")}
      <div class="bsec-sep"><span>أقسام تفصيلية</span></div>
      <div id="binfo-secs">${(b.details||[]).map(secHTML).join("")}</div>
      <button type="button" class="btn btn-ghost btn-sm" data-add-sec>+ قسم جديد</button>
      </form>`;
      const foot=`<button class="btn btn-ghost" data-x2>إلغاء</button><button class="btn btn-primary" data-save form="binfo-form">💾 حفظ</button>`;
      openModal({title:`✏️ تعديل الفرع — ${b.name}`,bodyHTML:body,footHTML:foot,wide:true,onMount:(m)=>{
        m.querySelector("[data-x2]").onclick=()=>{closeModal();setTimeout(()=>branchInfoModal(b),200);};
        const secsEl=m.querySelector("#binfo-secs");
        const wire=(scope)=>{
          scope.querySelectorAll("[data-del-sec]").forEach(x=>x.onclick=()=>x.closest(".bsec").remove());
          scope.querySelectorAll("[data-del-item]").forEach(x=>x.onclick=()=>x.closest(".bsec-item").remove());
          scope.querySelectorAll("[data-add-item]").forEach(x=>x.onclick=()=>{
            const holder=x.closest(".bsec").querySelector(".bsec-items");
            holder.insertAdjacentHTML("beforeend",secItemHTML({},true));
            wire(holder.lastElementChild);
          });
        };
        wire(m);
        const addSec=m.querySelector("[data-add-sec]");
        if(addSec)addSec.onclick=()=>{secsEl.insertAdjacentHTML("beforeend",secHTML({items:[{}]}));wire(secsEl.lastElementChild);};
        const sv=m.querySelector("[data-save]");
        if(sv)sv.onclick=async(e)=>{
          e.preventDefault();
          const form=m.querySelector("#binfo-form");
          if(!form.reportValidity())return;
          const payload={};
          BRANCH_FIELDS.forEach(f=>{const el2=form.elements[f.key];if(el2)payload[f.key]=el2.value.trim();});
          payload.details=[...secsEl.querySelectorAll(".bsec")].map(s=>({
            title:s.querySelector(".bsec-title").value.trim(),
            items:[...s.querySelectorAll(".bsec-item")].map(it=>({
              name:it.querySelector(".bi-name").value.trim(),
              desc:(it.querySelector(".bi-desc")?.value||"").trim()
            })).filter(it=>it.name||it.desc)
          })).filter(s=>s.title||s.items.length);
          sv.disabled=true;
          try{
            await api("/branches/"+b.id,{method:"PUT",body:payload});
            toast("✅ تم حفظ بيانات الفرع","ok");
            closeModal();setTimeout(()=>branchInfoModal({...b,...payload}),200);
          }catch(err){toast(err.message||"تعذر الحفظ","warn");sv.disabled=false;}
        };
      }});
    }
  }

  async function renderBranch(id){
    shell(`<div class="loader"><div class="spin"></div></div>`);
    const {branch,doctors}=await api("/branches/"+id);
    const counts={present:0,upcoming:0,leave:0,seconded:0};
    doctors.forEach(d=>{const s=d.live.state;
      if(s==="present")counts.present++; else if(s==="upcoming")counts.upcoming++;
      else if(d.live.isSecondment)counts.seconded++;
      else if(s==="leave"||s==="off")counts.leave++;});
    // group by department (specialty) and order: طب عام، باطنة، ...
    const bySpec={}; doctors.forEach(d=>{(bySpec[d.specialty]=bySpec[d.specialty]||[]).push(d);});
    const ordered=Object.keys(bySpec).sort((a,b)=>deptRank(a)-deptRank(b)||a.localeCompare(b));
    // استعادة حالة الواجهة (بحث + فلتر الحضور) — تبقى بعد التحديث التلقائي، وتُصفّر عند تغيير الفرع
    const _bui=(state.branchUI&&String(state.branchUI.id)===String(id))?state.branchUI:{};
    let presentOnly=!!_bui.presentOnly, query=_bui.query||"", queryNorm=normAr(query);
    const _saveBUI=()=>{ state.branchUI={id:String(id),query,presentOnly}; };
    $("#content").innerHTML=`
      <button class="btn btn-ghost btn-sm" id="back">→ كل الفروع</button>
      <div class="page-title" style="margin-top:12px">${esc(branch.name)}</div>
      <div class="page-sub">${esc(branch.info||"")} ${branch.hours?"· "+esc(branch.hours):""}</div>
      <div class="branch-chips">
        <button class="bchip present-toggle${presentOnly?" on":""}" id="t-present"><span class="dot" style="background:var(--green)"></span> موجودون الآن <span class="bchip-n">${counts.present}</span></button>
        <span class="bchip ghost"><span class="dot" style="background:var(--amber)"></span> يبدأ لاحقاً ${counts.upcoming}</span>
        <span class="bchip ghost"><span class="dot" style="background:var(--black)"></span> إجازة/خارج ${counts.leave}</span>
        ${counts.seconded?`<span class="bchip ghost" style="color:#0e7490">🔀 منتدب ${counts.seconded}</span>`:""}
        <span class="bchip ghost">🩺 الإجمالي ${doctors.length}</span>
      </div>
      <div class="toolbar"><input class="search-input" id="bsearch" style="max-width:340px;border-radius:var(--r-s);padding:9px 14px" placeholder="بحث داخل الفرع..."></div>
      <div id="branch-docs"></div>`;
    const bname={}; doctors.forEach(d=>bname[d.branch_id]=branch.name);
    const drawSecs=()=>{
      const wrap=$("#branch-docs"); let html="";
      if(query){
        // بحث ذكي: قائمة مستوية مرتّبة حسب درجة التطابق
        let arr=doctors.filter(d=>!presentOnly||d.live.state==="present");
        arr=arr.map(d=>({d,s:scoreDoctorMgmt(query,d,bname)})).filter(x=>x.s>0)
          .sort((a,b)=>b.s-a.s||(a.d.name||"").localeCompare(b.d.name||""))
          .map(x=>x.d);
        wrap.innerHTML=arr.length
          ?`<div class="status-grid compact">${arr.map(doctorCard).join("")}</div>`
          :`<div class="empty">لا نتائج لـ "${esc(query)}"</div>`;
      }else{
        // عرض مقسّم بالتخصص مع ترتيب الحضور
        ordered.forEach(sp=>{
          let arr=bySpec[sp].slice().sort(availSort);
          if(presentOnly) arr=arr.filter(d=>d.live.state==="present");
          if(!arr.length) return;
          html+=`<div class="section-head"><h2>${esc(sp)}</h2><span class="count">${arr.length}</span></div>
            <div class="status-grid">${arr.map(doctorCard).join("")}</div>`;
        });
        wrap.innerHTML=html||`<div class="empty">${presentOnly?"لا يوجد ممارسون متواجدون الآن في هذا الفرع":"لا ممارسون في هذا الفرع"}</div>`;
      }
      bindCards(wrap);
    };
    let _bsTimer;
    const _bsInput=$("#bsearch"); if(query) _bsInput.value=query;
    $("#back").onclick=()=>{ state.branchUI=null; go("branches"); };
    $("#t-present").onclick=()=>{presentOnly=!presentOnly;
      $("#t-present").classList.toggle("on",presentOnly); _saveBUI(); drawSecs();};
    _bsInput.addEventListener("input",e=>{query=e.target.value.trim();_saveBUI();clearTimeout(_bsTimer);_bsTimer=setTimeout(drawSecs,80);});
    drawSecs();
  }

  // ============================================================ DOCTORS
  routes.doctors=async()=>{
    shell(`<div class="loader"><div class="spin"></div></div>`);
    const [{doctors},{branches}]=await Promise.all([api("/doctors?terminated=1"),api("/branches")]);
    const activeCnt=doctors.filter(d=>!d.terminated).length;
    const termedCnt=doctors.filter(d=>d.terminated).length;
    const specs=[...new Set(doctors.filter(d=>!d.terminated).map(d=>d.specialty))].filter(Boolean).sort();
    const subLabel=`${activeCnt} ممارس${termedCnt>0?` · ${termedCnt} منتهي العقد`:""}`;
    $("#content").innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div><div class="page-title">الممارسون</div><div class="page-sub">${subLabel}</div></div>
        ${(can("doctor_add")||can("doctor_edit")||can("doctor_delete")||can("leave_manage")||can("specialty_manage"))?'<button class="icon-btn" id="go-manage" title="إدارة الممارسين" style="font-size:18px">⚙️</button>':""}
      </div>
      <div class="toolbar" style="margin-top:16px">
        <input class="search-input toolbar-search" id="dsearch" style="border-radius:var(--r-s);padding:9px 14px" placeholder="ابحث: اسم، تخصص، جنسية، فرع، درجة...">
        <select class="select-mini" id="fspec"><option value="">كل التخصصات</option>${specs.map(s=>`<option>${esc(s)}</option>`).join("")}</select>
        <select class="select-mini" id="fbranch"><option value="">كل الفروع</option>${branches.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join("")}</select>
        <select class="select-mini" id="fstatus"><option value="">كل الحالات</option>
          <option value="present">موجود الآن</option><option value="upcoming">يبدأ لاحقاً</option>
          <option value="finished">انتهى دوامه</option><option value="leave">إجازة</option>
          <option value="terminated">منتهي العقد</option></select>
      </div>
      <div class="status-grid" id="doc-list"></div>`;
    const bname={}; branches.forEach(b=>bname[b.id]=b.name);
    doctors.forEach(d=>d.branch_name=bname[d.branch_id]||"");

    // يستخدم الدالة المركزية scoreDoctorMgmt المعرّفة في نطاق IIFE الخارجي
    const scoreDoctor=(q,d)=>scoreDoctorMgmt(q,d,bname);

    let _dsearchTimer;
    const draw=()=>{ const rawQ=$("#dsearch").value.trim(); const sp=$("#fspec").value;
      const br=$("#fbranch").value; const st=$("#fstatus").value;
      // حفظ الفلاتر في الحالة — تبقى بعد التحديث التلقائي للبيانات
      state.docFilter={spec:sp,branch:br,status:st};
      // Filter by dropdown first
      let filtered=doctors.filter(d=>
        (!sp||d.specialty===sp)&&(!br||String(d.branch_id)===br)&&(!st||d.live.state===st));
      // Score and sort by search query
      let arr;
      if(rawQ){
        arr=filtered.map(d=>({d,s:scoreDoctor(rawQ,d)}))
          .filter(x=>x.s>0)
          .sort((a,b)=>b.s-a.s||(a.d.name||"").localeCompare(b.d.name||""))
          .map(x=>x.d);
      } else {
        arr=filtered.slice().sort(availSort);
      }
      const list=$("#doc-list");
      // بطاقات مصغّرة عند وجود بحث (تأثيرها على الجوال فقط عبر CSS)
      list.classList.toggle("compact", !!rawQ);
      list.innerHTML=arr.length?arr.map(doctorCard).join(""):`<div class="empty">لا نتائج</div>`;
      bindCards(list);
    };
    // Debounced live search (80ms) + instant filter changes
    const dsInput=$("#dsearch");
    if(state.doctorsSearch){ dsInput.value=state.doctorsSearch; }
    // استعادة الفلاتر المحفوظة (تبقى بعد التحديث التلقائي)
    const _df=state.docFilter||{};
    if(_df.spec){ $("#fspec").value=_df.spec; }
    if(_df.branch){ $("#fbranch").value=_df.branch; }
    if(_df.status){ $("#fstatus").value=_df.status; }
    dsInput.addEventListener("input",()=>{state.doctorsSearch=dsInput.value;clearTimeout(_dsearchTimer);_dsearchTimer=setTimeout(draw,80);});
    ["fspec","fbranch","fstatus"].forEach(id=>{$("#"+id).addEventListener("change",draw);});
    const goM=$("#go-manage"); if(goM) goM.onclick=()=>go("control");
    draw();
  };

  // ---------- Doctor form ----------
  async function doctorForm(doc, onDone){
    const {branches}=await api("/branches");
    const {specialties}=await api("/specialties");
    // لتحذير تكرار الاسم عند الإضافة فقط — لا حاجة لها عند تعديل ممارس موجود
    const existingDoctors = doc ? [] : (await api("/doctors")).doctors || [];
    const d=doc||{schedule:{},dayoff:[],gender:"",home_visit:false,status:"active"};
    // قائمة الأقسام المعتمدة — يُضاف تخصص الممارس الحالي إن لم يكن مسجّلاً (حفاظاً على بياناته)
    const specList=specialties.slice();
    if(d.specialty&&!specList.includes(d.specialty)) specList.unshift(d.specialty);
    const sc=d.schedule||{};
    const offSet=new Set(d.dayoff||[]);
    const minToTime=(m)=>{m=((m%1440)+1440)%1440;return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;};
    const timeToMin=(t)=>{const[h,mm]=(t||"08:00").split(":").map(Number);return h*60+(mm||0);};
    // convert HH:MM → {h12,min,ap}  and back
    const hhmm2ampm=(t)=>{const[h,m]=(t||"08:00").split(":").map(Number);return{h:h%12||12,m,ap:h<12?"am":"pm"};};
    const ampm2hhmm=(h,m,ap)=>{const h24=ap==="am"?(h===12?0:h):(h===12?12:h+12);return`${String(h24).padStart(2,"0")}:${String(m).padStart(2,"0")}`;};
    const mkTP=(val,id)=>{const{h,m,ap}=hhmm2ampm(val);
      const hrs=Array.from({length:12},(_,i)=>i+1).map(x=>`<option${x===h?" selected":""}>${x}</option>`).join("");
      const mins=[0,5,10,15,20,25,30,35,40,45,50,55].map(x=>`<option value="${x}"${x===m?" selected":""}>${String(x).padStart(2,"0")}</option>`).join("");
      return`<span class="tp" data-tp="${id}"><span class="tp-seg"><span class="tp-seg-lbl">س</span><span class="tp-v tp-vh">${h}</span><select class="tp-h tp-s">${hrs}</select></span><span class="tp-div">:</span><span class="tp-seg"><span class="tp-seg-lbl">د</span><span class="tp-v tp-vm">${String(m).padStart(2,"0")}</span><select class="tp-m tp-s">${mins}</select></span><span class="tp-seg"><span class="tp-seg-lbl">ص/م</span><span class="tp-v tp-vap">${ap==="am"?"ص":"م"}</span><select class="tp-ap tp-s"><option value="am"${ap==="am"?" selected":""}>ص</option><option value="pm"${ap==="pm"?" selected":""}>م</option></select></span></span>`;};
    const readTP=(el)=>{const h=+el.querySelector(".tp-h").value,m=+el.querySelector(".tp-m").value,ap=el.querySelector(".tp-ap").value;return ampm2hhmm(h,m,ap);};
    const schedState=WEEK_ORDER.map(day=>{
      const ex=sc[day]||sc[String(day)];
      const isOff=offSet.has(day)||!ex||!ex.length;
      return {day,off:isOff,shifts:ex&&ex.length?ex.map(([s,e])=>({start:minToTime(s),end:minToTime(e)})):[{start:"08:00",end:"16:00"}]};
    });
    const body=`<form id="docf">
      <div class="grid2">
        <div class="field"><label>الاسم *</label><input name="name" value="${esc(d.name||"")}" required></div>
        <div class="field"><label>الفرع *</label><select name="branch_id" required>${branches.map(b=>`<option value="${b.id}" ${d.branch_id==b.id?"selected":""}>${esc(b.name)}</option>`).join("")}</select></div>
        <div class="field"><label>التخصص *</label>
          <div class="ss" id="spec-ss">
            <button type="button" class="ss-trigger" id="spec-trigger">
              <span class="ss-val ${d.specialty?"":"ss-ph"}" id="spec-val">${d.specialty?esc(d.specialty):"اختر القسم"}</span>
              <span class="ss-caret">▾</span>
            </button>
            <div class="ss-panel" id="spec-panel" hidden>
              <input type="text" class="ss-search" id="spec-search" placeholder="🔍 ابحث عن القسم..." autocomplete="off">
              <div class="ss-list" id="spec-list"></div>
            </div>
            <input type="hidden" name="specialty" id="spec-input" value="${esc(d.specialty||"")}">
          </div>
        </div>
        <div class="field"><label>الدرجة / التخصص الدقيق *</label><input name="rank" value="${esc(d.rank||"")}" placeholder="أخصائي، مقيم..." required></div>
        <div class="field"><label>الجنسية *</label><input name="nationality" value="${esc(d.nationality||"")}" required></div>
        <div class="field"><label>الجنس *</label><select name="gender" required>
          <option value="" disabled ${!d.gender?"selected":""}>اختر الجنس</option>
          <option value="ذكر" ${d.gender==="ذكر"?"selected":""}>ذكر</option>
          <option value="أنثى" ${d.gender==="أنثى"?"selected":""}>أنثى</option></select></div>
        <div class="field"><label>سنوات الخبرة *</label><input name="experience" value="${esc(d.experience||"")}" required></div>
        <div class="field"><label>المؤهل</label><input name="qualification" value="${esc(d.qualification||"")}"></div>
        <div class="field"><label>رابط الصورة</label><input name="photo" value="${esc(d.photo||"")}" placeholder="https://..."></div>
      </div>
      <div class="field">
        <label>جدول الدوام الأسبوعي</label>
        <div id="sched-grid" class="sched-grid"></div>
      </div>
      <div class="field"><label>الحالات التي يستقبلها</label><textarea name="cases">${esc(d.cases||"")}</textarea></div>
      <div class="field"><label>ملاحظات التنسيق</label><textarea name="notes_coord">${esc(d.notes_coord||"")}</textarea></div>
    </form>`;
    const foot=`<button class="btn btn-primary" id="save-doc">${doc?"حفظ التعديلات":"إضافة"}</button>
      <button class="btn btn-ghost" data-x2>إلغاء</button>`;
    openModal({title:(doc?("تعديل: "+doc.name):"إضافة ممارس"),bodyHTML:body,footHTML:foot,wide:true,onMount:(m)=>{
      m.querySelector("[data-x2]").onclick=closeModal;
      function _syncSchedFromDOM(container, ss) {
        ss.forEach((row, idx) => {
          if (row.off) return;
          row.shifts.forEach((sh, si) => {
            const sEl = container.querySelector(`[data-tp="s-${idx}-${si}"]`);
            const eEl = container.querySelector(`[data-tp="e-${idx}-${si}"]`);
            if (sEl) sh.start = readTP(sEl);
            if (eEl) sh.end = readTP(eEl);
          });
        });
      }
      function _applyAllDays(container, ss) {
        _syncSchedFromDOM(container, ss);
        const source = ss.find(r => !r.off && r.shifts.length > 0);
        if (!source) { toast("لا يوجد يوم مفعّل لنسخه","err"); return; }
        const hasData = ss.some(r => r !== source && !r.off && r.shifts.length > 0);
        if (hasData && !confirm("سيتم استبدال جدول جميع الأيام بجدول يوم " + DAYS[source.day] + ". متأكد؟")) return;
        ss.forEach(r => {
          if (r === source) return;
          r.off = false;
          r.shifts = source.shifts.map(s => ({start:s.start, end:s.end}));
        });
        buildSchedUI(container, ss);
        toast("✅ تم تطبيق جدول الدوام على جميع الأيام بنجاح","ok");
      }
      function buildSchedUI(container,ss){
        container.innerHTML=ss.map((row,idx)=>`
          <div class="sched-day-block" data-srow="${idx}">
            <div class="sched-row${row.off?" sched-row-off":""}">
              <div class="sched-day-lbl">${DAYS[row.day]}</div>
              <div class="sched-mid">${row.off?'<span class="sched-off-tag">إجازة أسبوعية</span>':
                row.shifts.map((sh,si)=>`<div class="sched-shift-line" data-si="${si}">
                  <div class="shift-row"><span class="shift-lbl">بداية</span>${mkTP(sh.start,`s-${idx}-${si}`)}</div>
                  <span class="sched-sep">–</span>
                  <div class="shift-row"><span class="shift-lbl">نهاية</span>${mkTP(sh.end,`e-${idx}-${si}`)}${row.shifts.length>1?`<button type="button" class="sbtn sbtn-del" data-del="${si}">✕</button>`:""}</div>
                </div>`).join("")}</div>
              <div class="sched-btns">
                ${!row.off&&row.shifts.length<2?`<button type="button" class="sbtn sbtn-add sadd">＋ شفت ثاني</button>`:""}
                <button type="button" class="sbtn stoggle">${row.off?"تفعيل":"يوم إجازة"}</button>
              </div>
            </div>
            ${!row.off?`<div class="sched-apply-row"><button type="button" class="sapply">📋 تطبيق على الكل</button></div>`:""}</div>`).join("");
        // Force iOS Safari to visually display the selected option in each <select>
        container.querySelectorAll(".tp-s").forEach(sel=>{const v=sel.value;sel.value="";sel.value=v;});
        // Wire up value-display spans and keep them in sync with selects
        container.querySelectorAll(".tp[data-tp]").forEach(tp=>{
          const hSel=tp.querySelector(".tp-h"),mSel=tp.querySelector(".tp-m"),apSel=tp.querySelector(".tp-ap");
          const vH=tp.querySelector(".tp-vh"),vM=tp.querySelector(".tp-vm"),vAP=tp.querySelector(".tp-vap");
          const upd=()=>{if(vH)vH.textContent=hSel.value;if(vM)vM.textContent=String(+mSel.value).padStart(2,"0");if(vAP)vAP.textContent=apSel.value==="am"?"ص":"م";};
          hSel.addEventListener("change",upd);mSel.addEventListener("change",upd);apSel.addEventListener("change",upd);
        });
        container.querySelectorAll("[data-srow]").forEach(rowEl=>{
          const idx=+rowEl.dataset.srow,row=ss[idx];
          rowEl.querySelector(".stoggle").onclick=()=>{row.off=!row.off;buildSchedUI(container,ss);};
          rowEl.querySelectorAll(".sapply").forEach(b=>b.onclick=()=>_applyAllDays(container,ss));
          if(!row.off){
            const addBtn=rowEl.querySelector(".sadd");
            if(addBtn)addBtn.onclick=()=>{row.shifts.push({start:"08:00",end:"16:00"});buildSchedUI(container,ss);};
            rowEl.querySelectorAll("[data-del]").forEach(btn=>btn.onclick=()=>{row.shifts.splice(+btn.dataset.del,1);buildSchedUI(container,ss);});
          }
        });
      }
      const _schedGrid = m.querySelector("#sched-grid");
      buildSchedUI(_schedGrid, schedState);
      // ── قائمة تخصص منسدلة قابلة للبحث (خانة البحث ضمن القائمة) — من الأقسام المسجّلة فقط ──
      (function initSpecDD(){
        const wrap=m.querySelector("#spec-ss"), trigger=m.querySelector("#spec-trigger"),
              panel=m.querySelector("#spec-panel"), search=m.querySelector("#spec-search"),
              listEl=m.querySelector("#spec-list"), valEl=m.querySelector("#spec-val"),
              hidden=m.querySelector("#spec-input");
        if(!wrap) return;
        const renderList=()=>{
          const q=normAr((search.value||"").trim());
          const matched=q?specList.filter(s=>normAr(s).includes(q)):specList;
          listEl.innerHTML=matched.length
            ? matched.map(s=>`<div class="ss-opt${hidden.value===s?" sel":""}" data-v="${esc(s)}">${esc(s)}</div>`).join("")
            : `<div class="ss-empty">لا قسم مطابق — أضِفه أولاً من إدارة الأقسام</div>`;
        };
        const onDocClick=e=>{ if(!wrap.contains(e.target)) close(); };
        const open=()=>{ panel.hidden=false; wrap.classList.add("open"); search.value=""; renderList();
          setTimeout(()=>search.focus(),30); document.addEventListener("click",onDocClick); };
        const close=()=>{ panel.hidden=true; wrap.classList.remove("open"); document.removeEventListener("click",onDocClick); };
        trigger.onclick=()=>{ panel.hidden?open():close(); };
        search.addEventListener("input",renderList);
        listEl.addEventListener("click",e=>{
          const opt=e.target.closest(".ss-opt"); if(!opt) return;
          const v=opt.getAttribute("data-v");
          hidden.value=v; valEl.textContent=v; valEl.classList.remove("ss-ph");
          close();
        });
      })();
      m.querySelector("#save-doc").onclick=async()=>{
        const f=new FormData(m.querySelector("#docf"));
        const payload=Object.fromEntries(f.entries());
        payload.branch_id=+payload.branch_id;
        // التخصص إلزامي ومن الأقسام المعتمدة فقط
        if(!payload.specialty||!specList.includes(payload.specialty)){ toast("اختر التخصص من قائمة الأقسام","warn"); return; }
        // زر الحفظ عادي (بلا submit) فلا يُفعِّل تحقق required الخاص بالمتصفح —
        // تحقق يدوي هنا يمنع حفظ بطاقة ناقصة بصمت (الخادم يرفضها أيضاً كخط دفاع أخير).
        for(const [key,label] of [["name","الاسم"],["rank","الرتبة / التخصص الدقيق"],
            ["nationality","الجنسية"],["gender","الجنس"],["experience","سنوات الخبرة"]]){
          if(!payload[key]||!String(payload[key]).trim()){ toast(`أدخل ${label}`,"warn"); return; }
        }
        payload.name=payload.name.trim();
        const schedule={},dayoff=[];
        const grid=m.querySelector("#sched-grid");
        schedState.forEach(({day,off,shifts},idx)=>{
          if(off){dayoff.push(day);return;}
          schedule[day]=shifts.map((s,si)=>{
            const startEl=grid.querySelector(`[data-tp="s-${idx}-${si}"]`);
            const endEl=grid.querySelector(`[data-tp="e-${idx}-${si}"]`);
            const st=startEl?readTP(startEl):s.start;
            const en=endEl?readTP(endEl):s.end;
            const sm=timeToMin(st), em=timeToMin(en);
            return [sm, em<sm ? em+1440 : em];
          });
        });
        // تنبيه وقائي: ورديات أطول من 16 ساعة غالباً خطأ ص/م عند الإدخال
        const longShifts=[];
        Object.entries(schedule).forEach(([day,shifts])=>{
          shifts.forEach(([s,e])=>{ if(e-s>16*60) longShifts.push([+day,s,e]); });
        });
        if(longShifts.length){
          const dayNames=["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
          const lines=longShifts.map(([day,s,e])=>`• ${dayNames[day]}: ${fmtMin(s%1440)} ← ${fmtMin(e%1440)} (${((e-s)/60).toFixed(1)} ساعة)`).join("\n");
          if(!confirm(`⚠️ لديك ورديات طويلة جداً (أكثر من 16 ساعة):\n\n${lines}\n\nقد يكون السبب خطأ في ص/م (مثلاً 4:30م بدل 4:30ص).\nتأكد من أوقات البداية والنهاية.\n\nهل تريد الحفظ رغم ذلك؟`)) return;
        }
        // تحذير تكرار الاسم — ممارس بنفس الاسم (بصرف النظر عن الهمزات/التاء المربوطة) في نفس الفرع.
        // ملاحظة: normalizeAr مُعرَّفة داخل LocalDB وغير مُصدَّرة، فلا تراها App —
        // استدعاؤها هنا كان يرمي ReferenceError خارج try فيتوقف الحفظ بصمت.
        const _normName=(v)=>(v||"").trim()
          .replace(/[\u064B-\u065F\u0670\u0640]/g,"")
          .replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه");
        if(!doc && payload.name){
          const nName=_normName(payload.name);
          const dup=existingDoctors.find(x=>x.branch_id===payload.branch_id && _normName(x.name)===nName);
          if(dup && !confirm(`⚠️ يوجد ممارس بنفس الاسم "${dup.name}" في هذا الفرع بالفعل.\n\nهل تريد المتابعة والإضافة كممارس جديد رغم ذلك؟`)) return;
        }
        payload.schedule=schedule; payload.dayoff=dayoff;
        delete payload.hours_raw;
        try{
          if(doc)await api("/doctors/"+doc.id,{method:"PUT",body:payload});
          else await api("/doctors",{method:"POST",body:payload});
          toast(doc?"✅ تم تحديث بيانات الممارس بنجاح":"✅ تمت إضافة الممارس بنجاح","ok"); closeModal();
          if(onDone) onDone(); else if(state.route==="control") drawDoctorsMgmtPanel(); else render();
        }catch(e){toast("❌ "+e.message,"err");}
      };
    }});
  }

  // ============================================================ AVAILABLE NOW
  routes.available=async()=>{
    shell(`<div class="loader"><div class="spin"></div></div>`);
    const d=await api("/available-now");
    const branchKeys=Object.keys(d.by_branch);
    const total=branchKeys.reduce((a,k)=>a+d.by_branch[k].length,0);
    let html=`<div class="page-title">⚡ من المتاح الآن؟</div>
      <div class="page-sub">${total} ممارس متواجد حالياً</div>`;
    if(!total){ html+=`<div class="empty"><div class="big">😴</div>لا يوجد ممارسون متواجدون حالياً</div>`; }
    branchKeys.forEach(k=>{ html+=`<div class="section-head"><h2>🏥 ${esc(k)}</h2><span class="count">${d.by_branch[k].length}</span></div>
      <div class="status-grid">${d.by_branch[k].map(doctorCard).join("")}</div>`; });
    $("#content").innerHTML=html; bindCards($("#content"));
  };

  // ============================================================ BEST DOCTOR
  routes.best=async()=>{
    shell(`<div class="loader"><div class="spin"></div></div>`);
    const [{specialties},{branches}]=await Promise.all([api("/specialties"),api("/branches")]);
    $("#content").innerHTML=`<div class="page-title">🎯 أفضل ممارس للحالة</div>
      <div class="page-sub">حدّد المعايير ليرتّب النظام الممارسين المناسبين والمتاحين</div>
      <div class="cal" style="margin-top:18px;max-width:760px">
        <div class="grid2">
          <div class="field"><label>التخصص</label><select id="b-spec"><option value="">أي تخصص</option>${specialties.map(s=>`<option>${esc(s)}</option>`).join("")}</select></div>
          <div class="field"><label>الفرع</label><select id="b-branch"><option value="">أي فرع</option>${branches.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join("")}</select></div>
          <div class="field"><label>الجنس</label><select id="b-gender"><option value="">أي</option><option>ذكر</option><option>أنثى</option></select></div>
        </div>
        <button class="btn btn-primary btn-block" id="b-go">🔎 ابحث عن الأنسب</button>
      </div>
      <div id="b-results" style="margin-top:18px"></div>`;
    $("#b-go").onclick=async()=>{
      const body={specialty:$("#b-spec").value,branch_id:+$("#b-branch").value||null,
        gender:$("#b-gender").value};
      const {results}=await api("/best-doctor",{method:"POST",body});
      const r=$("#b-results");
      if(!results.length){r.innerHTML=`<div class="empty">لا يوجد ممارس مطابق</div>`;return;}
      r.innerHTML=`<div class="section-head"><h2>النتائج مرتبة حسب التوافق والتواجد</h2><span class="count">${results.length}</span></div>
        <div class="status-grid">${results.map((d,i)=>doctorCard(d).replace('class="dcard',
          `data-rank="${i+1}" class="dcard`)).join("")}</div>`;
      bindCards(r);
    };
  };

  // ============================================================ CALENDAR
  routes.calendar=async()=>{
    shell(`<div class="loader"><div class="spin"></div></div>`);
    const {leaves}=await api("/leaves");
    const now=new Date(); const y=now.getFullYear(),mo=now.getMonth();
    const first=new Date(y,mo,1); const startDay=colOf(first.getDay());
    const daysIn=new Date(y,mo+1,0).getDate();
    const monthNames=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
    const evByDay={};
    leaves.forEach(l=>{ const s=new Date(l.start_date),e=new Date(l.end_date);
      for(let dt=new Date(s);dt<=e;dt.setDate(dt.getDate()+1)){
        if(dt.getFullYear()===y&&dt.getMonth()===mo){(evByDay[dt.getDate()]=evByDay[dt.getDate()]||[]).push(l);}}});
    let cells="";
    for(let i=0;i<startDay;i++)cells+=`<div></div>`;
    for(let dnum=1;dnum<=daysIn;dnum++){ const evs=evByDay[dnum]||[];
      const isToday=dnum===now.getDate();
      cells+=`<div class="cal-cell ${isToday?"today":""}"><div class="d">${dnum}</div>
        ${evs.slice(0,3).map(e=>`<div class="cal-ev" title="${esc(e.doctor_name)} - ${esc(e.type)}">${esc(e.doctor_name)}</div>`).join("")}
        ${evs.length>3?`<div class="cal-ev">+${evs.length-3}</div>`:""}</div>`;
    }
    const upcoming=leaves.filter(l=>new Date(l.end_date)>=new Date()).sort((a,b)=>a.start_date.localeCompare(b.start_date)).slice(0,12);
    $("#content").innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div><div class="page-title">📅 تقويم الإجازات</div><div class="page-sub">${monthNames[mo]} ${y}</div></div>
        ${can("leave_manage")?`<button class="btn btn-primary" id="add-leave">＋ إضافة إجازة</button>`:""}
      </div>
      <div class="cal" style="margin-top:16px">
        <div class="cal-head">${WEEK_ORDER.map(i=>`<div>${DAYS[i]}</div>`).join("")}</div>
        <div class="cal-grid">${cells}</div>
      </div>
      <div class="section-head"><h2>الإجازات القادمة</h2><span class="count">${upcoming.length}</span></div>
      ${upcoming.length?`<table class="tbl"><thead><tr><th>الممارس</th><th>الفرع</th><th>النوع</th><th>من</th><th>إلى</th>${can("leave_manage")?"<th></th>":""}</tr></thead>
        <tbody>${upcoming.map(l=>`<tr><td>${esc(l.doctor_name)}</td><td>${esc(l.branch_name||"")}</td><td>${esc(l.type)}</td>
          <td>${esc(l.start_date)}</td><td>${esc(l.end_date)}</td>
          ${can("leave_manage")?`<td><button class="btn btn-ghost btn-sm" data-dl="${l.id}">حذف</button></td>`:""}</tr>`).join("")}</tbody></table>`
        :`<div class="empty">لا توجد إجازات قادمة</div>`}`;
    const al=$("#add-leave"); if(al)al.onclick=()=>leaveForm();
    $("#content").querySelectorAll("[data-dl]").forEach(b=>b.onclick=async()=>{
      if(!confirm("حذف الإجازة؟"))return; await api("/leaves/"+b.dataset.dl,{method:"DELETE"});toast("✅ تم حذف الإجازة بنجاح","ok");render();});
  };

  const LEAVE_TYPES=["إجازة سنوية","إجازة طارئة","إجازة مرضية","ندب","أخرى","إنهاء عقد"];

  async function leaveForm(docId,docName,onDone,presetType){
    const [{doctors},{branches}]=await Promise.all([api("/doctors"),api("/branches")]);
    const _n=new Date(),_p=x=>String(x).padStart(2,'0');
    const _today=`${_n.getFullYear()}-${_p(_n.getMonth()+1)}-${_p(_n.getDate())}`;
    const _tom=new Date(_n); _tom.setDate(_tom.getDate()+1);
    const _tomorrow=`${_tom.getFullYear()}-${_p(_tom.getMonth()+1)}-${_p(_tom.getDate())}`;
    // إذا فُتح النموذج من بطاقة ممارس → تثبيت الممارس وإخفاء خيار التغيير (تقليل الأخطاء)
    const lockDoc=!!docId;
    const _lockedDoc=lockDoc?(doctors.find(d=>String(d.id)===String(docId))||{name:docName||"",specialty:"",id:docId}):null;
    const docFieldHTML=lockDoc
      ? `<div class="field"><label>الممارس</label>
          <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-s);background:var(--surface2);font-weight:600">
            👤 ${esc(_lockedDoc.name)}${_lockedDoc.specialty?` <span style="font-weight:400;color:var(--muted);font-size:12px">— ${esc(_lockedDoc.specialty)} (#${esc(String(docId))})</span>`:""}
          </div>
          <input type="hidden" name="doctor_id" id="lv-doc-sel" value="${esc(String(docId))}"></div>`
      : `<div class="field"><label>الممارس *</label>
          <input type="text" id="lv-doc-search" placeholder="🔍 ابحث بالاسم أو جزء منه أو رمز الممارس..." autocomplete="off" style="margin-bottom:6px">
          <select name="doctor_id" id="lv-doc-sel" required size="1">
          ${doctors.map(d=>`<option value="${d.id}" ${docId==d.id?"selected":""}>${esc(d.name)} — ${esc(d.specialty)} (#${d.id})</option>`).join("")}</select>
          <div id="lv-doc-count" style="font-size:11px;color:var(--muted);margin-top:3px"></div></div>`;
    const body=`<form id="lvf">
      ${docFieldHTML}
      <div id="lv-existing" style="margin:-4px 0 12px"></div>
      <div class="field"><label>النوع</label><select name="type" id="lv-type">
        ${LEAVE_TYPES.map(t=>`<option ${presetType===t?"selected":""}>${t}</option>`).join("")}</select></div>
      <div class="grid2" id="lv-dates-row">
        <div class="field"><label>من تاريخ *</label><input type="date" name="start_date" id="lv-start" value="${_today}"></div>
        <div class="field"><label>إلى تاريخ *</label><input type="date" name="end_date" id="lv-end" value="${_tomorrow}"></div>
      </div>
      <div class="field" id="lv-term-field" style="display:none">
        <label>📅 تاريخ إنهاء العقد *</label>
        <input type="date" name="term_date" id="lv-term-date" value="${_today}">
        <div style="font-size:11.5px;color:var(--muted);margin-top:4px">يصبح الممارس "منتهي العقد" تلقائياً عند وصول هذا التاريخ (حالة دائمة).</div>
      </div>
      <div class="field" id="lv-secmode-field" style="display:none">
        <label>نوع الندب *</label>
        <select name="sec_mode" id="lv-secmode">
          <option value="full">ندب كامل — طوال اليوم</option>
          <option value="shift">ندب شفت — فترة محددة فقط</option>
        </select>
      </div>
      <div class="field" id="lv-shift-field" style="display:none">
        <label>الشفت *</label>
        <select name="shift" id="lv-shift"></select>
        <div style="font-size:11.5px;color:var(--muted);margin-top:4px" id="lv-shift-hint">
          الورديات المعروضة من جدول دوام الممارس نفسه. يمكن إضافة ندب آخر لوردية أخرى بنفس التواريخ.
        </div>
      </div>
      <div class="field" id="lv-branch-field" style="display:none">
        <label>الفرع المنتدب إليه *</label>
        <select name="secondment_branch_id" id="lv-branch-sel">
          <option value="">اختر الفرع...</option>
          ${branches.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>ملاحظات</label><input name="reason"></div>
    </form>`;
    openModal({title:"إضافة إجازة"+(docName?" — "+docName:""),bodyHTML:body,
      footHTML:`<button class="btn btn-primary" id="save-lv">حفظ</button><button class="btn btn-ghost" data-x3>إلغاء</button>`,
      onMount:(m)=>{ m.querySelector("[data-x3]").onclick=closeModal;
        // إظهار/إخفاء الحقول حسب النوع
        const typeEl=m.querySelector("#lv-type"), branchField=m.querySelector("#lv-branch-field");
        const datesRow=m.querySelector("#lv-dates-row"), termField=m.querySelector("#lv-term-field");
        const secModeField=m.querySelector("#lv-secmode-field"), secModeEl=m.querySelector("#lv-secmode");
        const shiftField=m.querySelector("#lv-shift-field");
        const syncFields=()=>{
          const isTerm=typeEl.value==="إنهاء عقد", isSec=typeEl.value==="ندب";
          datesRow.style.display=isTerm?"none":"";
          termField.style.display=isTerm?"":"none";
          branchField.style.display=isSec?"":"none";
          secModeField.style.display=isSec?"":"none";
          shiftField.style.display=(isSec&&secModeEl.value==="shift")?"":"none";
        };
        // قائمة الورديات تُبنى من جدول دوام الممارس المختار — لا قيم ثابتة
        const shiftSel=m.querySelector("#lv-shift"), shiftHint=m.querySelector("#lv-shift-hint");
        const fillShifts=()=>{
          const did=+((m.querySelector("#lv-doc-sel")||{}).value||docId||0);
          const list=(typeof LocalDB!=="undefined"&&LocalDB.doctorShifts)?LocalDB.doctorShifts(did):[];
          shiftSel.innerHTML=list.length
            ? list.map(x=>`<option value="${esc(x.key)}">${esc(x.label)}</option>`).join("")
            : `<option value="">لا توجد ورديات مسجّلة لهذا الممارس</option>`;
          shiftHint.textContent=list.length
            ? "الورديات المعروضة من جدول دوام الممارس نفسه. يمكن إضافة ندب آخر لوردية أخرى بنفس التواريخ."
            : "⚠️ لا يمكن إنشاء ندب شفت — أضف ورديات لجدول دوام الممارس أولاً.";
        };
        typeEl.addEventListener("change",()=>{ syncFields(); fillShifts(); });
        secModeEl.addEventListener("change",()=>{ syncFields(); fillShifts(); });
        syncFields(); fillShifts();
        // عرض السجلات الحالية للممارس المختار + اقتراح تاريخ بداية بعد آخر سجل (لتفادي التعارض)
        const docSel=m.querySelector("#lv-doc-sel"), exWrap=m.querySelector("#lv-existing");
        // ── بحث حي في قائمة الممارسين (اسم / جزء اسم / رمز) مع ترتيب أفضل تطابق ──
        const docSearch=m.querySelector("#lv-doc-search"), docCount=m.querySelector("#lv-doc-count");
        // يستخدم الدالة المركزية scoreDoctorMgmt (اسم + تخصص + رمز + fuzzy)
        const rankDoc=(q,d)=>scoreDoctorMgmt(q,d,{});
        const rebuildDocs=()=>{
          const q=(docSearch.value||"").trim(); const cur=docSel.value;
          const ranked=doctors.map(d=>({d,s:rankDoc(q,d)})).filter(x=>x.s>0)
            .sort((a,b)=>b.s-a.s||(a.d.name||"").localeCompare(b.d.name||"")).map(x=>x.d);
          docSel.innerHTML=ranked.map(d=>`<option value="${d.id}">${esc(d.name)} — ${esc(d.specialty)} (#${d.id})</option>`).join("");
          // إبقاء الاختيار الحالي إن بقي ضمن النتائج، وإلا اختيار الأول
          if(ranked.some(d=>String(d.id)===cur))docSel.value=cur;
          else if(ranked.length){docSel.value=String(ranked[0].id);}
          docCount.textContent=q?`${ranked.length} نتيجة`:"";
          if(docSel.value!==cur)loadExisting(docSel.value);
        };
        if(docSearch)docSearch.addEventListener("input",rebuildDocs);
        const addDays=(iso,n)=>{const dt=new Date(iso+"T00:00:00");dt.setDate(dt.getDate()+n);return `${dt.getFullYear()}-${_p(dt.getMonth()+1)}-${_p(dt.getDate())}`;};
        const loadExisting=async(id)=>{
          if(!id){exWrap.innerHTML="";return;}
          let recs=[], doctorObj=null;
          try{ const {doctor}=await api("/doctors/"+id); doctorObj=doctor; recs=(doctor&&doctor.leaves||[]).slice().sort((a,b)=>a.start_date.localeCompare(b.start_date)); }catch(e){}
          const termSchedNote=doctorObj&&doctorObj.termination_scheduled
            ?`<div style="font-size:12px;background:#fef3c7;border:1px solid #d97706;border-radius:8px;padding:5px 9px;margin-bottom:5px;color:#92400e">⏳ إنهاء عقد مجدول بتاريخ ${esc(fmtDate(doctorObj.termination_scheduled))}</div>`:"";
          if(!recs.length){ exWrap.innerHTML=termSchedNote+`<div style="font-size:12px;color:var(--muted)">لا توجد سجلات سابقة لهذا الممارس</div>`; return; }
          exWrap.innerHTML=termSchedNote+`<div style="font-size:12px;color:var(--muted);margin-bottom:5px">السجلات الحالية والمجدولة (${recs.length}):</div>
            <div style="display:flex;flex-direction:column;gap:4px;max-height:120px;overflow:auto">
            ${recs.map(l=>`<div style="font-size:12px;background:var(--surface2);border:1px solid var(--line);border-radius:8px;padding:5px 9px">
              ${l.type==="ندب"?"🔀":"🔴"} ${esc(l.type||"إجازة")} · ${esc(fmtDate(l.start_date))} ← ${esc(fmtDate(l.end_date))}</div>`).join("")}</div>`;
          // اقترح البداية بعد آخر سجل ينتهي
          const latestEnd=recs.reduce((mx,l)=>l.end_date>mx?l.end_date:mx,"");
          if(latestEnd){ const suggest=addDays(latestEnd,1); const nxt=suggest>_today?suggest:_today;
            m.querySelector("#lv-start").value=nxt; m.querySelector("#lv-end").value=addDays(nxt,1); }
        };
        // تغيير الممارس ⇒ إعادة بناء قائمة ورديته أيضاً
        docSel&&docSel.addEventListener("change",()=>{ loadExisting(docSel.value); fillShifts(); });
        if(docId) loadExisting(docId);
        m.querySelector("#save-lv").onclick=async()=>{
          const f=new FormData(m.querySelector("#lvf")); const p=Object.fromEntries(f.entries());
          p.doctor_id=+p.doctor_id;
          if(p.type==="ندب"&&!p.secondment_branch_id){toast("اختر الفرع المنتدب إليه","warn");return;}
          // ندب شفت: يُرسَل حقل shift. ندب كامل: يُحذف تماماً (سلوك قديم حرفياً)
          if(p.type==="ندب"&&p.sec_mode==="shift"){
            if(!p.shift){toast("اختر الشفت من ورديات الممارس","warn");return;}
          } else { delete p.shift; }
          delete p.sec_mode;
          // إنهاء عقد — تاريخ واحد فقط (حالة دائمة)؛ فوري إن كان اليوم/سابقاً، ومجدول إن كان مستقبلاً
          if(p.type==="إنهاء عقد"){
            const dName=(doctors.find(d=>d.id===p.doctor_id)||{}).name||"الممارس";
            const termDate=p.term_date;
            if(!termDate){toast("أدخل تاريخ إنهاء العقد","warn");return;}
            const isFuture=termDate>_today;
            const msg=isFuture
              ?`جدولة إنهاء عقد "${dName}" بتاريخ ${termDate}؟\nسيستمر بالعمل حتى ذلك التاريخ ثم يصبح "منتهي العقد" تلقائياً.`
              :`هل تريد إنهاء عقد "${dName}" الآن؟\nسيتم إخفاؤه من جميع الواجهات التشغيلية.`;
            if(!confirm(msg)) return;
            try{
              await api("/doctors/"+p.doctor_id+"/terminate",{method:"POST",body:{date:termDate}});
              toast(isFuture?`✅ تمت جدولة إنهاء عقد ${dName} بتاريخ ${termDate}`:"✅ تم إنهاء عقد "+dName,"ok");
              closeModal();
              if(typeof onDone==="function") onDone(); else go(state.route);
            }catch(e){toast("❌ "+e.message,"err");}
            return;
          }
          if(!p.start_date||!p.end_date){toast("أدخل التواريخ","warn");return;}
          if(p.start_date>p.end_date){toast("❌ تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء","err");return;}
          try{
            await api("/leaves",{method:"POST",body:p});
            toast("✅ تمت إضافة الإجازة بنجاح","ok");
            closeModal();
            if(typeof onDone==="function") onDone(); else go(state.route);
          }catch(e){toast("❌ "+e.message,"err");}
        };}});
  }

  async function leaveEditForm(lv,onDone){
    const {branches}=await api("/branches");
    // ورديات هذا الممارس كما هي مسجّلة — مصدر خيارات الشفت
    const _lveShifts=(typeof LocalDB!=="undefined"&&LocalDB.doctorShifts)?LocalDB.doctorShifts(lv.doctor_id):[];
    const body=`<form id="lvf-edit">
      <div class="grid2">
        <div class="field"><label>من تاريخ *</label><input type="date" name="start_date" value="${esc(lv.start_date)}" required></div>
        <div class="field"><label>إلى تاريخ *</label><input type="date" name="end_date" value="${esc(lv.end_date)}" required></div>
      </div>
      <div class="field"><label>النوع</label><select name="type" id="lve-type">
        ${LEAVE_TYPES.map(t=>`<option ${(lv.type||"")==t?"selected":""}>${t}</option>`).join("")}</select></div>
      <div class="field" id="lve-secmode-field" style="display:${lv.type==="ندب"?"":"none"}">
        <label>نوع الندب *</label>
        <select name="sec_mode" id="lve-secmode">
          <option value="full" ${!lv.shift?"selected":""}>ندب كامل — طوال اليوم</option>
          <option value="shift" ${lv.shift?"selected":""}>ندب شفت — فترة محددة فقط</option>
        </select>
      </div>
      <div class="field" id="lve-shift-field" style="display:${(lv.type==="ندب"&&lv.shift)?"":"none"}">
        <label>الشفت *</label>
        <select name="shift" id="lve-shift">
          ${(_lveShifts.length?_lveShifts:[]).map(x=>`<option value="${esc(x.key)}" ${lv.shift===x.key?"selected":""}>${esc(x.label)}</option>`).join("")}
          ${(lv.shift&&!_lveShifts.some(x=>x.key===lv.shift))?`<option value="${esc(lv.shift)}" selected>${esc(lv.shift_label||lv.shift)} (غير مسجّلة حالياً في الجدول)</option>`:""}
          ${!_lveShifts.length&&!lv.shift?`<option value="">لا توجد ورديات مسجّلة لهذا الممارس</option>`:""}
        </select>
        <div style="font-size:11.5px;color:var(--muted);margin-top:4px">الورديات من جدول دوام الممارس نفسه.</div>
      </div>
      <div class="field" id="lve-branch-field" style="display:${lv.type==="ندب"?"":"none"}">
        <label>الفرع المنتدب إليه *</label>
        <select name="secondment_branch_id" id="lve-branch-sel">
          <option value="">اختر الفرع...</option>
          ${branches.map(b=>`<option value="${b.id}" ${lv.secondment_branch_id==b.id?"selected":""}>${esc(b.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>ملاحظات</label><input name="reason" value="${esc(lv.reason||"")}"></div>
    </form>`;
    openModal({title:"تعديل إجازة"+(lv.doctor_name?" — "+lv.doctor_name:""),bodyHTML:body,
      footHTML:`<button class="btn btn-primary" id="save-lv-edit">حفظ</button><button class="btn btn-ghost" data-xe>إلغاء</button>`,
      onMount:(m)=>{ m.querySelector("[data-xe]").onclick=closeModal;
        const typeEl=m.querySelector("#lve-type"), branchField=m.querySelector("#lve-branch-field");
        const secModeField=m.querySelector("#lve-secmode-field"), secModeEl=m.querySelector("#lve-secmode");
        const shiftField=m.querySelector("#lve-shift-field");
        const syncE=()=>{
          const isSec=typeEl.value==="ندب";
          branchField.style.display=isSec?"":"none";
          secModeField.style.display=isSec?"":"none";
          shiftField.style.display=(isSec&&secModeEl.value==="shift")?"":"none";
        };
        typeEl.addEventListener("change",syncE);
        secModeEl.addEventListener("change",syncE);
        syncE();
        m.querySelector("#save-lv-edit").onclick=async()=>{
          const f=new FormData(m.querySelector("#lvf-edit")); const p=Object.fromEntries(f.entries());
          if(!p.start_date||!p.end_date){toast("أدخل التواريخ","warn");return;}
          if(p.type==="ندب"&&!p.secondment_branch_id){toast("اختر الفرع المنتدب إليه","warn");return;}
          if(p.type==="ندب"&&p.sec_mode==="shift"){
            if(!p.shift){toast("اختر الشفت من ورديات الممارس","warn");return;}
          } else { p.shift=""; }   // فراغ = تحويل لندب كامل (الخادم يحذف الحقل)
          delete p.sec_mode;
          if(p.start_date>p.end_date){toast("❌ تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء","err");return;}
          try{
            await api("/leaves/"+lv.id,{method:"PUT",body:p});
            toast("✅ تم تعديل الإجازة بنجاح","ok");
            closeModal();
            if(typeof onDone==="function") onDone(); else go(state.route);
          }catch(e){toast("❌ "+e.message,"err");}
        };}});
  }

  // ============================================================ AUDIT
  routes.audit=async()=>{
    shell(`<div class="loader"><div class="spin"></div></div>`);
    const {audit}=await api("/audit");
    $("#content").innerHTML=`<div class="page-title">📋 سجل التعديلات</div>
      <div class="page-sub">${audit.length} عملية محفوظة — الأحدث أولاً</div>
      <table class="tbl" style="margin-top:16px"><thead><tr><th>الوقت</th><th>المستخدم</th><th>العملية</th><th>التفاصيل</th></tr></thead>
      <tbody>${audit.map(a=>`<tr><td style="white-space:nowrap">${esc(a.ts.replace("T"," "))}</td>
        <td>${esc(a.user)}</td><td>${esc(a.action)}</td><td style="white-space:pre-line">${esc(a.detail||"")}</td></tr>`).join("")}</tbody></table>`;
  };

  // ============================================================ PRACTITIONERS MANAGEMENT (control panel tab)
  async function drawDoctorsMgmtPanel(){
    const [{doctors},{branches}]=await Promise.all([api("/doctors?archived=1&terminated=1"),api("/branches")]);
    const bname={}; branches.forEach(b=>bname[b.id]=b.name);
    const active=doctors.filter(d=>!d.archived&&!d.terminated), arch=doctors.filter(d=>d.archived), termed=doctors.filter(d=>d.terminated);

    const renderCards=(list,isArch)=>{
      if(!list.length) return `<div class="empty" style="padding:16px">لا يوجد</div>`;
      return `<div class="mgr-cards">
        ${list.map(d=>`<div class="mgr-card">
          ${avatar(d)}
          <div class="mgr-card-body">
            <div class="mgr-card-name">${esc(d.name)}</div>
            <div class="mgr-card-meta">
              ${d.specialty?`<span class="spec-tag">${esc(d.specialty)}</span>`:""}
              ${bname[d.branch_id]?`<span>🏥 ${esc(bname[d.branch_id])}</span>`:""}
              ${d.nationality?`<span>· ${esc(d.nationality)}</span>`:""}
            </div>
          </div>
          <div class="mgr-card-actions">
            <button class="btn btn-ghost btn-xs" data-edit-doc="${d.id}">✎</button>
            <button class="btn btn-ghost btn-xs" data-arch="${d.id}" data-unarch="${isArch?1:0}">${isArch?"استرجاع":"أرشفة"}</button>
            <button class="btn btn-danger btn-xs" data-del="${d.id}">حذف</button>
          </div>
        </div>`).join("")}
      </div>`;
    };

    const bindEvents=()=>{
      document.querySelectorAll("[data-edit-doc]").forEach(btn=>btn.onclick=()=>{
        const d=doctors.find(x=>String(x.id)===btn.dataset.editDoc); if(d)requirePerm("doctor_edit",()=>doctorForm(d),d.branch_id,d.specialty);
      });
      document.querySelectorAll("[data-arch]").forEach(btn=>btn.onclick=()=>{
        const d=doctors.find(x=>String(x.id)===btn.dataset.arch);
        const bid=d?d.branch_id:undefined;
        const spec=d?d.specialty:undefined;
        const u=+btn.dataset.unarch;
        requirePerm("doctor_delete",async()=>{
          await api("/doctors/"+btn.dataset.arch+"/archive",{method:"POST",body:{unarchive:u}});
          toast(u?"✅ تم استرجاع الممارس بنجاح":"✅ تمت أرشفة الممارس بنجاح","ok"); drawDoctorsMgmtPanel();
        },bid,spec);
      });
      document.querySelectorAll("[data-unterm]").forEach(btn=>btn.onclick=()=>{
        const d=doctors.find(x=>String(x.id)===btn.dataset.unterm);
        const bid=d?d.branch_id:undefined, spec=d?d.specialty:undefined;
        requirePerm("doctor_edit",async()=>{
          if(!confirm(`إعادة تفعيل "${d?d.name:"الممارس"}"؟`))return;
          await api("/doctors/"+btn.dataset.unterm+"/terminate",{method:"POST",body:{unterm:1}});
          toast("✅ تم إعادة تفعيل الممارس","ok"); drawDoctorsMgmtPanel();
        },bid,spec);
      });
      document.querySelectorAll("[data-del]").forEach(btn=>btn.onclick=()=>{
        const d=doctors.find(x=>String(x.id)===btn.dataset.del);
        const bid=d?d.branch_id:undefined;
        const spec=d?d.specialty:undefined;
        requirePerm("doctor_delete",async()=>{
          if(!confirm("حذف الممارس نهائياً؟ لا يمكن التراجع."))return;
          await api("/doctors/"+btn.dataset.del,{method:"DELETE"});
          toast("✅ تم حذف الممارس بنجاح","ok"); drawDoctorsMgmtPanel();
        },bid,spec);
      });
    };

    const sortedByScore=(list,q)=>
      list.map(d=>({d,s:scoreDoctorMgmt(q,d,bname)}))
          .filter(x=>x.s>0)
          .sort((a,b)=>b.s-a.s||(a.d.name.localeCompare(b.d.name)))
          .map(x=>x.d);

    let archOpen=false;

    const renderTermCards=(list)=>{
      if(!list.length) return `<div class="empty" style="padding:16px">لا يوجد</div>`;
      return `<div class="mgr-cards">
        ${list.map(d=>`<div class="mgr-card" style="border-inline-start:3px solid #475569">
          ${avatar(d)}
          <div class="mgr-card-body">
            <div class="mgr-card-name">${esc(d.name)}</div>
            <div class="mgr-card-meta">
              ${d.specialty?`<span class="spec-tag">${esc(d.specialty)}</span>`:""}
              ${bname[d.branch_id]?`<span>🏥 ${esc(bname[d.branch_id])}</span>`:""}
              ${d.terminated_date?`<span style="color:#475569">⛔ منذ ${esc(d.terminated_date)}</span>`:""}
            </div>
          </div>
          <div class="mgr-card-actions">
            <button class="btn btn-ghost btn-xs" data-unterm="${d.id}">↩ إعادة تفعيل</button>
            <button class="btn btn-danger btn-xs" data-del="${d.id}">حذف</button>
          </div>
        </div>`).join("")}
      </div>`;
    };

    const redraw=(q)=>{
      const activeList=q?sortedByScore(active,q):active;
      const archList=q?sortedByScore(arch,q):arch;
      const termList=q?sortedByScore(termed,q):termed;
      const activeEl=$("#active-rows"), archEl=$("#arch-rows"), termEl=$("#term-rows");
      if(activeEl) activeEl.innerHTML=renderCards(activeList,false);
      if(archEl){
        archEl.innerHTML=renderCards(archList,true);
        if(q&&archList.length&&!archOpen){ archEl.style.display=""; }
        else if(!q&&!archOpen){ archEl.style.display="none"; }
      }
      if(termEl){
        termEl.innerHTML=renderTermCards(termList);
        if(q&&termList.length){ termEl.style.display=""; }
        else if(!q){ termEl.style.display="none"; }
      }
      const cnt=$("#active-count"); if(cnt) cnt.textContent=activeList.length;
      bindEvents();
    };

    $("#ctrl-body").innerHTML=`
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center">
        <input class="search-input" id="mgr-search" style="flex:1;min-width:200px;border-radius:10px;padding:9px 14px;font-size:16px" placeholder="بحث: اسم، تخصص، فرع، جنسية...">
        <button class="btn btn-primary" id="add-doc-ctrl">＋ إضافة ممارس</button>
      </div>
      <div class="section-head"><h2>الممارسون النشطون</h2><span class="count" id="active-count">${active.length}</span></div>
      <div id="active-rows">${renderCards(active,false)}</div>
      ${termed.length?`
        <div>
          <div class="section-head" style="margin-top:20px;cursor:pointer" id="term-toggle">
            <h2 style="color:#475569">⛔ منتهو العقد</h2><span class="count" style="background:#e2e8f0;color:#334155">${termed.length}</span>
            <span style="font-size:12px;color:var(--muted);margin-inline-start:auto" id="term-chevron">▼</span>
          </div>
          <div id="term-rows" style="display:none">${renderTermCards(termed)}</div>
        </div>`:""}
      ${arch.length?`
        <div class="mgr-arch-section">
          <div class="section-head" style="margin-top:20px;cursor:pointer" id="arch-toggle">
            <h2>المؤرشفون</h2><span class="count">${arch.length}</span>
            <span style="font-size:12px;color:var(--muted);margin-inline-start:auto" id="arch-chevron">▼</span>
          </div>
          <div id="arch-rows" style="display:none">${renderCards(arch,true)}</div>
        </div>`:""}`;

    bindEvents();

    const termToggle=$("#term-toggle");
    if(termToggle) termToggle.onclick=()=>{
      const rows=$("#term-rows"), chev=$("#term-chevron");
      const open=rows.style.display==="none";
      rows.style.display=open?"":"none";
      if(chev) chev.textContent=open?"▲":"▼";
    };

    const archToggle=$("#arch-toggle");
    if(archToggle) archToggle.onclick=()=>{
      const rows=$("#arch-rows"), chev=$("#arch-chevron");
      archOpen=rows.style.display==="none";
      rows.style.display=archOpen?"":"none";
      if(chev) chev.textContent=archOpen?"▲":"▼";
    };

    $("#add-doc-ctrl").onclick=()=>doctorForm(null);

    let mgrSearchTimer;
    const mgrSearch=$("#mgr-search");
    if(mgrSearch) mgrSearch.addEventListener("input",()=>{
      clearTimeout(mgrSearchTimer);
      mgrSearchTimer=setTimeout(()=>redraw(mgrSearch.value.trim()),80);
    });
  }

  // ============================================================ LEAVES PANEL
  async function drawLeavesPanel(){
    const [{leaves:_allLv},{branches}]=await Promise.all([api("/leaves"),api("/branches")]);
    const leaves=_allLv.filter(l=>l.type!=="ندب"); // الندب في تبويب مستقل
    const today=(()=>{const n=new Date();const p=x=>String(x).padStart(2,'0');return `${n.getFullYear()}-${p(n.getMonth()+1)}-${p(n.getDate())}`;})();
    const lvStatus=(l)=>{if(l.end_date<today)return"expired";if(l.start_date>today)return"upcoming";return"active";};
    const activeL=leaves.filter(l=>lvStatus(l)==="active");
    const upcomingL=leaves.filter(l=>lvStatus(l)==="upcoming");
    const expiredL=leaves.filter(l=>lvStatus(l)==="expired");
    const specs=[...new Set(leaves.map(l=>l.specialty))].filter(Boolean).sort();

    let fBranch="",fSpec="",fSearch="",fStatus="",fFrom="",fTo="";

    const stBadge=(st)=>st==="active"
      ?`<span class="sp-leave" style="font-size:11px;padding:2px 8px">نشطة</span>`
      :st==="upcoming"
        ?`<span class="status-pill sp-upcoming" style="font-size:11px">قادمة</span>`
        :`<span class="status-pill sp-off" style="font-size:11px">منتهية</span>`;

    function drawList(){
      let list=leaves;
      if(fBranch) list=list.filter(l=>String(l.branch_id)===fBranch);
      if(fSpec)   list=list.filter(l=>l.specialty===fSpec);
      if(fSearch){const q=fSearch.toLowerCase();list=list.filter(l=>l.doctor_name.toLowerCase().includes(q));}
      if(fStatus) list=list.filter(l=>lvStatus(l)===fStatus);
      if(fFrom)   list=list.filter(l=>l.end_date>=fFrom);
      if(fTo)     list=list.filter(l=>l.start_date<=fTo);

      const el=$("#leaves-list"); if(!el)return;
      if(!list.length){el.innerHTML=`<div class="empty">لا نتائج</div>`;return;}
      const isMob=window.innerWidth<=860;
      if(isMob){
        el.innerHTML=`<div style="color:var(--muted);font-size:13px;margin-bottom:10px">${list.length} إجازة</div>
          <div class="leave-cards">
          ${list.map(l=>`
            <div class="leave-card" data-lid="${l.id}">
              <div class="lc-head">
                <span class="lc-name">${esc(l.doctor_name)}</span>
                ${l.synthetic?`<span class="status-pill sp-leave" style="font-size:11px">يدوي ⚙️</span>`:stBadge(lvStatus(l))}
              </div>
              <div class="lc-rows">
                <div class="lc-row"><span class="lc-lbl">🏥 الفرع</span><span class="lc-val">${esc(l.branch_name||"—")}</span></div>
                <div class="lc-row"><span class="lc-lbl">🩺 التخصص</span><span class="lc-val">${esc(l.specialty||"—")}</span></div>
                <div class="lc-row"><span class="lc-lbl">📋 النوع</span><span class="lc-val">${esc(l.type||"—")}</span></div>
                ${l.synthetic?"":`<div class="lc-row"><span class="lc-lbl">📅 الفترة</span><span class="lc-val">${esc(l.start_date)} ← ${esc(l.end_date)}</span></div>`}
              </div>
              ${l.synthetic
                ?`<div style="font-size:11px;color:var(--muted);margin-top:6px">من حالة الممارس</div>`
                :`<div class="lc-actions">
                    <button class="btn btn-ghost btn-sm" data-el='${esc(JSON.stringify(l))}'>✎ تعديل</button>
                    <button class="btn btn-danger btn-sm" data-dlo="${l.id}">حذف</button>
                  </div>`
              }
            </div>`).join("")}
          </div>`;
      } else {
        el.innerHTML=`<div style="color:var(--muted);font-size:13px;margin-bottom:8px">${list.length} إجازة</div>
          <table class="tbl"><thead><tr>
            <th>الممارس</th><th>الفرع</th><th>التخصص</th><th>النوع</th><th>من</th><th>إلى</th><th>الحالة</th><th></th>
          </tr></thead><tbody>
          ${list.map(l=>`<tr>
            <td><b>${esc(l.doctor_name)}</b></td>
            <td>${esc(l.branch_name||"—")}</td>
            <td>${esc(l.specialty||"—")}</td>
            <td>${esc(l.type||"—")}</td>
            <td>${l.synthetic?"—":esc(l.start_date)}</td>
            <td>${l.synthetic?"—":esc(l.end_date)}</td>
            <td>${l.synthetic?`<span class="status-pill sp-leave" style="font-size:11px">يدوي ⚙️</span>`:stBadge(lvStatus(l))}</td>
            <td style="white-space:nowrap">
              ${l.synthetic
                ?`<span style="font-size:11px;color:var(--muted)">من حالة الممارس</span>`
                :`<button class="btn btn-ghost btn-sm" data-el='${esc(JSON.stringify(l))}'>تعديل</button>
                  <button class="btn btn-danger btn-sm" data-dlo="${l.id}">حذف</button>`
              }
            </td></tr>`).join("")}
          </tbody></table>`;
      }
      el.querySelectorAll("[data-el]").forEach(btn=>btn.onclick=()=>{
        const lv=JSON.parse(btn.dataset.el);
        requirePerm("leave_manage",()=>leaveEditForm(lv,()=>{drawLeavesPanel();}),lv.branch_id,lv.specialty);
      });
      el.querySelectorAll("[data-dlo]").forEach(btn=>btn.onclick=()=>{
        const lid=btn.dataset.dlo;
        const lv=list.find(l=>String(l.id)===lid);
        requirePerm("leave_manage",async()=>{
          if(!confirm("حذف الإجازة؟"))return;
          try{await api("/leaves/"+lid,{method:"DELETE"});toast("✅ تم حذف الإجازة بنجاح","ok");drawLeavesPanel();}
          catch(e){toast("❌ "+e.message,"err");}
        },lv?lv.branch_id:undefined,lv?lv.specialty:undefined);
      });
    }

    $("#ctrl-body").innerHTML=`
      <div class="mini-stats" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
        <button class="mini-stat s-leave ${fStatus==="active"?"active":""}" data-fst="active">
          <span class="ms-ico">🔴</span><div><div class="ms-v">${activeL.length}</div><div class="ms-l">نشطة الآن</div></div>
        </button>
        <button class="mini-stat s-amber ${fStatus==="upcoming"?"active":""}" data-fst="upcoming">
          <span class="ms-ico">🕐</span><div><div class="ms-v">${upcomingL.length}</div><div class="ms-l">قادمة</div></div>
        </button>
        <button class="mini-stat s-black ${fStatus==="expired"?"active":""}" data-fst="expired">
          <span class="ms-ico">✅</span><div><div class="ms-v">${expiredL.length}</div><div class="ms-l">منتهية</div></div>
        </button>
      </div>
      <div class="toolbar" style="margin:0 0 14px;flex-wrap:wrap">
        <input class="search-input" id="lf-search" style="max-width:220px" placeholder="ابحث باسم الممارس...">
        <select class="select-mini" id="lf-branch"><option value="">كل الفروع</option>${branches.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join("")}</select>
        <select class="select-mini" id="lf-spec"><option value="">كل التخصصات</option>${specs.map(s=>`<option>${esc(s)}</option>`).join("")}</select>
        <select class="select-mini" id="lf-status">
          <option value="">كل الحالات</option>
          <option value="active">نشطة</option>
          <option value="upcoming">قادمة</option>
          <option value="expired">منتهية</option>
        </select>
        <div class="lf-dates-row">
          <label class="lf-date-wrap">
            <span class="lf-date-lbl">📅 تنتهي بعد</span>
            <input type="date" class="select-mini lf-date-inp" id="lf-from">
          </label>
          <label class="lf-date-wrap">
            <span class="lf-date-lbl">📅 تبدأ قبل</span>
            <input type="date" class="select-mini lf-date-inp" id="lf-to">
          </label>
        </div>
        <button class="btn btn-primary btn-sm" id="add-lv-panel">＋ إضافة إجازة</button>
      </div>
      <div id="leaves-list"></div>`;

    drawList();

    const bind=(id,fn)=>{const e=$("#"+id);if(e){e.addEventListener("input",fn);e.addEventListener("change",fn);}};
    bind("lf-search",()=>{fSearch=$("#lf-search").value.trim();drawList();});
    bind("lf-branch",()=>{fBranch=$("#lf-branch").value;drawList();});
    bind("lf-spec",()=>{fSpec=$("#lf-spec").value;drawList();});
    bind("lf-status",()=>{fStatus=$("#lf-status").value;drawList();});
    bind("lf-from",()=>{fFrom=$("#lf-from").value;drawList();});
    bind("lf-to",()=>{fTo=$("#lf-to").value;drawList();});

    $("#ctrl-body").querySelectorAll("[data-fst]").forEach(btn=>btn.onclick=()=>{
      fStatus=fStatus===btn.dataset.fst?"":btn.dataset.fst;
      const sel=$("#lf-status"); if(sel)sel.value=fStatus;
      $("#ctrl-body").querySelectorAll("[data-fst]").forEach(b=>b.classList.toggle("active",b.dataset.fst===fStatus&&!!fStatus));
      drawList();
    });

    const alBtn=$("#add-lv-panel"); if(alBtn)alBtn.onclick=()=>requirePerm("leave_manage",()=>leaveForm(null,null,()=>drawLeavesPanel()));
  }

  // ---------- Secondment (الندب) — تبويب مستقل ----------
  async function drawSecondmentPanel(){
    const [{leaves:_all},{branches}]=await Promise.all([api("/leaves"),api("/branches")]);
    const secs=_all.filter(l=>l.type==="ندب");
    const today=(()=>{const n=new Date();const p=x=>String(x).padStart(2,'0');return `${n.getFullYear()}-${p(n.getMonth()+1)}-${p(n.getDate())}`;})();
    // الحالة واعية بوقت الوردية لا بالتاريخ فقط: ندب شفت آخر يوم له اليوم
    // وانقضى وقت ورديته ⇒ "منتهٍ" فوراً، بلا انتظار انتهاء التاريخ.
    const _nowMinRy=(()=>{const n=_riyadhNow();return n.getUTCHours()*60+n.getUTCMinutes();})();
    const _shiftEndOf=(l)=>{
      if(!l.shift) return null;
      const pr=String(l.shift).split("-"); const st=+pr[0], en=+pr[1];
      if(isNaN(st)||isNaN(en)) return null;
      return en<st?en+1440:en;
    };
    const stOf=(l)=>{
      if(l.end_date<today)   return "expired";
      if(l.start_date>today) return "upcoming";
      const se=_shiftEndOf(l);
      if(se!==null && l.end_date===today && _nowMinRy>=Math.min(se,1440)) return "expired";
      return "active";
    };
    const activeS=secs.filter(l=>stOf(l)==="active");
    const upcomingS=secs.filter(l=>stOf(l)==="upcoming");
    const expiredS=secs.filter(l=>stOf(l)==="expired");
    let fBranch="",fSearch="",fStatus="";
    // تمييز واضح بين الندب الكامل وندب الشفت — منعاً لأي لبس في القائمة
    const secTypeBadge=(l)=>l.shift
      ? `<span class="status-pill sp-secondment" style="font-size:11px">شفت ${esc(l.shift_label||l.shift)}</span>`
      : `<span class="status-pill sp-off" style="font-size:11px">كامل</span>`;
    const stBadge=(st)=>st==="active"
      ?`<span class="sp-leave" style="font-size:11px;padding:2px 8px">نشط</span>`
      :st==="upcoming"
        ?`<span class="status-pill sp-upcoming" style="font-size:11px">قادم</span>`
        :`<span class="status-pill sp-off" style="font-size:11px">منتهٍ</span>`;
    function drawList(){
      let list=secs;
      if(fBranch) list=list.filter(l=>String(l.branch_id)===fBranch);
      if(fSearch){const q=fSearch.toLowerCase();list=list.filter(l=>(l.doctor_name||"").toLowerCase().includes(q));}
      if(fStatus) list=list.filter(l=>stOf(l)===fStatus);
      const el=$("#sec-list"); if(!el)return;
      if(!list.length){el.innerHTML=`<div class="empty">لا يوجد ندب مطابق</div>`;return;}
      const isMob=window.innerWidth<=860;
      if(isMob){
        el.innerHTML=`<div style="color:var(--muted);font-size:13px;margin-bottom:10px">${list.length} ندب</div>
          <div class="leave-cards">
          ${list.map(l=>`
            <div class="leave-card" data-lid="${l.id}">
              <div class="lc-head">
                <span class="lc-name">${esc(l.doctor_name)}</span>
                ${stBadge(stOf(l))}
              </div>
              <div class="lc-rows">
                <div class="lc-row"><span class="lc-lbl">🏥 الفرع الأساسي</span><span class="lc-val">${esc(l.branch_name||"—")}</span></div>
                <div class="lc-row"><span class="lc-lbl">🔄 المنتدب إليه</span><span class="lc-val">${esc(l.secondment_branch_name||"—")}</span></div>
                <div class="lc-row"><span class="lc-lbl">🕐 نوع الندب</span><span class="lc-val">${secTypeBadge(l)}</span></div>
                <div class="lc-row"><span class="lc-lbl">🩺 التخصص</span><span class="lc-val">${esc(l.specialty||"—")}</span></div>
                <div class="lc-row"><span class="lc-lbl">📅 الفترة</span><span class="lc-val">${esc(l.start_date)} ← ${esc(l.end_date)}</span></div>
              </div>
              <div class="lc-actions">
                <button class="btn btn-ghost btn-sm" data-el='${esc(JSON.stringify(l))}'>✎ تعديل</button>
                <button class="btn btn-danger btn-sm" data-dlo="${l.id}">حذف</button>
              </div>
            </div>`).join("")}
          </div>`;
      } else {
        el.innerHTML=`<div style="color:var(--muted);font-size:13px;margin-bottom:8px">${list.length} ندب</div>
          <table class="tbl"><thead><tr>
            <th>الممارس</th><th>الفرع الأساسي</th><th>المنتدب إليه</th><th>النوع</th><th>التخصص</th><th>من</th><th>إلى</th><th>الحالة</th><th></th>
          </tr></thead><tbody>
          ${list.map(l=>`<tr>
            <td><b>${esc(l.doctor_name)}</b></td>
            <td>${esc(l.branch_name||"—")}</td>
            <td>${esc(l.secondment_branch_name||"—")}</td>
            <td>${secTypeBadge(l)}</td>
            <td>${esc(l.specialty||"—")}</td>
            <td>${esc(l.start_date)}</td>
            <td>${esc(l.end_date)}</td>
            <td>${stBadge(stOf(l))}</td>
            <td style="white-space:nowrap">
              <button class="btn btn-ghost btn-sm" data-el='${esc(JSON.stringify(l))}'>تعديل</button>
              <button class="btn btn-danger btn-sm" data-dlo="${l.id}">حذف</button>
            </td></tr>`).join("")}
          </tbody></table>`;
      }
      el.querySelectorAll("[data-el]").forEach(btn=>btn.onclick=()=>{
        const lv=JSON.parse(btn.dataset.el);
        requireAny(["leave_manage","status_manage"],()=>leaveEditForm(lv,()=>{drawSecondmentPanel();}),lv.branch_id,lv.specialty);
      });
      el.querySelectorAll("[data-dlo]").forEach(btn=>btn.onclick=()=>{
        const lid=btn.dataset.dlo; const lv=list.find(l=>String(l.id)===lid);
        requireAny(["leave_manage","status_manage"],async()=>{
          if(!confirm("حذف الندب؟"))return;
          try{await api("/leaves/"+lid,{method:"DELETE"});toast("✅ تم حذف الندب بنجاح","ok");drawSecondmentPanel();}
          catch(e){toast("❌ "+e.message,"err");}
        },lv?lv.branch_id:undefined,lv?lv.specialty:undefined);
      });
    }
    $("#ctrl-body").innerHTML=`
      <div class="mini-stats" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
        <button class="mini-stat s-leave ${fStatus==="active"?"active":""}" data-fst="active">
          <span class="ms-ico">🔄</span><div><div class="ms-v">${activeS.length}</div><div class="ms-l">نشط الآن</div></div>
        </button>
        <button class="mini-stat s-amber ${fStatus==="upcoming"?"active":""}" data-fst="upcoming">
          <span class="ms-ico">🕐</span><div><div class="ms-v">${upcomingS.length}</div><div class="ms-l">قادم</div></div>
        </button>
        <button class="mini-stat s-black ${fStatus==="expired"?"active":""}" data-fst="expired">
          <span class="ms-ico">✅</span><div><div class="ms-v">${expiredS.length}</div><div class="ms-l">منتهٍ</div></div>
        </button>
      </div>
      <div class="toolbar" style="margin:0 0 14px;flex-wrap:wrap">
        <input class="search-input" id="sf-search" style="max-width:220px" placeholder="ابحث باسم الممارس...">
        <select class="select-mini" id="sf-branch"><option value="">كل الفروع</option>${branches.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join("")}</select>
        <button class="btn btn-primary btn-sm" id="add-sec-panel">＋ إضافة ندب</button>
      </div>
      <div id="sec-list"></div>`;
    drawList();
    const bind=(id,fn)=>{const e=$("#"+id);if(e){e.addEventListener("input",fn);e.addEventListener("change",fn);}};
    bind("sf-search",()=>{fSearch=$("#sf-search").value.trim();drawList();});
    bind("sf-branch",()=>{fBranch=$("#sf-branch").value;drawList();});
    $("#ctrl-body").querySelectorAll("[data-fst]").forEach(btn=>btn.onclick=()=>{
      fStatus=fStatus===btn.dataset.fst?"":btn.dataset.fst;
      $("#ctrl-body").querySelectorAll("[data-fst]").forEach(b=>b.classList.toggle("active",b.dataset.fst===fStatus&&!!fStatus));
      drawList();
    });
    const asBtn=$("#add-sec-panel"); if(asBtn)asBtn.onclick=()=>requireAny(["leave_manage","status_manage"],()=>leaveForm(null,null,()=>drawSecondmentPanel(),"ندب"));
  }

  async function drawTerminatedPanel(){
    const [{doctors},{branches}]=await Promise.all([api("/doctors?terminated=1"),api("/branches")]);
    const bname={}; branches.forEach(b=>bname[b.id]=b.name);
    const termed=doctors.filter(d=>d.terminated).map(d=>({...d,branch_name:bname[d.branch_id]||""}));
    const el=$("#ctrl-body"); if(!el) return;

    let q="";
    const render=()=>{
      const list=q
        ? termed.filter(d=>d.name.toLowerCase().includes(q.toLowerCase())||
            (d.specialty||"").includes(q)||(bname[d.branch_id]||"").includes(q))
        : termed;
      el.innerHTML=`
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
          <input id="term-search" class="search-input" style="flex:1;min-width:180px;border-radius:var(--r-s);padding:8px 14px"
            placeholder="ابحث باسم أو تخصص أو فرع..." value="${esc(q)}">
          <span style="color:var(--muted);font-size:13px;white-space:nowrap">${list.length} ممارس</span>
        </div>
        ${list.length?list.map(d=>`
          <div class="dcard-mgmt" style="display:flex;align-items:center;gap:10px;padding:10px 12px;
            background:color-mix(in srgb,#e2e8f0 45%,var(--surface));
            border:1px solid var(--line);border-inline-start:3px solid #475569;
            border-radius:var(--r);margin-bottom:8px">
            ${avatar(d)}
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:14px">${esc(d.name)}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px">
                ${d.specialty?`<span class="sp-tag">${esc(d.specialty)}</span> `:""}
                ${esc(bname[d.branch_id]||"")}
                ${d.terminated_date?` · <span style="color:#475569;font-size:11px">⛔ منذ ${esc(d.terminated_date)}</span>`:""}
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0">
              ${can("doctor_edit")?`<button class="btn btn-ghost btn-sm" data-edit-term="${d.id}">تعديل</button>`:""}
              ${can("doctor_edit")?`<button class="btn btn-sm" style="background:#e2e8f0;color:#334155;border:1px solid #94a3b8" data-unterm="${d.id}">↩ إعادة تفعيل</button>`:""}
            </div>
          </div>`).join("")
        :`<div class="empty">لا يوجد ممارسون منتهي العقد</div>`}`;

      $("#term-search")?.addEventListener("input",e=>{q=e.target.value;render();});
      el.querySelectorAll("[data-edit-term]").forEach(btn=>{
        const id=+btn.dataset.editTerm;
        const d=termed.find(x=>x.id===id); if(!d)return;
        btn.onclick=()=>requirePerm("doctor_edit",()=>doctorForm(d,()=>drawTerminatedPanel()),d.branch_id,d.specialty);
      });
      el.querySelectorAll("[data-unterm]").forEach(btn=>{
        const id=+btn.dataset.unterm;
        btn.onclick=async()=>{
          if(!confirm("إعادة تفعيل هذا الممارس؟")) return;
          try{await api("/doctors/"+id+"/terminate",{method:"POST",body:{unterm:1}});
            toast("✅ تم إعادة تفعيل الممارس","ok"); drawTerminatedPanel();}
          catch(e){toast("❌ "+e.message,"err");}
        };
      });
    };
    render();
  }

  // ============================================================ MANAGE (doctors + specialties, edit code)
  let mgrTab="doctors";
  routes.control=()=>{
    const hasAny=can("doctor_add")||can("doctor_edit")||can("doctor_delete")||can("leave_manage")||can("specialty_manage")||can("audit_view");
    if(!hasAny){ toast("🔒 لا تملك صلاحية لهذا القسم","warn"); go("doctors"); return; }
    shell(`<div class="loader"><div class="spin"></div></div>`);
    const tabs=[["doctors","👨‍⚕️ الممارسون"],["leaves","🏖️ الإجازات"],["secondment","🔄 الندب"],["terminated","❌ منتهو العقد"],["specialties","🏥 الأقسام"]];
    if(can("audit_view")) tabs.push(["audit","📋 سجل العمليات"]);
    $("#content").innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:8px;flex-wrap:wrap">
        <div>
          <div class="page-title">إدارة الممارسين</div>
          <div class="page-sub">الممارسون · الإجازات · الأقسام · سجل العمليات</div>
        </div>
        <button class="btn btn-ghost btn-sm" id="ctrl-exit">← العودة للممارسين</button>
      </div>
      <div class="tabs" id="ctrl-tabs" style="margin-bottom:16px">${tabs.map(([k,l])=>`<button class="tab ${mgrTab===k?"on":""}" data-tab="${k}">${l}</button>`).join("")}</div>
      <div id="ctrl-body"><div class="loader"><div class="spin"></div></div></div>`;
    $("#ctrl-exit").onclick=()=>go("doctors");
    $("#ctrl-tabs").querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{mgrTab=b.dataset.tab;routes.control();});
    if(mgrTab==="audit") drawAuditPanel();
    else if(mgrTab==="specialties") drawSpecialtiesPanel();
    else if(mgrTab==="leaves") drawLeavesPanel();
    else if(mgrTab==="secondment") drawSecondmentPanel();
    else if(mgrTab==="terminated") drawTerminatedPanel();
    else drawDoctorsMgmtPanel();
  };

  // ============================================================ ADMIN (branches + security + users, permission-gated)
  let adminTab="branches";
  routes.admin=()=>{
    if(!can("settings_access")&&!can("users_manage")){ toast("🔒 لا تملك صلاحية لهذا القسم","warn"); go("dashboard"); return; }
    shell(`<div class="loader"><div class="spin"></div></div>`);
    const tabs=[["branches","🏥 الفروع"],["users","👥 المستخدمين"],["stats","📊 الإحصائيات"],["security","🔐 الأمان"],["data","💾 البيانات"]];
    $("#content").innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <div class="page-title">⚙️ الإعدادات</div>
        <button class="btn btn-ghost btn-sm" id="admin-exit">← خروج</button>
      </div>
      <div class="tabs" id="admin-tabs">${tabs.map(([k,l])=>`<button class="tab ${adminTab===k?"on":""}" data-tab="${k}">${l}</button>`).join("")}</div>
      <div id="ctrl-body"><div class="loader"><div class="spin"></div></div></div>`;
    $("#admin-exit").onclick=()=>go("dashboard");
    $("#admin-tabs").querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{adminTab=b.dataset.tab;routes.admin();});
    if(adminTab==="users") drawUsersPanel();
    else if(adminTab==="security") drawSecurityPanel();
    else if(adminTab==="data") drawDataPanel();
    else if(adminTab==="stats") drawStatsPanel();
    else drawBranchesPanel();
  };

  async function drawStatsPanel(){
    const canAudit=can("audit_view");
    const [{leaves},{branches},{doctors},auditData,allDocsData]=await Promise.all([
      api("/leaves"),api("/branches"),api("/doctors"),
      canAudit?api("/audit"):Promise.resolve({audit:[]}),
      canAudit?api("/doctors?archived=1&terminated=1"):Promise.resolve({doctors:[]})
    ]);
    const bmap={};branches.forEach(b=>bmap[b.id]=b.name);
    const activeDocs=doctors.filter(d=>!d.archived);
    activeDocs.forEach(d=>d.branch_name=bmap[d.branch_id]||"");
    // بيانات «الأكثر تعديلاً» — يعتمد سجل التعديلات (audit_view)، مستقل عن قائمة الإجازات أعلاه
    const auditAll=auditData.audit||[];
    const nameById={}; (allDocsData.doctors||[]).forEach(d=>{ nameById[d.id]=d.name; });
    const now=new Date();
    let selYear=now.getFullYear(), selMonth=now.getMonth(), viewMode="month";
    const monthNames=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

    function countDays(start,end,rStart,rEnd){
      const s=start>rStart?start:rStart;
      const e=end<rEnd?end:rEnd;
      if(s>e)return 0;
      return Math.round((new Date(e)-new Date(s))/86400000)+1;
    }

    function draw(){
      const pad=x=>String(x).padStart(2,'0');
      let rStart,rEnd,label;
      if(viewMode==="month"){
        rStart=`${selYear}-${pad(selMonth+1)}-01`;
        const lastDay=new Date(selYear,selMonth+1,0).getDate();
        rEnd=`${selYear}-${pad(selMonth+1)}-${pad(lastDay)}`;
        label=`${monthNames[selMonth]} ${selYear}`;
      } else {
        rStart=`${selYear}-01-01`;
        rEnd=`${selYear}-12-31`;
        label=`${selYear}`;
      }

      const realLeaves=leaves.filter(l=>!l.synthetic&&l.start_date<=rEnd&&l.end_date>=rStart);
      const docStats=[], branchTotals={}, typeTotals={}, specTotals={};

      for(const d of activeDocs){
        const dLeaves=realLeaves.filter(l=>l.doctor_id===d.id);
        let totalDays=0;
        const types={};
        for(const l of dLeaves){
          const days=countDays(l.start_date,l.end_date,rStart,rEnd);
          totalDays+=days;
          const t=l.type||"أخرى";
          types[t]=(types[t]||0)+days;
          typeTotals[t]=(typeTotals[t]||0)+days;
        }
        if(totalDays>0){
          const bName=d.branch_name||"—";
          const spec=d.specialty||"—";
          branchTotals[bName]=(branchTotals[bName]||0)+totalDays;
          specTotals[spec]=(specTotals[spec]||0)+totalDays;
          docStats.push({name:d.name,branch:bName,specialty:spec,days:totalDays,count:dLeaves.length,types});
        }
      }
      docStats.sort((a,b)=>b.days-a.days);

      const totalDays=docStats.reduce((s,d)=>s+d.days,0);
      const totalCount=docStats.reduce((s,d)=>s+d.count,0);
      const avgPerDoc=docStats.length?Math.round(totalDays/docStats.length*10)/10:0;
      const topDoc=docStats[0];

      const branchRows=Object.entries(branchTotals).sort((a,b)=>b[1]-a[1]);
      const typeRows=Object.entries(typeTotals).sort((a,b)=>b[1]-a[1]);
      const specRows=Object.entries(specTotals).sort((a,b)=>b[1]-a[1]);
      const maxDays=topDoc?topDoc.days:1;

      // الأكثر تعديلاً في نفس الفترة المختارة — من سجل العمليات (entity="doctor")
      const editCounts={};
      auditAll.forEach(a=>{
        if(a.entity!=="doctor"||!a.entity_id) return;
        const ds=(a.ts||"").slice(0,10);
        if(ds<rStart||ds>rEnd) return;
        const c=editCounts[a.entity_id]||{count:0,last:null,lastUser:""};
        c.count++;
        if(!c.last||a.ts>c.last){ c.last=a.ts; c.lastUser=a.user||""; }
        editCounts[a.entity_id]=c;
      });
      const editRows=Object.entries(editCounts)
        .map(([id,v])=>({id, name:nameById[id]||("ممارس #"+id), ...v}))
        .sort((a,b)=>b.count-a.count).slice(0,10);
      const maxEdits=editRows.length?editRows[0].count:1;

      const colors=["#0ea5a4","#6366f1","#f59e0b","#ef4444","#22c55e","#8b5cf6","#ec4899","#14b8a6"];

      $("#ctrl-body").innerHTML=`
        <div style="max-width:740px;margin:0 auto">
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:18px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" id="st-prev">→</button>
            <div style="font-size:18px;font-weight:700;min-width:160px;text-align:center">${label}</div>
            <button class="btn btn-ghost btn-sm" id="st-next">←</button>
            <div style="display:flex;gap:4px;margin-right:8px">
              <button class="btn btn-sm ${viewMode==="month"?"btn-primary":"btn-ghost"}" id="st-vm">شهري</button>
              <button class="btn btn-sm ${viewMode==="year"?"btn-primary":"btn-ghost"}" id="st-vy">سنوي</button>
            </div>
          </div>

          <div class="mini-stats" style="grid-template-columns:repeat(4,1fr);margin-bottom:18px">
            <div class="mini-stat"><span class="ms-ico">👨‍⚕️</span><div><div class="ms-v">${docStats.length}</div><div class="ms-l">ممارس</div></div></div>
            <div class="mini-stat"><span class="ms-ico">📋</span><div><div class="ms-v">${totalCount}</div><div class="ms-l">إجازة</div></div></div>
            <div class="mini-stat"><span class="ms-ico">📅</span><div><div class="ms-v">${totalDays}</div><div class="ms-l">يوم إجازة</div></div></div>
            <div class="mini-stat"><span class="ms-ico">📐</span><div><div class="ms-v">${avgPerDoc}</div><div class="ms-l">متوسط / ممارس</div></div></div>
          </div>

          ${topDoc?`<div class="card" style="padding:14px;margin-bottom:14px;border-right:4px solid #d97706">
            <div style="font-size:13px;color:var(--muted)">🏆 الأكثر إجازة</div>
            <div style="font-size:16px;font-weight:700;margin-top:4px">${esc(topDoc.name)} <span style="color:#d97706">${topDoc.days} يوم</span></div>
            <div style="font-size:12px;color:var(--muted)">${esc(topDoc.branch)} · ${esc(topDoc.specialty)}</div>
          </div>`:""}

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
            ${branchRows.length?`<div class="card" style="padding:16px">
              <div style="font-weight:700;font-size:14px;margin-bottom:12px">🏥 حسب الفرع</div>
              ${branchRows.map(([b,d],i)=>`
                <div style="margin-bottom:8px">
                  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
                    <span style="font-weight:600">${esc(b)}</span><span style="color:var(--muted)">${d} يوم</span>
                  </div>
                  <div style="background:var(--bg);border-radius:6px;height:18px;overflow:hidden">
                    <div style="height:100%;background:${colors[i%colors.length]};border-radius:6px;width:${Math.round(d/(branchRows[0][1])*100)}%;transition:width .3s"></div>
                  </div>
                </div>`).join("")}
            </div>`:"<div></div>"}

            ${typeRows.length?`<div class="card" style="padding:16px">
              <div style="font-weight:700;font-size:14px;margin-bottom:12px">📂 حسب النوع</div>
              ${typeRows.map(([t,d],i)=>`
                <div style="margin-bottom:8px">
                  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
                    <span style="font-weight:600">${esc(t)}</span><span style="color:var(--muted)">${d} يوم (${Math.round(d/totalDays*100)}%)</span>
                  </div>
                  <div style="background:var(--bg);border-radius:6px;height:18px;overflow:hidden">
                    <div style="height:100%;background:${colors[(i+3)%colors.length]};border-radius:6px;width:${Math.round(d/totalDays*100)}%;transition:width .3s"></div>
                  </div>
                </div>`).join("")}
            </div>`:"<div></div>"}
          </div>

          ${docStats.length?`
          <div class="card" style="padding:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <div style="font-weight:700;font-size:14px">👨‍⚕️ تفاصيل الممارسين</div>
              <div style="font-size:12px;color:var(--muted)">${docStats.length} ممارس</div>
            </div>
            <div style="overflow-x:auto">
            <table class="tbl"><thead><tr>
              <th>#</th><th>الممارس</th><th>الفرع</th><th>التخصص</th><th>الإجازات</th><th>الأيام</th><th>التفاصيل</th>
            </tr></thead><tbody>
            ${docStats.map((d,i)=>`<tr>
              <td style="color:var(--muted);font-weight:700">${i+1}</td>
              <td><b>${esc(d.name)}</b></td>
              <td style="font-size:12px">${esc(d.branch)}</td>
              <td style="font-size:12px">${esc(d.specialty)}</td>
              <td style="text-align:center">${d.count}</td>
              <td style="min-width:120px">
                <div style="display:flex;align-items:center;gap:6px">
                  <div style="flex:1;background:var(--bg);border-radius:4px;height:16px;overflow:hidden">
                    <div style="height:100%;background:${d.days>=20?"#dc2626":d.days>=10?"#d97706":"var(--brand)"};border-radius:4px;width:${Math.round(d.days/maxDays*100)}%;transition:width .3s"></div>
                  </div>
                  <span style="font-weight:700;font-size:13px;min-width:30px">${d.days}</span>
                </div>
              </td>
              <td style="font-size:11px;color:var(--muted);white-space:nowrap">${Object.entries(d.types).map(([t,v])=>esc(t)+": "+v).join(" · ")}</td>
            </tr>`).join("")}
            </tbody></table>
            </div>
          </div>`:`<div class="empty" style="margin-top:30px">لا توجد إجازات في هذه الفترة</div>`}

          ${canAudit?(editRows.length?`
          <div class="card" style="padding:16px;margin-top:14px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <div style="font-weight:700;font-size:14px">🔥 الأكثر تعديلاً</div>
              <div style="font-size:12px;color:var(--muted)">${label}</div>
            </div>
            <div style="overflow-x:auto">
            <table class="tbl"><thead><tr>
              <th>#</th><th>الممارس</th><th>عدد التعديلات</th><th>آخر تعديل</th>
            </tr></thead><tbody>
            ${editRows.map((r,i)=>`<tr>
              <td style="color:var(--muted);font-weight:700">${i+1}</td>
              <td><b>${esc(r.name)}</b></td>
              <td style="min-width:120px">
                <div style="display:flex;align-items:center;gap:6px">
                  <div style="flex:1;background:var(--bg);border-radius:4px;height:16px;overflow:hidden">
                    <div style="height:100%;background:var(--brand);border-radius:4px;width:${Math.round(r.count/maxEdits*100)}%;transition:width .3s"></div>
                  </div>
                  <span style="font-weight:700;font-size:13px;min-width:20px">${r.count}</span>
                </div>
              </td>
              <td style="font-size:11.5px;color:var(--muted);white-space:nowrap">${esc((r.last||"").replace("T"," ").slice(0,16))}${r.lastUser?" · "+esc(r.lastUser):""}</td>
            </tr>`).join("")}
            </tbody></table>
            </div>
          </div>`:`<div class="card" style="padding:16px;margin-top:14px"><div style="font-weight:700;font-size:14px;margin-bottom:6px">🔥 الأكثر تعديلاً</div><div class="empty" style="padding:14px 0">لا توجد تعديلات مسجَّلة في هذه الفترة</div></div>`):""}
        </div>`;

      $("#st-prev").onclick=()=>{if(viewMode==="month"){selMonth--;if(selMonth<0){selMonth=11;selYear--;}}else selYear--;draw();};
      $("#st-next").onclick=()=>{if(viewMode==="month"){selMonth++;if(selMonth>11){selMonth=0;selYear++;}}else selYear++;draw();};
      $("#st-vm").onclick=()=>{viewMode="month";draw();};
      $("#st-vy").onclick=()=>{viewMode="year";draw();};
    }
    draw();
  }

  function drawDataPanel(){
    const db=LocalDB.call("GET","/export-db");
    const dc=db?db.doctors.filter(d=>!d.archived).length:0;
    const ac=db?db.doctors.filter(d=>d.archived).length:0;
    const bc=db?db.branches.length:0;
    const lc=db?db.leaves.length:0;
    $("#ctrl-body").innerHTML=`
      <div style="max-width:520px;margin:16px auto;display:flex;flex-direction:column;gap:16px">
        <div class="card" style="padding:20px">
          <div style="font-size:17px;font-weight:700;margin-bottom:12px">📊 ملخص البيانات</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div style="padding:12px;background:var(--bg);border-radius:10px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:var(--brand)">${dc}</div>
              <div style="font-size:12px;color:var(--muted)">ممارس نشط</div>
            </div>
            <div style="padding:12px;background:var(--bg);border-radius:10px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:var(--muted)">${ac}</div>
              <div style="font-size:12px;color:var(--muted)">مؤرشف</div>
            </div>
            <div style="padding:12px;background:var(--bg);border-radius:10px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:var(--brand)">${bc}</div>
              <div style="font-size:12px;color:var(--muted)">فرع</div>
            </div>
            <div style="padding:12px;background:var(--bg);border-radius:10px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:var(--brand)">${lc}</div>
              <div style="font-size:12px;color:var(--muted)">إجازة مسجلة</div>
            </div>
          </div>
        </div>
        <div class="card" style="padding:16px;background:var(--surface)">
          <div style="font-size:15px;font-weight:700;margin-bottom:10px">📦 نسخة احتياطية</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:10px;background:var(--bg);border-radius:10px">
            <span style="font-size:20px">🟢</span>
            <div>
              <div style="font-size:13px;font-weight:600">الحفظ التلقائي مفعّل</div>
              <div style="font-size:12px;color:var(--muted)" id="backup-ts">${(()=>{const t=localStorage.getItem('adelcare_backup_ts');if(!t)return'لم يتم الحفظ بعد';const d=new Date(t);return'آخر حفظ: '+d.toLocaleDateString('ar-SA')+' '+d.toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'});})()}</div>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary" id="btn-backup" style="flex:1">⬇ تنزيل نسخة</button>
            <button class="btn btn-ghost" id="btn-restore" style="flex:1">⬆ استعادة نسخة</button>
          </div>
        </div>
        <div class="card" style="padding:16px;background:var(--surface)">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px">
            <div style="font-size:15px;font-weight:700">🕓 سجل النسخ الاحتياطية (سحابي)</div>
            <button class="btn btn-primary btn-sm" id="btn-snap-now">💾 احفظ نسخة الآن</button>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:10px">تُؤخذ نسخة تلقائياً <b>بعد كل عملية</b> (إضافة/تعديل/حذف)، بالإضافة إلى نسخة يومية ونسخة أمان قبل أي استعادة. كل نسخة موثّقة بالوقت ونوع العملية والمستخدم.</div>
          <div id="snap-list"><div style="font-size:13px;color:var(--muted);text-align:center;padding:8px">جارٍ التحميل…</div></div>
        </div>
        <div class="card" style="padding:16px;background:var(--surface)">
          <div style="font-size:15px;font-weight:700;margin-bottom:8px">⬇️ تصدير تلقائي خارج Firebase</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:12px">لحماية إضافية ضد أي عطل على مستوى Firebase، ينزّل التطبيق ملف نسخة (JSON) تلقائياً إلى جهاز المسؤول كل فترة محددة — يقوم به أول مسؤول يفتح التطبيق بعد انتهاء المدة، ويُسجَّل التاريخ سحابياً حتى لا يتكرر.</div>
          <label style="display:flex;align-items:center;gap:8px;font-size:13.5px;cursor:pointer;margin-bottom:10px">
            <input type="checkbox" id="ax-enabled" style="width:18px;height:18px"> تفعيل التصدير التلقائي
          </label>
          <div style="display:flex;align-items:center;gap:8px;font-size:13px">
            <span>كل</span>
            <select id="ax-days" class="select-mini" style="max-width:120px">
              <option value="1">يوم</option><option value="3">3 أيام</option><option value="7">أسبوع</option>
              <option value="14">أسبوعين</option><option value="30">شهر</option>
            </select>
          </div>
          <div id="ax-status" style="font-size:11.5px;color:var(--muted);margin-top:10px"></div>
        </div>
        <div class="card" style="padding:16px;background:var(--surface)">
          <div style="font-size:13px;color:var(--muted);line-height:1.8;text-align:right">
            <b>آلية العمل:</b><br>
            ▪ البيانات محفوظة في <b>Firebase Firestore</b> (سحابية) — مستند رئيسي واحد<br>
            ▪ أي تعديل يظهر فوراً لجميع المستخدمين (مزامنة لحظية)<br>
            ▪ <b>نسخة احتياطية بعد كل عملية</b> تُحفظ في مجموعة منفصلة <code>adelcare_snapshots</code><br>
            ▪ سجل إصدارات: حتى 60 نسخة تشغيلية + 30 يومية + 40 يدوية + 20 أمان<br>
            ▪ <b>تصدير تلقائي</b> لملف JSON إلى جهاز المسؤول (نسخة خارج Firebase)<br>
            ▪ تحديث الأكواد (رفع index.html) لا يؤثر على البيانات إطلاقاً
          </div>
        </div>
      </div>`;
    (async()=>{
      const box=$("#snap-list"); if(!box)return;
      try{
        const {snapshots}=await LocalDB.call("GET","/snapshots");
        if(!snapshots.length){ box.innerHTML=`<div style="font-size:13px;color:var(--muted);text-align:center;padding:8px">لا توجد نسخ بعد — ستُنشأ نسخة تلقائياً بعد أول عملية</div>`; return; }
        const KIND_ICO={op:'📝 بعد عملية',auto:'📅 يومية',manual:'💾 يدوية',pre:'🛡️ نسخة أمان'};
        box.innerHTML=snapshots.slice(0,15).map(s=>{
          const d=s.ts?new Date(s.ts):null;
          const when=d?d.toLocaleDateString('ar-SA')+' '+d.toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):s.id;
          const kind=KIND_ICO[s.kind]||'📦 نسخة';
          const act=s.action?`<div style="font-size:12px;color:var(--text);margin-top:1px">${esc(s.action)}</div>`:"";
          const nInfo=s.n?`<div style="font-size:11px;color:var(--muted)">${s.n.doctors} ممارس · ${s.n.branches} فرع · ${s.n.leaves} إجازة</div>`:"";
          const who=s.user?` · ${esc(s.user)}`:"";
          return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;background:var(--bg);border-radius:8px;margin-bottom:6px">
            <div style="min-width:0"><div style="font-size:12.5px;font-weight:700">${kind}</div>${act}<div style="font-size:11.5px;color:var(--muted)">${esc(when)}${who}</div>${nInfo}</div>
            <button class="btn btn-ghost btn-sm" data-restore-snap="${esc(s.id)}" style="flex-shrink:0">استعادة</button>
          </div>`;
        }).join("")+(snapshots.length>15?`<div style="font-size:12px;color:var(--muted);text-align:center">و ${snapshots.length-15} نسخة أقدم محفوظة</div>`:"");
        box.querySelectorAll("[data-restore-snap]").forEach(btn=>btn.onclick=async()=>{
          const id=btn.dataset.restoreSnap;
          const word=prompt(`⚠️ استعادة النسخة التلقائية؟\nسيتم استبدال جميع البيانات الحالية بمحتوى هذه النسخة.\n(ستُؤخذ نسخة من البيانات الحالية قبل الاستعادة)\n\nللتأكيد اكتب: استعادة`);
          if(word===null)return;
          if(word.trim()!=="استعادة"){toast("❌ لم يتم التأكيد — أُلغيت العملية","err");return;}
          try{ await LocalDB.call("POST","/restore-snapshot",{id}); toast("✅ تمت الاستعادة بنجاح","ok"); setTimeout(()=>drawDataPanel(),500); }
          catch(e){ toast("❌ "+e.message,"err"); }
        });
      }catch(e){ box.innerHTML=`<div style="font-size:13px;color:var(--muted);text-align:center;padding:8px">تعذّر تحميل النسخ التلقائية</div>`; }
    })();
    const snapNowBtn=$("#btn-snap-now");
    if(snapNowBtn) snapNowBtn.onclick=async()=>{
      const note=prompt("وصف اختياري لهذه النسخة (مثلاً: قبل تعديل الجداول):","نسخة يدوية");
      if(note===null)return;
      snapNowBtn.disabled=true; snapNowBtn.textContent="⏳ جارٍ الحفظ…";
      try{ await LocalDB.call("POST","/snapshot-now",{note:(note.trim()||"نسخة يدوية")}); toast("✅ تم حفظ نسخة احتياطية الآن","ok"); drawDataPanel(); }
      catch(e){ toast("❌ "+e.message,"err"); snapNowBtn.disabled=false; snapNowBtn.textContent="💾 احفظ نسخة الآن"; }
    };
    // ── إعدادات التصدير التلقائي ──
    (async()=>{
      const cb=$("#ax-enabled"), sel=$("#ax-days"), st=$("#ax-status"); if(!cb||!sel)return;
      try{
        const s=await api("/settings");
        cb.checked = s.auto_export_enabled!==false;
        sel.value = String(s.auto_export_days||7);
        if(s.last_auto_export){ const d=new Date(s.last_auto_export);
          st.textContent="آخر تصدير تلقائي: "+d.toLocaleDateString('ar-SA')+' '+d.toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'}); }
        else st.textContent="لم يُنفَّذ تصدير تلقائي بعد — سيتم عند اكتمال المدة";
      }catch(e){}
      const saveAx=async()=>{
        try{ await api("/settings",{method:"PUT",body:{auto_export_enabled:cb.checked, auto_export_days:+sel.value}});
          toast("✅ تم حفظ إعدادات التصدير التلقائي","ok"); }
        catch(e){ toast("❌ "+e.message,"err"); }
      };
      cb.addEventListener("change",saveAx); sel.addEventListener("change",saveAx);
    })();
    const backupBtn=$("#btn-backup");
    if(backupBtn) backupBtn.onclick=()=>{
      if(!downloadBackupFile(false)){toast("❌ لا توجد بيانات","err");return;}
      api("/settings",{method:"PUT",body:{last_backup_download:new Date().toISOString()}}).catch(()=>{});
      toast("✅ تم تنزيل النسخة الاحتياطية بنجاح","ok");
    };
    const restoreBtn=$("#btn-restore");
    if(restoreBtn) restoreBtn.onclick=()=>{
      const inp=document.createElement("input");
      inp.type="file"; inp.accept=".json";
      inp.onchange=()=>{
        const f=inp.files[0]; if(!f)return;
        const r=new FileReader();
        r.onload=()=>{
          try{
            const data=JSON.parse(r.result);
            if(!data.doctors||!data.branches){toast("❌ ملف غير صالح","err");return;}
            const word=prompt(`⚠️ استعادة النسخة الاحتياطية؟\nسيتم استبدال جميع البيانات الحالية.\n(ستُؤخذ نسخة تلقائية من البيانات الحالية قبل الاستعادة)\n\nالملف يحتوي على:\n• ${data.doctors.length} ممارس\n• ${data.branches.length} فرع\n• ${(data.leaves||[]).length} إجازة\n\nللتأكيد اكتب: استعادة`);
            if(word===null)return;
            if(word.trim()!=="استعادة"){toast("❌ لم يتم التأكيد — أُلغيت العملية","err");return;}
            LocalDB.call("POST","/import-db",data);
            toast("✅ تم استعادة النسخة الاحتياطية بنجاح","ok");
            setTimeout(()=>drawDataPanel(),500);
          }catch(e){toast("❌ خطأ في قراءة الملف","err");}
        };
        r.readAsText(f);
      };
      inp.click();
    };
  }

  async function drawBranchesPanel(){
    const {branches}=await api("/branches");
    const mob=window.innerWidth<=860;
    const branchRows = mob
      ? `<div class="branch-cards">${branches.map(b=>`
          <div class="branch-card">
            <div class="bc-head">
              <span class="bc-name">🏥 ${esc(b.name)}</span>
              <span class="bc-cnt">👨‍⚕️ ${b.doctor_count}</span>
            </div>
            <div class="bc-rows">
              ${b.grp?`<div class="bc-row"><span class="bc-lbl">المجموعة</span><span class="bc-val">${esc(b.grp)}</span></div>`:""}
              ${b.hours?`<div class="bc-row"><span class="bc-lbl">ساعات الدوام</span><span class="bc-val">${esc(b.hours)}</span></div>`:""}
              ${b.info?`<div class="bc-row"><span class="bc-lbl">المعلومات</span><span class="bc-val">${esc(b.info)}</span></div>`:""}
            </div>
            <div class="bc-actions">
              <button class="btn btn-ghost btn-sm" data-eb='${esc(JSON.stringify(b))}'>تعديل</button>
              <button class="btn btn-ghost btn-sm" data-db="${b.id}">حذف</button>
            </div>
          </div>`).join("")}</div>`
      : `<table class="tbl"><thead><tr><th>الفرع</th><th>المجموعة</th><th>ساعات الدوام</th><th>المعلومات</th><th>الممارسون</th><th></th></tr></thead>
         <tbody>${branches.map(b=>`<tr>
           <td><b>${esc(b.name)}</b></td><td>${esc(b.grp||"")}</td>
           <td style="font-size:12.5px">${esc(b.hours||"—")}</td>
           <td style="font-size:12.5px">${esc(b.info||"—")}</td>
           <td>${b.doctor_count}</td>
           <td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" data-eb='${esc(JSON.stringify(b))}'>تعديل</button>
           <button class="btn btn-ghost btn-sm" data-db="${b.id}">حذف</button></td></tr>`).join("")}</tbody></table>`;
    $("#ctrl-body").innerHTML=`
      <div style="display:flex;justify-content:flex-end;margin:6px 0 12px">
        <button class="btn btn-primary btn-sm" id="add-branch">＋ إضافة فرع</button></div>
      ${branchRows}`;
    $("#add-branch").onclick=()=>requirePerm("branch_manage",()=>branchForm(null));
    $("#ctrl-body").querySelectorAll("[data-eb]").forEach(b=>b.onclick=()=>requirePerm("branch_manage",()=>branchForm(JSON.parse(b.dataset.eb))));
    $("#ctrl-body").querySelectorAll("[data-db]").forEach(b=>b.onclick=()=>requirePerm("branch_manage",async()=>{
      if(!confirm("حذف الفرع؟"))return;
      try{await api("/branches/"+b.dataset.db,{method:"DELETE"});toast("✅ تم حذف الفرع بنجاح","ok");drawBranchesPanel();}
      catch(e){toast("❌ "+e.message,"err");}}));
  }

  function branchForm(b){
    const body=`<form id="bf">
      <div class="field"><label>اسم الفرع *</label><input name="name" value="${esc(b?b.name:"")}" required></div>
      <div class="grid2">
        <div class="field"><label>المجموعة</label><input name="grp" value="${esc(b?b.grp:"")}" placeholder="عادل كير / بلوديم"></div>
        <div class="field"><label>ساعات الدوام</label><input name="hours" value="${esc(b?b.hours:"")}" placeholder="من 8ص حتى 1ص"></div>
      </div>
      <div class="grid2">
        <div class="field"><label>رقم الجوال</label><input name="phone" inputmode="tel" value="${esc(b?b.phone:"")}"></div>
        <div class="field"><label>هاتف ثابت</label><input name="landline" inputmode="tel" value="${esc(b?b.landline||"":"")}"></div>
      </div>
      <div class="grid2">
        <div class="field"><label>الحساب البنكي</label><input name="bank_account" value="${esc(b?b.bank_account||"":"")}"></div>
        <div class="field"><label>الآيبان (IBAN)</label><input name="iban" style="direction:ltr" value="${esc(b?b.iban||"":"")}"></div>
      </div>
      <div class="field"><label>العنوان</label><input name="info" value="${esc(b?b.info:"")}"></div>
      <div class="field"><label>معلومات إضافية</label><textarea name="extra_info" rows="2">${esc(b?b.extra_info||"":"")}</textarea></div>
    </form>`;
    openModal({title:b?"تعديل فرع":"إضافة فرع",bodyHTML:body,
      footHTML:`<button class="btn btn-primary" id="save-b">حفظ</button><button class="btn btn-ghost" data-xb>إلغاء</button>`,
      onMount:(m)=>{m.querySelector("[data-xb]").onclick=closeModal;
        m.querySelector("#save-b").onclick=async()=>{
          const p=Object.fromEntries(new FormData(m.querySelector("#bf")).entries());
          try{ if(b)await api("/branches/"+b.id,{method:"PUT",body:p});
            else await api("/branches",{method:"POST",body:p});
            toast("✅ تم حفظ بيانات الفرع بنجاح","ok");closeModal();drawBranchesPanel();}catch(e){toast("❌ "+e.message,"err");}
        };}});
  }

  // ---- Users management ----
  async function drawUsersPanel(){
    if(!can("users_manage")){ $("#ctrl-body").innerHTML=`<div class="empty-msg">🔒 لا تملك صلاحية لإدارة المستخدمين</div>`; return; }
    const [{users},{branches:brList},{specialties:specList}]=await Promise.all([api("/users"),api("/branches"),api("/specialties")]);
    const brMap={}; brList.forEach(b=>brMap[b.id]=b.name);
    const permLabel=k=>(PERMS_META.find(p=>p.key===k)||{}).label||k;
    const brLabel=(u)=>{
      const b=u.branches||["*"];
      if(b.includes("*")) return '<span class="perm-chip perm-all">جميع الفروع</span>';
      return b.map(id=>`<span class="perm-chip branch-chip">${esc(brMap[id]||brMap[+id]||id)}</span>`).join("")||'<span class="perm-chip perm-none">بدون فروع</span>';
    };
    const spLabel=(u)=>{
      const sp=u.specialties||["*"];
      if(sp.includes("*")) return '<span class="perm-chip perm-all">جميع الأقسام</span>';
      return sp.map(s=>`<span class="perm-chip spec-chip">${esc(s)}</span>`).join("")||'<span class="perm-chip perm-none">بدون أقسام</span>';
    };

    $("#ctrl-body").innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div style="font-weight:700;font-size:14px">المستخدمين (${users.length})</div>
        <button class="btn btn-primary btn-sm" id="add-user">＋ إضافة مستخدم</button>
      </div>
      <div class="user-grid">
        ${users.map(u=>`
          <div class="user-card ${!u.active?'user-inactive':''}">
            <div class="user-card-head">
              <div class="user-card-avatar">${esc(u.name.charAt(0))}</div>
              <div class="user-card-info">
                <div class="user-card-name">${esc(u.name)}${u.role==="super_admin"?'<span class="user-badge-super">مدير رئيسي</span>':""}</div>
                <div class="user-card-meta">${u.active?'<span class="user-status-on">نشط</span>':'<span class="user-status-off">متوقف</span>'}${u.email?` · <span style="direction:ltr;display:inline-block">${esc(u.email)}</span>`:' · <span style="color:var(--amber)">بلا بريد — لا يستطيع الدخول</span>'}</div>
              </div>
            </div>
            <div class="user-card-perms">
              ${u.permissions.includes("*")?'<span class="perm-chip perm-all">جميع الصلاحيات</span>'
                :u.permissions.map(p=>`<span class="perm-chip">${esc(permLabel(p))}</span>`).join("")||'<span class="perm-chip perm-none">بدون صلاحيات</span>'}
            </div>
            <div class="user-card-branches">${brLabel(u)}</div>
            <div class="user-card-branches">${spLabel(u)}</div>
            ${u.role!=="super_admin"?`<div class="user-card-actions">
              <button class="btn btn-ghost btn-xs" data-edit-user="${esc(JSON.stringify({id:u.id,name:u.name,permissions:u.permissions,branches:u.branches||["*"],specialties:u.specialties||["*"],active:u.active}))}">✎ تعديل</button>
              <button class="btn btn-ghost btn-xs" data-toggle-user="${u.id}" data-active="${u.active?1:0}" data-uname="${esc(u.name)}">${u.active?"⏸ إيقاف":"▶ تفعيل"}</button>
              <button class="btn btn-danger btn-xs" data-del-user="${u.id}" data-uname="${esc(u.name)}">✕ حذف</button>
            </div>`:""}
          </div>`).join("")}
      </div>`;

    $("#add-user").onclick=()=>userForm(null);

    document.querySelectorAll("[data-edit-user]").forEach(btn=>btn.onclick=()=>{
      userForm(JSON.parse(btn.dataset.editUser));
    });


    document.querySelectorAll("[data-toggle-user]").forEach(btn=>btn.onclick=async()=>{
      const uid=btn.dataset.toggleUser, active=btn.dataset.active==="1", uname=btn.dataset.uname;
      if(!confirm(active?`إيقاف حساب "${uname}"؟`:`تفعيل حساب "${uname}"؟`))return;
      try{await api("/users/"+uid,{method:"PUT",body:{active:!active}});toast("✅ تم التحديث","ok");drawUsersPanel();}
      catch(e){toast("❌ "+e.message,"err");}
    });

    document.querySelectorAll("[data-del-user]").forEach(btn=>btn.onclick=async()=>{
      const uid=btn.dataset.delUser, uname=btn.dataset.uname;
      if(!confirm(`حذف المستخدم "${uname}" نهائياً؟`))return;
      try{await api("/users/"+uid,{method:"DELETE"});toast("✅ تم حذف المستخدم","ok");drawUsersPanel();}
      catch(e){toast("❌ "+e.message,"err");}
    });
  }

  async function userForm(existing){
    const isEdit=!!existing;
    const [{branches:brList},{specialties:specList}]=await Promise.all([api("/branches"),api("/specialties")]);
    const existBranches=existing&&existing.branches?existing.branches:["*"];
    const isAllBranches=existBranches.includes("*");
    const existSpecs=existing&&existing.specialties?existing.specialties:["*"];
    const isAllSpecs=existSpecs.includes("*");
    const permsHTML=PERMS_META.map(p=>`
      <label class="perm-check"><input type="checkbox" name="perm" value="${p.key}" ${existing&&existing.permissions.includes(p.key)?"checked":""}> ${p.label}</label>
    `).join("");
    const branchesHTML=brList.map(b=>`
      <label class="perm-check"><input type="checkbox" name="ubranch" value="${b.id}" ${isAllBranches||existBranches.includes(b.id)||existBranches.includes(String(b.id))?"checked":""}> ${esc(b.name)}</label>
    `).join("");
    const specsHTML=specList.map(s=>`
      <label class="perm-check"><input type="checkbox" name="uspec" value="${esc(s)}" ${isAllSpecs||existSpecs.includes(s)?"checked":""}> ${esc(s)}</label>
    `).join("");

    const body=`<form id="userf">
      <div class="field"><label>اسم المستخدم</label><input name="name" value="${isEdit?esc(existing.name):""}" required></div>
      <div class="field"><label>البريد المرتبط بحساب Firebase</label>
        <input name="email" type="email" autocomplete="off" placeholder="name@adelcare.local"
          value="${isEdit&&existing.email?esc(existing.email):""}">
        <div style="font-size:12px;color:var(--muted);margin-top:4px">
          يجب أن يطابق البريد المُنشأ في Firebase Console. كلمة المرور تُدار هناك ولا تُحفظ هنا.
        </div>
      </div>

      <div class="field"><label>الصلاحيات</label>
        <div class="perms-grid">${permsHTML}</div>
        <div style="margin-top:6px"><label class="perm-check perm-select-all"><input type="checkbox" id="perm-all"> تحديد الكل</label></div>
      </div>
      <div class="field"><label>🏥 الفروع المسموح بالتعديل عليها</label>
        <div style="margin-bottom:6px"><label class="perm-check perm-select-all"><input type="checkbox" id="branch-all" ${isAllBranches?"checked":""}> جميع الفروع</label></div>
        <div class="perms-grid" id="branch-boxes">${branchesHTML}</div>
      </div>
      <div class="field"><label>🩺 الأقسام المسموح بالتعديل عليها</label>
        <div style="margin-bottom:6px"><label class="perm-check perm-select-all"><input type="checkbox" id="spec-all" ${isAllSpecs?"checked":""}> جميع الأقسام</label></div>
        <div class="perms-grid" id="spec-boxes">${specsHTML}</div>
      </div>
    </form>`;

    openModal({title:isEdit?"تعديل مستخدم — "+existing.name:"إضافة مستخدم جديد",bodyHTML:body,
      footHTML:`<button class="btn btn-primary" id="save-user">حفظ</button><button class="btn btn-ghost" data-xu>إلغاء</button>`,
      onMount:(m)=>{
        m.querySelector("[data-xu]").onclick=closeModal;
        const allCb=m.querySelector("#perm-all");
        const boxes=m.querySelectorAll('input[name="perm"]');
        allCb.onchange=()=>boxes.forEach(b=>b.checked=allCb.checked);

        const brAllCb=m.querySelector("#branch-all");
        const brBoxes=m.querySelectorAll('input[name="ubranch"]');
        const brDiv=m.querySelector("#branch-boxes");
        const syncBrVis=()=>{brDiv.style.opacity=brAllCb.checked?"0.4":"1";brBoxes.forEach(b=>b.disabled=brAllCb.checked);};
        brAllCb.onchange=()=>{brBoxes.forEach(b=>b.checked=brAllCb.checked);syncBrVis();};
        syncBrVis();

        const spAllCb=m.querySelector("#spec-all");
        const spBoxes=m.querySelectorAll('input[name="uspec"]');
        const spDiv=m.querySelector("#spec-boxes");
        const syncSpVis=()=>{spDiv.style.opacity=spAllCb.checked?"0.4":"1";spBoxes.forEach(b=>b.disabled=spAllCb.checked);};
        spAllCb.onchange=()=>{spBoxes.forEach(b=>b.checked=spAllCb.checked);syncSpVis();};
        syncSpVis();

        m.querySelector("#save-user").onclick=async()=>{
          const fd=new FormData(m.querySelector("#userf"));
          const name=fd.get("name")||"";
          const permissions=[...m.querySelectorAll('input[name="perm"]:checked')].map(c=>c.value);
          const branches=brAllCb.checked?["*"]:[...m.querySelectorAll('input[name="ubranch"]:checked')].map(c=>+c.value);
          const specialties=spAllCb.checked?["*"]:[...m.querySelectorAll('input[name="uspec"]:checked')].map(c=>c.value);
          const email=(fd.get("email")||"").trim().toLowerCase();
          if(!name.trim()){toast("أدخل اسم المستخدم","warn");return;}
          if(!email){toast("أدخل البريد المرتبط بالحساب","warn");return;}
          if(email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){toast("صيغة البريد غير صحيحة","warn");return;}

          try{
            if(isEdit){
              await api("/users/"+existing.id,{method:"PUT",body:{name:name.trim(),email,permissions,branches,specialties}});
            } else {
              await api("/users",{method:"POST",body:{name:name.trim(),email,permissions,branches,specialties}});
            }
            toast("✅ تم الحفظ","ok"); closeModal(); drawUsersPanel();
          }catch(e){toast("❌ "+e.message,"err");}
        };
      }});
  }

  // ---- Audit Log ----
  async function drawAuditPanel(){
    if(!can("audit_view")){ $("#ctrl-body").innerHTML=`<div class="empty-msg">🔒 لا تملك صلاحية لعرض سجل العمليات</div>`; return; }
    const {audit}=await api("/audit");
    const {branches}=await api("/branches");
    const brMap={}; branches.forEach(b=>brMap[b.id]=b.name);
    const users=[...new Set(audit.map(a=>a.user))].sort();
    const actions=[...new Set(audit.map(a=>a.action))].sort();
    const auditBranches=[...new Set(audit.filter(a=>a.branch).map(a=>a.branch))].sort();
    let fUser="",fAction="",fBranch="",fSearch="",fFrom="",fTo="";

    function drawList(){
      let list=[...audit];
      if(fUser) list=list.filter(a=>a.user===fUser);
      if(fAction) list=list.filter(a=>a.action===fAction);
      if(fBranch) list=list.filter(a=>a.branch===fBranch);
      if(fFrom) list=list.filter(a=>a.ts.slice(0,10)>=fFrom);
      if(fTo) list=list.filter(a=>a.ts.slice(0,10)<=fTo);
      if(fSearch){const q=fSearch.toLowerCase();list=list.filter(a=>(a.detail||"").toLowerCase().includes(q)||(a.user||"").toLowerCase().includes(q)||(a.action||"").toLowerCase().includes(q)||(a.branch||"").toLowerCase().includes(q));}
      const el=$("#audit-list"); if(!el)return;
      if(!list.length){el.innerHTML=`<div class="empty" style="padding:16px">لا نتائج</div>`;return;}
      el.innerHTML=`<div style="color:var(--muted);font-size:13px;margin-bottom:8px">${list.length} عملية</div>
        <div class="audit-cards">${list.map(a=>{
          const dt=a.ts?a.ts.replace("T"," "):"";
          const dPart=a.ts?a.ts.slice(0,10):"", tPart=a.ts?a.ts.slice(11,16):"";
          const detailHTML=esc(a.detail||"—").replace(/\n/g,"<br>");
          return `<div class="audit-row">
            <div class="audit-row-head">
              <span class="audit-user">👤 ${esc(a.user||"—")}</span>
              <span class="audit-action">${esc(a.action||"—")}</span>
              ${a.branch?`<span class="audit-branch">🏥 ${esc(a.branch)}</span>`:""}
            </div>
            <div class="audit-row-detail">${detailHTML}</div>
            <div class="audit-row-time">📅 ${esc(dPart)} · 🕐 ${esc(tPart)}</div>
          </div>`;
        }).join("")}</div>`;
    }

    $("#ctrl-body").innerHTML=`
      <div style="margin-bottom:12px">
        <div class="audit-filters">
          <input type="text" id="af-search" placeholder="بحث..." class="input" style="flex:2;min-width:140px" value="">
          <select id="af-user" class="input"><option value="">كل المستخدمين</option>${users.map(u=>`<option value="${esc(u)}">${esc(u)}</option>`).join("")}</select>
          <select id="af-action" class="input"><option value="">كل العمليات</option>${actions.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join("")}</select>
          <select id="af-branch" class="input"><option value="">كل الفروع</option>${auditBranches.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join("")}</select>
        </div>
        <div class="audit-filters" style="margin-top:6px">
          <label style="font-size:12px;color:var(--muted)">من</label>
          <input type="date" id="af-from" class="input" value="">
          <label style="font-size:12px;color:var(--muted)">إلى</label>
          <input type="date" id="af-to" class="input" value="">
        </div>
      </div>
      <div id="audit-list"><div class="loader"><div class="spin"></div></div></div>`;

    const bind=(id,fn)=>{const el=$("#"+id);if(el)el.oninput=el.onchange=fn;};
    bind("af-search",()=>{fSearch=$("#af-search").value;drawList();});
    bind("af-user",()=>{fUser=$("#af-user").value;drawList();});
    bind("af-action",()=>{fAction=$("#af-action").value;drawList();});
    bind("af-branch",()=>{fBranch=$("#af-branch").value;drawList();});
    bind("af-from",()=>{fFrom=$("#af-from").value;drawList();});
    bind("af-to",()=>{fTo=$("#af-to").value;drawList();});
    drawList();
  }

  // ---- الأمان ----
  // لم يعد هنا رمز عرض ولا رمز مدير: الدخول صار عبر Firebase Authentication،
  // وكلمات المرور تُدار في Firebase Console ولا تُخزَّن في قاعدة البيانات.
  async function drawSecurityPanel(){
    if(!can("settings_access")){ $("#ctrl-body").innerHTML=`<div class="empty-msg">🔒 لا تملك صلاحية لهذا القسم</div>`; return; }
    const me=(state.user&&state.user.name)||"";
    $("#ctrl-body").innerHTML=`
      <div class="cal" style="max-width:560px;margin-top:6px">
        <div style="font-weight:700;font-size:15px;margin-bottom:10px">🔐 الدخول والحسابات</div>
        <div class="page-sub" style="font-size:12.5px;line-height:2">
          الدخول محمي بحسابات <b>Firebase Authentication</b>. لا يقرأ البيانات ولا يكتبها
          إلا من سجّل دخوله بحساب حقيقي، والتحقق يتم على الخادم لا في المتصفح.
        </div>
        <div style="margin-top:14px;padding:12px;border-radius:10px;background:var(--card-2)">
          <div style="font-size:13px;line-height:2">
            • <b>الموظفون</b> — حساب مشترك للمشاهدة فقط<br>
            • <b>المديرون</b> — حساب خاص بكل واحد، بصلاحياته<br>
            • <b>كلمات المرور</b> — تُدار من Firebase Console وتُحفظ مشفّرة
          </div>
        </div>
        <div class="page-sub" style="margin-top:14px;font-size:12px">
          لتغيير كلمة مرور أو إضافة حساب أو إيقافه:
          <b>Firebase Console ← Authentication ← Users</b>.<br>
          ولربط الحساب بالصلاحيات داخل النظام، انتقل إلى تبويب <b>المستخدمين</b>.
        </div>
        ${me?`<div class="page-sub" style="margin-top:10px;font-size:12px">أنت مسجَّل الدخول باسم <b>${esc(me)}</b>.</div>`:""}
      </div>

      <div class="cal" style="max-width:560px;margin-top:16px">
        <div style="font-weight:700;font-size:15px;margin-bottom:6px">🔍 فحص سلامة البيانات</div>
        <div class="page-sub" style="font-size:12.5px;line-height:1.9;margin-bottom:12px">
          يقارن بيانات كل ممارس بأحدث نسخة احتياطية. رقم المراجعة يزيد ولا ينقص —
          فنقصانه دليل على تراجع في البيانات.
        </div>
        <button class="btn btn-primary btn-block" id="run-integrity" type="button">ابدأ الفحص</button>
        <div id="integrity-out" style="margin-top:14px"></div>
      </div>`;

    const btn=$("#run-integrity"), out=$("#integrity-out");
    btn.onclick=async()=>{
      btn.disabled=true; btn.textContent="جارٍ الفحص...";
      out.innerHTML=`<div class="loader"><div class="spin"></div></div>`;
      try{
        const r=await LocalDB.integrityCheck();
        const when=fmtStamp(new Date(new Date(r.snapshotTs).getTime()+3*3600000).toISOString());
        if(!r.reverted.length && !r.missing.length){
          out.innerHTML=`<div style="padding:14px;border-radius:10px;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.4)">
            <div style="font-weight:700;margin-bottom:4px">✅ لا يوجد تراجع</div>
            <div style="font-size:12.5px;line-height:1.9">
              فُحص <b>${r.checked}</b> ممارساً مقابل نسخة <b>${when}</b>.<br>
              لم ينقص رقم مراجعة أي ممارس، ولا يوجد ممارس مفقود.
            </div></div>`;
        } else {
          out.innerHTML=`<div style="padding:14px;border-radius:10px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.5)">
            <div style="font-weight:700;margin-bottom:6px">⚠️ تراجع محتمل</div>
            <div style="font-size:12.5px;line-height:1.9;margin-bottom:8px">
              مقارنةً بنسخة <b>${when}</b>:</div>
            ${r.reverted.length?`<table class="tbl" style="font-size:12.5px"><thead><tr>
              <th>الممارس</th><th>الحالي</th><th>المحفوظ</th><th>تاريخ التعديل</th></tr></thead><tbody>
              ${r.reverted.map(x=>`<tr><td>${esc(x.name)}</td><td>${x.now}</td><td><b>${x.saved}</b></td>
                <td>${esc(fmtStamp(x.is))} ← كان ${esc(fmtStamp(x.was))}</td></tr>`).join("")}
              </tbody></table>`:""}
            ${r.missing.length?`<div style="margin-top:8px">ممارسون مفقودون: <b>${r.missing.map(esc).join("، ")}</b></div>`:""}
            <div style="margin-top:10px;font-size:12px">أبلغ المدير الرئيسي — النسخ الاحتياطية تحفظ الحالة الصحيحة.</div>
          </div>`;
        }
      }catch(e){
        out.innerHTML=`<div class="empty-msg">❌ ${esc(e.message)}</div>`;
      }
      btn.disabled=false; btn.textContent="ابدأ الفحص";
    };
  }

  // ---- Specialties (sections) ----
  async function drawSpecialtiesPanel(){
    const [{specialties,extra},{doctors}]=await Promise.all([api("/specialties"),api("/doctors")]);
    const extraSet=new Set(extra);
    const docCount={};
    doctors.forEach(d=>{if(d.specialty)docCount[d.specialty]=(docCount[d.specialty]||0)+1;});

    const renderCards=()=>`
      <div class="spec-grid" id="spec-grid">
        ${specialties.map(s=>`
          <div class="spec-card ${extraSet.has(s)?"manual":""}">
            <div class="spec-card-top">
              <div class="spec-card-name">${esc(s)}</div>
              <span class="spec-doc-badge">${docCount[s]||0} ممارس</span>
            </div>
            <div class="spec-card-foot">
              <span class="spec-src-tag">${extraSet.has(s)?"مُضاف يدوياً":"تلقائي"}</span>
              ${extraSet.has(s)?`<div class="spec-actions">
                <button class="btn btn-ghost btn-xs" data-rename="${esc(s)}">✎ تعديل</button>
                <button class="btn btn-danger btn-xs" data-dspec="${esc(s)}">✕ حذف</button>
              </div>`:""}
            </div>
          </div>`).join("")}
      </div>`;

    $("#ctrl-body").innerHTML=`
      <div class="spec-add-card">
        <h3>＋ إضافة قسم جديد</h3>
        <div class="spec-add-row">
          <input id="new-spec" placeholder="اسم القسم مثل: طب أسرة، نفسية...">
          <button class="btn btn-primary" id="add-spec">إضافة</button>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div style="font-weight:700;font-size:14px">الأقسام (${specialties.length})</div>
        <div style="font-size:12px;color:var(--muted)">
          <span style="border-inline-start:3px solid var(--brand);padding-inline-start:6px;margin-inline-end:12px">مُضاف يدوياً</span>
          <span style="border-inline-start:3px solid var(--line);padding-inline-start:6px">تلقائي من الممارسين</span>
        </div>
      </div>
      ${renderCards()}`;

    const add=()=>{
      const name=$("#new-spec").value.trim();
      if(!name){toast("اكتب اسم القسم","warn");return;}
      api("/specialties",{method:"POST",body:{name}})
        .then(()=>{toast("✅ تمت إضافة القسم بنجاح","ok");drawSpecialtiesPanel();})
        .catch(e=>toast("❌ "+e.message,"err"));
    };
    $("#add-spec").onclick=add;
    $("#new-spec").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();add();}});

    document.querySelectorAll("[data-dspec]").forEach(btn=>btn.onclick=async()=>{
      if(!confirm(`حذف قسم "${btn.dataset.dspec}"؟`))return;
      try{await api("/specialties",{method:"DELETE",body:{name:btn.dataset.dspec}});toast("✅ تم حذف القسم بنجاح","ok");drawSpecialtiesPanel();}
      catch(e){toast("❌ "+e.message,"err");}
    });

    document.querySelectorAll("[data-rename]").forEach(btn=>btn.onclick=()=>{
      const oldName=btn.dataset.rename;
      openModal({title:"تعديل اسم القسم",
        bodyHTML:`<div class="field"><label>الاسم الجديد</label><input id="spec-new-name" value="${esc(oldName)}"></div>`,
        footHTML:`<button class="btn btn-primary" id="do-rename">حفظ</button><button class="btn btn-ghost" data-xr>إلغاء</button>`,
        onMount:(m)=>{
          m.querySelector("[data-xr]").onclick=closeModal;
          m.querySelector("#do-rename").onclick=async()=>{
            const newName=m.querySelector("#spec-new-name").value.trim();
            if(!newName)return;
            try{await api("/specialties",{method:"PUT",body:{old:oldName,new:newName}});
              toast("✅ تم تعديل القسم بنجاح","ok");closeModal();drawSpecialtiesPanel();}
            catch(e){toast("❌ "+e.message,"err");}
          };
        }
      });
    });
  }

  // ============================================================ BACKUP EXPORT
  // بناء وتنزيل ملف النسخة الاحتياطية (JSON) — مشترك بين الزر اليدوي والتصدير التلقائي
  function downloadBackupFile(auto){
    const db=LocalDB.call("GET","/export-db");
    if(!db) return false;
    const now=new Date();
    const _rn2=_riyadhNow();const ts=`${_rn2.getUTCFullYear()}${String(_rn2.getUTCMonth()+1).padStart(2,'0')}${String(_rn2.getUTCDate()).padStart(2,'0')}_${String(_rn2.getUTCHours()).padStart(2,'0')}${String(_rn2.getUTCMinutes()).padStart(2,'0')}`;
    const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`adelcare_backup${auto?"_auto":""}_${ts}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1500);
    return true;
  }
  // تصدير تلقائي مُساعَد بالمتصفح: عند فتح مسؤول للتطبيق ومرور المدة المحددة،
  // يُنزَّل ملف النسخة إلى جهازه تلقائياً ويُسجَّل التاريخ سحابياً (جهاز واحد/دورة)
  async function maybeAutoExport(){
    if(!state.user||!can("settings_access")) return;
    let s; try{ s=await api("/settings"); }catch(e){ return; }
    if(s.auto_export_enabled===false) return;
    const days=s.auto_export_days||7;
    const last=s.last_auto_export?new Date(s.last_auto_export).getTime():0;
    if(Date.now()-last < days*24*3600*1000) return;
    // ننزّل أولاً ثم نسجّل التاريخ — إن حجب المتصفح التنزيل لا نتخطّى الدورة كاملة
    const ok=downloadBackupFile(true);
    if(!ok) return;
    try{ await api("/settings",{method:"PUT",body:{last_auto_export:new Date().toISOString()}}); }catch(e){}
    setTimeout(()=>toast(`📦 تم تنزيل نسخة احتياطية تلقائية (كل ${days} يوم) إلى جهازك — احفظها في مكان آمن`,"ok"),1200);
  }

  // ============================================================ RENDER
  async function render(){
    if(!state.user){ renderLogin(); return; }
    const fn=routes[state.route]||routes.dashboard;
    await fn();
  }

  // ── تحديث ناعم: يُحدّث البيانات فقط مع الحفاظ على التركيز والمؤشر والتمرير والفلاتر ──
  let _softPending=false;
  async function softRender(){
    // لا تُقاطع المستخدم أثناء فتح نافذة (نموذج) — أجّل حتى إغلاقها
    const root=document.getElementById("modal-root");
    if(root&&root.children.length>0){ _softPending=true; return; }
    // التقاط حالة الواجهة قبل إعادة الرسم
    const ae=document.activeElement;
    const focusId=(ae&&ae.id)?ae.id:null;
    const canSel=ae&&("selectionStart"in ae);
    const selS=canSel?ae.selectionStart:null, selE=canSel?ae.selectionEnd:null;
    const sx=window.scrollX, sy=window.scrollY;
    try{ await render(); }catch(e){ return; }
    // استعادة التمرير أولاً ثم التركيز والمؤشر
    window.scrollTo(sx,sy);
    if(focusId){
      const el=document.getElementById(focusId);
      if(el){ try{ el.focus({preventScroll:true});
        if(selS!=null&&"setSelectionRange"in el){ el.setSelectionRange(selS,selE); }
      }catch(_){} }
    }
  }

  // ── فحص الإصدار: يجبر كل جهاز على تحميل آخر نسخة تلقائياً ──────
  function _currentVersion(){
    const m=document.querySelector('meta[name="app-version"]');
    return m?m.getAttribute('content'):null;
  }
  let _updateChecking=false;
  async function checkForUpdate(){
    if(_updateChecking)return;
    _updateChecking=true;
    const cur=_currentVersion();
    if(!cur){_updateChecking=false;return;}
    try{
      // cache-bust مزدوج: query string + رأس Cache-Control لتجاوز CDN والكاش المحلي
      const res=await fetch(location.pathname+'?_cv='+Date.now(),{
        cache:'no-store',
        headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}
      });
      if(!res.ok){_updateChecking=false;return;}
      const html=await res.text();
      const m=html.match(/<meta\s+name="app-version"\s+content="([^"]+)"/i);
      const latest=m?m[1]:null;
      if(!latest||latest===cur){_updateChecking=false;return;}
      // إصدار أحدث — تجنّب حلقة إعادة تحميل لا نهائية
      if(sessionStorage.getItem('adelcare_reloaded_for')===latest){_updateChecking=false;return;}
      sessionStorage.setItem('adelcare_reloaded_for',latest);
      toast("🔄 يتوفر تحديث جديد — جارٍ التحديث...","ok");
      setTimeout(()=>location.reload(true),1200);
    }catch(e){/* الشبكة غير متاحة — نتجاهل */}finally{_updateChecking=false;}
  }

  async function boot(){
    initTheme();
    // Show spinner while Firebase initializes
    document.getElementById("app").innerHTML=`<div class="loader" style="height:100vh"><div class="spin"></div></div>`;
    // الجلسة تُبنى من حساب Firebase المحفوظ — فإن لم يوجد حساب ظهرت شاشة الدخول
    const _sess=await LocalDB.restoreSession();
    state.user=(_sess&&_sess.auth)?_sess:null;
    state.route="dashboard"; state.params={};
    if(location.hash) history.replaceState(null,"","#dashboard");
    render();
    // تصدير تلقائي مُساعَد بالمتصفح (للمسؤولين) — نسخة خارج Firebase على جهاز حقيقي
    maybeAutoExport();
    // تحديث ناعم يحافظ على الفلاتر والبحث والتمرير والقسم المفتوح
    document.addEventListener('adelcare:sync', ()=>softRender());
    // تعارض: جهاز آخر حفظ قبلنا — رُفض حفظنا حمايةً لبياناته، ونُبلّغ المستخدم بوضوح
    document.addEventListener('adelcare:conflict', ()=>{
      toast("⚠️ تم تعديل البيانات من جهاز آخر — لم يُحفظ تعديلك الأخير. تم تحديث الشاشة، أعد إدخاله من فضلك.","warn",9000);
    });
    // نسخة قديمة: نحجب الواجهة فوراً — الحفظ مرفوض على الخادم أصلاً،
    // فالأفضل منع المستخدم من العمل بدل أن يكتشف الرفض بعد إدخال بياناته.
    document.addEventListener('adelcare:stale', (e)=>{
      if(document.getElementById('staleGate')) return;
      const d=(e&&e.detail)||{};
      const el=document.createElement('div');
      el.id='staleGate';
      el.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.96);display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px)';
      el.innerHTML=`<div style="max-width:440px;text-align:center;color:#fff;font-family:inherit">
        <div style="font-size:52px;margin-bottom:14px">🔄</div>
        <h2 style="margin:0 0 12px;font-size:22px">يلزم تحديث الصفحة</h2>
        <p style="margin:0 0 10px;line-height:1.9;opacity:.92">
          هذا الجهاز يعمل بنسخة قديمة من الموقع، ولحماية البيانات تم إيقاف الحفظ منه.
        </p>
        <p style="margin:0 0 20px;font-size:13px;opacity:.6">
          نسختك ${d.mine||'—'} · النسخة المطلوبة ${d.server||'—'}
        </p>
        <button id="staleGateBtn" style="background:#22c55e;color:#062;border:0;border-radius:10px;padding:13px 30px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit">
          تحديث الآن
        </button>
      </div>`;
      document.body.appendChild(el);
      const go=()=>{ try{sessionStorage.removeItem('adelcare_reloaded_for');}catch(_){}
                     location.replace(location.pathname+'?_v='+Date.now()+location.hash); };
      el.querySelector('#staleGateBtn').addEventListener('click',go);
      // تحديث تلقائي مرة واحدة فقط لكل جلسة — تفادياً لحلقة إعادة تحميل
      try{ if(!sessionStorage.getItem('adelcare_stale_auto')){ sessionStorage.setItem('adelcare_stale_auto','1'); setTimeout(go,2500); } }catch(_){}
    });
    document.addEventListener('adelcare:saveerror', (e)=>{
      toast("❌ تعذّر الحفظ: "+((e&&e.detail)||"تحقق من الاتصال")+" — أعد المحاولة.","err",9000);
    });
    setInterval(()=>{
      if(state.route==="dashboard"||state.route==="doctors") softRender();
    },60000);
    // فحص وجود إصدار أحدث: عند الإقلاع + كل 30 ثانية + عند العودة بأي طريقة
    checkForUpdate();
    setInterval(checkForUpdate,30*1000);
    // إعادة مزامنة إجبارية عند عودة الجهاز — تمنع تراكم بيانات قديمة
    // في جهاز بقي مفتوحاً أو نائماً لفترة طويلة (بلا حاجة لإغلاقه يدوياً)
    const _wake=()=>{ checkForUpdate(); LocalDB.resync(); };
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) _wake(); });
    window.addEventListener('focus',_wake);
    window.addEventListener('online',_wake);
    // pageshow يُعالج الرجوع من bfcache (الضغط على زر الرجوع)
    window.addEventListener('pageshow',(e)=>{ if(e.persisted) _wake(); });
    // مزامنة دورية احتياطية كل 5 دقائق (شبكة أمان لو تعطّل onSnapshot)
    setInterval(()=>{ if(!document.hidden) LocalDB.resync(); }, 5*60*1000);
  }
  return { boot };
})();
document.addEventListener("DOMContentLoaded",App.boot);

