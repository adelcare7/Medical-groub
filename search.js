/* ============ SmartSearch — محرك البحث الموحّد (الرئيسي + الممارسين) ============ */
const SmartSearch = (() => {
  const HONORIFICS = new Set(["د","دكتور","دكتوره","الدكتور","الدكتوره","استاذ","الاستاذ","طبيب","طبيبه"]);
  // كلمات وصل تُحذف فقط إذا بقيت كلمات أخرى (فقد تكون جزءاً من اسم: «منال»)
  const STOP = new Set(["الان","متاح","متاحين","موجود","حاضر","يوجد","عنده","عندهم",
    "ابحث","ابغا","ابغى","ايش","في","من","هل","هو","هي"]);
  const AR2LAT = {"ا":"a","ب":"b","ت":"t","ث":"th","ج":"j","ح":"h","خ":"kh",
    "د":"d","ذ":"th","ر":"r","ز":"z","س":"s","ش":"sh","ص":"s","ض":"d",
    "ط":"t","ظ":"z","ع":"a","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l",
    "م":"m","ن":"n","ه":"h","و":"w","ي":"y","ء":"","ئ":"","ؤ":""};

  // تطبيع عربي: تشكيل، همزات (ا أ إ آ)، ة/ه، ى/ي
  const norm = s => (s||"").trim()
    .replace(/[ً-ٰٟـ]/g,"")
    .replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه")
    .toLowerCase().replace(/\s+/g," ");
  // اسم مُنظّف: بلا ألقاب، الترقيم مسافات («د.محمد الشرفي» → «محمد الشرفي»)
  const cleanName = raw => norm(raw).replace(/[.,_\-\/\\()،]+/g," ")
    .split(/\s+/).filter(w=>w&&!HONORIFICS.has(w)).join(" ");
  const translit = s => { let o=""; for(const c of String(s||"")) o+=(AR2LAT[c]!==undefined?AR2LAT[c]:c); return o; };
  // هيكل السواكن: يجعل ahmed / ahmad / احمد تتطابق
  const skel = s => String(s||"").toLowerCase().replace(/[aeiouwy'`]/g,"").replace(/[^a-z0-9]/g,"");

  function tokenize(q){
    const raw=norm(q).split(/\s+/).filter(Boolean);
    const trimmed=raw.filter(t=>!STOP.has(t));
    return trimmed.length?trimmed:raw;   // لا نُفرِغ الاستعلام أبداً
  }
  // نص حالة الممارس للبحث (إجازة/ندب/زيارة/منتهي عقد/متواجد…)
  function statusText(live){
    const l=live||{}; const out=[];
    if(l.state==="terminated") out.push("منتهي العقد","منتهي عقد","منتهى");
    if(l.state==="leave")      out.push("اجازه","اجازة","مجاز","في اجازه");
    if(l.state==="off")        out.push("اجازه اسبوعيه","يوم اجازه");
    if(l.state==="present")    out.push("موجود","متواجد","حاضر","موجود الان");
    if(l.state==="upcoming")   out.push("يبدا لاحقا","قريبا");
    if(l.state==="finished")   out.push("انتهي دوامه","انتهي");
    if(l.isSecondment){        out.push("ندب","منتدب","منتدب الي");
      if(l.secondmentBranchName) out.push(l.secondmentBranchName);
      if(l.secondmentShiftLabel) out.push("ندب شفت", l.secondmentShiftLabel); }
    if(l.in_visit)             out.push("زياره","في زياره","زيارة");
    if(l.leaveType)            out.push(l.leaveType);
    if(l.label)                out.push(l.label);
    return norm(out.join(" "));
  }

  // درجة مطابقة الاسم — على العبارة كاملة أولاً ثم على الكلمات
  function nameScore(nameN, qNorm, tokens){
    if(!nameN||!qNorm) return 0;
    const ws=nameN.split(" ").filter(Boolean);
    if(nameN===qNorm)                                return 100000; // 1) تطابق كامل
    if(nameN.startsWith(qNorm))                      return  70000; // 2) يبدأ بالمكتوب
    if(ws.some(w=>w===qNorm))                        return  60000;
    if(nameN.includes(qNorm))                        return  50000; // 3) أي جزء من الاسم
    if(!tokens.length) return 0;
    if(tokens.every(t=>ws.some(w=>w===t)))           return  40000;
    if(tokens.every(t=>ws.some(w=>w.startsWith(t)))) return  30000;
    if(tokens.every(t=>nameN.includes(t)))           return  20000;
    return 0;
  }
  // حذف أداة التعريف «ال» من بداية الكلمات — ليتطابق «التشقير» مع «تشقير» والعكس
  const stripAl = s => String(s||"").replace(/(^|[\s\-.,\/()،])ال/g, "$1");
  function _fs(t, vn, cap){
    if(!vn||!t) return 0;
    const ws=vn.split(/\s+/).filter(Boolean);
    if(vn===t)                      return cap;
    if(vn.startsWith(t))            return Math.round(cap*0.80);
    if(ws.some(w=>w===t))           return Math.round(cap*0.70);
    if(ws.some(w=>w.startsWith(t))) return Math.round(cap*0.50);
    if(vn.includes(t))              return Math.round(cap*0.25);
    return 0;
  }
  function fieldScore(t, vn, cap){
    if(!vn||!t) return 0;
    const direct=_fs(t,vn,cap);
    if(direct) return direct;
    // محاولة ثانية بعد تجريد «ال» من الطرفين (بدرجة أقل قليلاً)
    const tA=stripAl(t), vA=stripAl(vn);
    if((tA!==t||vA!==vn)&&tA) return Math.round(_fs(tA,vA,cap)*0.95);
    return 0;
  }
  function codeScore(t, id){
    if(!/^\d+$/.test(t)) return 0;
    const ids=String(id);
    if(ids===t)           return 480;
    if(ids.startsWith(t)) return 250;
    if(ids.includes(t))   return 120;
    return 0;
  }

  /**
   * التقييم الموحّد. f = {name, specialty, branch, nationality, status,
   *   rank, qualification, gender, experience, hours, cases, coord, languages, id}
   * يُعيد 0 إذا لم يُطابق.
   */
  function score(query, f){
    const qNorm=norm(query);
    if(!qNorm) return 1;
    const tokens=tokenize(query);
    if(!tokens.length) return 1;

    const nameN=cleanName(f.name);
    const hasLatin=/[a-z]/.test(qNorm);
    const qSkel=hasLatin?skel(qNorm):"";
    const nameSkel=hasLatin?skel(translit(nameN)):"";
    // اسم إنجليزي مُخزَّن (إن وُجد) + نقحرة الاسم العربي
    const enName=norm(f.en_name||"");

    let nameSc=nameScore(nameN,qNorm,tokens);
    if(enName) nameSc=Math.max(nameSc, nameScore(enName,qNorm,tokens));
    if(hasLatin&&qSkel&&nameSkel){
      if(nameSkel===qSkel)               nameSc=Math.max(nameSc,90000);
      else if(nameSkel.startsWith(qSkel))nameSc=Math.max(nameSc,62000);
      else if(nameSkel.includes(qSkel))  nameSc=Math.max(nameSc,45000);
    }

    const F={
      specialty:norm(f.specialty), branch:norm(f.branch), nationality:norm(f.nationality),
      status:norm(f.status), rank:norm(f.rank), qualification:norm(f.qualification),
      gender:norm(f.gender), experience:norm(f.experience), hours:norm(f.hours),
      cases:norm(f.cases), coord:norm(f.coord), languages:norm(f.languages)
    };

    // استعلام قصير جداً (حرفان مثل «تش» أو «من»): يُطابق الاسم والرمز
    // والتخصص/القسم فقط — دون الحقول النصية الطويلة (جنسية/حالات/ملاحظات) تفادياً للضجيج.
    const shortQuery = qNorm.replace(/\s/g,"").length < 3;

    let fieldTotal=0;
    for(const t of tokens){
      const inName = nameN.includes(t) || (enName&&enName.includes(t)) ||
                     (hasLatin&&nameSkel&&nameSkel.includes(skel(t)));
      const code=codeScore(t,f.id);
      const s = shortQuery ? Math.max(code, fieldScore(t,F.specialty,5000)) : Math.max(
        fieldScore(t,F.specialty,   5000),  // 4/5) التخصص والقسم
        fieldScore(t,F.branch,      4000),  // 6) الفرع
        fieldScore(t,F.nationality, 3000),  // 7) الجنسية
        fieldScore(t,F.status,      2500),  // الحالة (إجازة/ندب/زيارة/منتهي عقد)
        fieldScore(t,F.rank,        1500),  // 8) بقية البيانات
        fieldScore(t,F.qualification,1200),
        fieldScore(t,F.gender,       800),
        fieldScore(t,F.experience,   800),
        fieldScore(t,F.hours,        800),
        fieldScore(t,F.cases,        600),
        fieldScore(t,F.coord,        600),
        fieldScore(t,F.languages,    600),
        code
      );
      if(!inName && !s) return 0;   // كل كلمة يجب أن تُطابق شيئاً
      fieldTotal+=s;
    }
    if(!nameSc && !fieldTotal) return 0;
    return nameSc*4 + fieldTotal;   // الاسم يهيمن دائماً
  }

  return {norm, cleanName, translit, skel, tokenize, statusText, score, fieldScore, codeScore};
})();

/* ============ Adelcare API — Firebase Firestore ============ */
const LocalDB = (() => {
  const SESS = 'adelcare_sess';

  // ── Firebase ──────────────────────────────────────────────────
  const _FB_CFG = {
    apiKey: "AIzaSyA8iuJ9hyCavICOcVOn-LAr0dTW_5thzYQ",
    authDomain: "adelcare7-26fd7.firebaseapp.com",
    projectId: "adelcare7-26fd7",
    storageBucket: "adelcare7-26fd7.firebasestorage.app",
    messagingSenderId: "86720349255",
    appId: "1:86720349255:web:9914fd1906ccd623349d62"
  };

  let _memDB = null, _memSess = {auth:false,edit:false,userId:null,name:null,permissions:[],branches:[],specialties:[]};
  const SESS_TTL = 8 * 60 * 60 * 1000; // 8-hour session expiry
  const FAIL_KEY = "adelcare_fails";
  // Restore persisted lockout on boot
  const _fails = (()=>{ try{return JSON.parse(localStorage.getItem(FAIL_KEY)||"{}");}catch(e){return {};} })();
  let _fsDB, _fsColl, _initPromise, _lastWriteTs = 0;
  // _baseMain = نص مستند main كما هو على الخادم حسب علمنا — أساس المقارنة قبل أي كتابة
  let _baseMain = null, _baseAudit = null, _casBusy = false, _casPending = false;

  // ── قفل الإصدار: يمنع جهازاً يعمل بنسخة قديمة من الكتابة ────────────
  // الخلفية: جهاز بنسخة قديمة (بلا حماية القفل التفاؤلي) استطاع في 16/8
  // أن يمسح عمل ثمانية أيام.
  // مهم: كود العميل وحده لا يكفي — الأجهزة القديمة لا تملك هذا الحاجز أصلاً.
  // لذلك يُرفق رقم الإصدار في حقل `ver` مع كل كتابة، وقاعدة Firestore على
  // الخادم ترفض أي كتابة بلا `ver` أو بـ `ver` أقدم. الكود هنا يوفّر التجربة
  // (حجب الواجهة مبكراً)، والقاعدة توفّر الضمان.
  const _APP_VER = (function(){
    const m = document.querySelector('meta[name="app-version"]');
    return m ? (m.getAttribute('content') || '') : '';
  })();
  let _serverVer = null, _isStale = false;

  // مقارنة رقمية جزءاً جزءاً — لا تعتمد على ترتيب النصوص
  function _verCmp(a, b) {
    const pa = String(a||'').split('-').map(n => parseInt(n, 10) || 0);
    const pb = String(b||'').split('-').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const x = pa[i] || 0, y = pb[i] || 0;
      if (x !== y) return x < y ? -1 : 1;
    }
    return 0;
  }

  // يُستدعى كلما وصلنا رقم إصدار من الخادم
  function _noteServerVer(v) {
    if (!v || !_APP_VER) return;
    _serverVer = v;
    if (_verCmp(_APP_VER, v) < 0 && !_isStale) {
      _isStale = true;
      document.dispatchEvent(new CustomEvent('adelcare:stale', { detail: { mine: _APP_VER, server: v } }));
    }
  }
  // مستند واحد (main) لكل البيانات + مستند منفصل للسجل (audit) — نفس صيغة الموقع الحي
  let _lastMain = null, _lastAudit = null; // آخر قيمة مكتوبة/مقروءة — لتجنب الكتابة غير الضرورية

  function load() { return _memDB; }

  const _permOk = (s, perm) => { if(!s.auth) return false; const p=s.permissions||[]; return p.includes("*")||p.includes(perm); };

  function getSession() {
    try {
      const s=localStorage.getItem(SESS);
      if(!s) return _memSess;
      const parsed=JSON.parse(s);
      // Expire stale sessions
      if(parsed.auth && parsed.exp && Date.now() > parsed.exp){
        const blank={auth:false,edit:false,userId:null,name:null,permissions:[],branches:[],specialties:[]};
        _memSess=blank; localStorage.removeItem(SESS); return blank;
      }
      // جلسة تدّعي صلاحية تعديل بلا حساب حقيقي خلفها (انتهت أو عُبث بالتخزين):
      // نخفضها إلى مشاهدة فقط، فلا تُعرض أزرار سيرفضها الخادم على أي حال.
      if(parsed.userId && _fsColl && !_isRealAuth()){
        const ro={auth:true, edit:false, userId:null, name:"زائر", permissions:[], branches:[], specialties:[]};
        _memSess=ro; try{localStorage.setItem(SESS,JSON.stringify(ro));}catch(e){} return ro;
      }
      return parsed;
    } catch(e) { return _memSess; }
  }
  function setSession(s) {
    // Attach expiry only for authenticated sessions
    const withExp = s.auth ? {...s, exp: Date.now()+SESS_TTL} : s;
    _memSess = withExp;
    try { localStorage.setItem(SESS, JSON.stringify(withExp)); } catch(e) {}
  }

  // بنية main = كل شيء عدا السجل (audit)
  function _mainObj(db) { const {audit, ...main} = db; return main; }

  // ── المصادقة الحقيقية (Firebase Authentication) ────────────────────
  // الصلاحيات داخل الواجهة تبقى من سجل المستخدم في settings.users،
  // أما حقّ الكتابة على قاعدة البيانات فتفرضه قواعد Firestore على الخادم:
  // لا يكتب إلا من سجّل دخوله ببريد وكلمة مرور (لا الحساب المجهول).
  function _authUser() { try { return firebase.auth().currentUser; } catch(e) { return null; } }
  function _isRealAuth() { const u = _authUser(); return !!(u && !u.isAnonymous); }

  // رسائل Firebase الإنجليزية غير مفهومة للمستخدم — نترجم الشائع منها
  function _authErrAr(code) {
    switch (code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials': return 'كلمة المرور غير صحيحة';
      case 'auth/user-not-found':            return 'لا يوجد حساب لهذا المستخدم — راجع المدير الرئيسي';
      case 'auth/user-disabled':             return 'هذا الحساب موقوف';
      case 'auth/too-many-requests':         return 'محاولات كثيرة — انتظر قليلاً ثم أعد المحاولة';
      case 'auth/network-request-failed':    return 'تعذّر الاتصال بالشبكة';
      case 'auth/operation-not-allowed':     return 'الدخول بالبريد غير مفعّل في Firebase — راجع المدير الرئيسي';
      case 'auth/invalid-email':             return 'البريد المرتبط بهذا المستخدم غير صحيح';
      default: return 'تعذّر تسجيل الدخول';
    }
  }

  const STAFF_EMAIL = 'staff@adelcare.local';   // حساب الموظفين المشترك — مشاهدة فقط
  const MAIL_DOMAIN = '@adelcare.local';

  // يقبل اسم المستخدم القصير (amer) أو البريد الكامل
  function _toEmail(idOrEmail) {
    const v = (idOrEmail || '').trim().toLowerCase();
    return v.includes('@') ? v : (v ? v + MAIL_DOMAIN : '');
  }

  // تُبنى الجلسة من الحساب المسجَّل — لا من مدخلات المستخدم
  function _sessionFromAuth() {
    const au = _authUser();
    if (!au || au.isAnonymous) {
      setSession({auth:false,edit:false,userId:null,name:null,permissions:[],branches:[],specialties:[]});
      return getSession();
    }
    const email = (au.email || '').toLowerCase();
    const db = load();
    const usr = db ? (db.settings.users || []).find(u => (u.email||'').toLowerCase() === email && u.active) : null;
    if (usr) {
      setSession({ auth:true, edit:true, userId:usr.id, name:usr.name,
        permissions: usr.permissions || [], branches: usr.branches || ["*"],
        specialties: usr.specialties || ["*"] });
    } else {
      // حساب صحيح بلا سجل صلاحيات (حساب الموظفين مثلاً) ⇒ مشاهدة فقط
      setSession({ auth:true, edit:false, userId:null,
        name: email === STAFF_EMAIL ? "موظف" : "زائر",
        permissions:[], branches:[], specialties:[] });
    }
    return getSession();
  }

  async function _signInUser(idOrEmail, password) {
    const email = _toEmail(idOrEmail);
    if (!email) throw Object.assign(new Error('أدخل اسم المستخدم'), {status:401});
    await _ensureFirebase();
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (e) {
      throw Object.assign(new Error(_authErrAr(e && e.code)), {status:401});
    }
    await ensureInit();      // الآن فقط تُقرأ البيانات
    return _sessionFromAuth();
  }

  // الخروج ينهي الجلسة تماماً — لا قراءة بعده حتى دخول جديد
  async function _signOutUser() {
    try { await firebase.auth().signOut(); } catch (e) {}
    _initPromise = null; _fsDB = null; _fsColl = null; _memDB = null;
    _baseMain = null; _baseAudit = null; _lastMain = null; _lastAudit = null;
    setSession({auth:false, edit:false, userId:null, name:null, permissions:[], branches:[], specialties:[]});
  }

  // ── كتابة محمية بقفل تفاؤلي: ترفض الحفظ إن تغيّرت البيانات على الخادم ──
  // تمنع جهازاً ببيانات قديمة من الكتابة فوق عمل جهاز آخر (Lost Update).
  async function _casSave() {
    if (!_fsColl || !_fsDB || !_memDB) return;
    if (_casBusy) { _casPending = true; return; }   // تسلسل الكتابات
    _casBusy = true;
    try {
      const mainStr  = JSON.stringify(_mainObj(_memDB));
      const auditStr = JSON.stringify(_memDB.audit || []);
      const mainChanged  = (mainStr  !== _baseMain);
      const auditChanged = (auditStr !== _baseAudit);
      if (mainChanged || auditChanged) {
        _lastWriteTs = Date.now();
        // المستندان في معاملة واحدة — والسجل محمي بنفس القفل مثل البيانات
        await _fsDB.runTransaction(async tx => {
          const mRef = _fsColl.doc('main'), aRef = _fsColl.doc('audit');
          const mSnap = await tx.get(mRef);
          const aSnap = await tx.get(aRef);
          // بوابة الإصدار: نسختنا أقدم مما على الخادم ⇒ نُمنع من الكتابة نهائياً
          const vServer = mSnap.exists ? (mSnap.data() || {}).ver : null;
          if (_APP_VER && vServer && _verCmp(_APP_VER, vServer) < 0) {
            const e = new Error('STALE'); e.__stale = true; e.__server = vServer; throw e;
          }
          const mServer = mSnap.exists ? (mSnap.data() || {}).data : null;
          const aServer = aSnap.exists ? (aSnap.data() || {}).data : null;
          // تعارض: الخادم يحمل نسخة لا نعرفها ⇒ لا نكتب فوقها
          if (_baseMain  !== null && typeof mServer === 'string' && mServer !== _baseMain)  { const e=new Error('CONFLICT'); e.__conflict=true; throw e; }
          if (_baseAudit !== null && typeof aServer === 'string' && aServer !== _baseAudit) { const e=new Error('CONFLICT'); e.__conflict=true; throw e; }
          // `ver` مرفق مع كل كتابة — عليه تعتمد قاعدة الخادم في رفض النسخ القديمة
          if (mainChanged)  tx.set(mRef, { data: mainStr,  ver: _APP_VER });
          if (auditChanged) tx.set(aRef, { data: auditStr, ver: _APP_VER });
        });
        if (mainChanged)  { _baseMain  = mainStr;  _lastMain  = mainStr; }
        if (auditChanged) { _baseAudit = auditStr; _lastAudit = auditStr; }
      }
    } catch (e) {
      if (e && e.__stale) {
        // نسخة قديمة — لا نلمس البيانات إطلاقاً، ونُجبر الجهاز على التحديث
        _noteServerVer(e.__server);
      } else if (e && e.__conflict) {
        // اسحب أحدث نسخة من الخادم حتى لا نبقى على بيانات قديمة
        try {
          const s = await _fsColl.doc('main').get();
          const raw = s.exists ? (s.data() || {}).data : null;
          if (typeof raw === 'string') {
            const m = JSON.parse(raw);
            _memDB.doctors  = m.doctors  || [];
            _memDB.branches = m.branches || [];
            _memDB.leaves   = m.leaves   || [];
            _memDB.settings = m.settings || {};
            _memDB._seq     = m._seq     || _memDB._seq;
            _baseMain = raw; _lastMain = raw;
          }
        } catch (_) {}
        try {
          const a = await _fsColl.doc('audit').get();
          const araw = a.exists ? (a.data() || {}).data : null;
          if (typeof araw === 'string') { _memDB.audit = JSON.parse(araw); _baseAudit = araw; _lastAudit = araw; }
        } catch (_) {}
        document.dispatchEvent(new CustomEvent('adelcare:conflict'));
        document.dispatchEvent(new CustomEvent('adelcare:sync'));
      } else {
        console.error('[Adelcare] save:', e);
        document.dispatchEvent(new CustomEvent('adelcare:saveerror', {detail: String((e && e.message) || e)}));
      }
    } finally {
      _casBusy = false;
      if (_casPending) { _casPending = false; _casSave(); }
    }
  }

  // إعادة مزامنة إجبارية من الخادم — تُستدعى عند عودة الجهاز للواجهة.
  // تمنع تراكم بيانات قديمة في جهاز بقي مفتوحاً/نائماً لفترة طويلة.
  async function _forceResync() {
    if (!_fsColl || !_memDB || _casBusy) return;
    try {
      const [mS, aS] = await Promise.all([_fsColl.doc('main').get(), _fsColl.doc('audit').get()]);
      if (mS.exists) _noteServerVer((mS.data() || {}).ver);
      const mRaw = mS.exists ? (mS.data() || {}).data : null;
      const aRaw = aS.exists ? (aS.data() || {}).data : null;
      let changed = false;
      if (typeof mRaw === 'string' && mRaw !== _baseMain) {
        const m = JSON.parse(mRaw);
        _memDB.doctors  = m.doctors  || [];
        _memDB.branches = m.branches || [];
        _memDB.leaves   = m.leaves   || [];
        _memDB.settings = m.settings || {};
        _memDB._seq     = m._seq     || _memDB._seq;
        _baseMain = mRaw; _lastMain = mRaw; changed = true;
      }
      if (typeof aRaw === 'string' && aRaw !== _baseAudit) {
        _memDB.audit = JSON.parse(aRaw); _baseAudit = aRaw; _lastAudit = aRaw;
      }
      if (changed) document.dispatchEvent(new CustomEvent('adelcare:sync'));
    } catch (e) { /* الشبكة غير متاحة — onSnapshot سيلحق لاحقاً */ }
  }

  // ── بصمة التعديل ───────────────────────────────────────────────────
  // تُختم في save() لا في كل مسار تعديل على حدة — فلا يفوتها مسار.
  // البصمة جزء من بيانات الممارس: أي جهاز يكتب حالة قديمة يكتب بصمتها
  // القديمة معها، فيظهر التراجع فوراً في البطاقة (تاريخ يرجع للخلف).

  // تسلسل ثابت لا يتأثر بترتيب المفاتيح — وإلا ظهرت تعديلات وهمية
  function _stable(v){
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(_stable).join(',') + ']';
    return '{' + Object.keys(v).sort()
      .map(k => JSON.stringify(k) + ':' + _stable(v[k])).join(',') + '}';
  }
  function _docPrint(d){ const {updated_at, updated_by, _rev, ...rest} = d; return _stable(rest); }

  function _stampDoctors(db){
    if (!db || !Array.isArray(db.doctors) || !_lastMain) return;
    let prev;
    try {
      prev = {};
      (JSON.parse(_lastMain).doctors || []).forEach(d => { prev[d.id] = _docPrint(d); });
    } catch(e) { return; }   // بلا مرجع موثوق لا نختم — ختم كاذب أسوأ من لا ختم
    const who = (getSession().name) || "غير معروف";
    const now = _riyadhTS();
    db.doctors.forEach(d => {
      const old = prev[d.id];
      const changed = (old === undefined) || (old !== _docPrint(d));
      if (!changed) return;
      d._rev = (typeof d._rev === 'number' ? d._rev : 0) + 1;
      d.updated_at = now;
      d.updated_by = who;
    });
  }

  function save(db) {
    _memDB = db;
    _stampDoctors(db);
    if (_fsColl) _casSave();
    try{
      // Strip PINs from local backup to avoid sensitive data in plaintext browser storage
      const safeDb=JSON.parse(JSON.stringify(db));
      if(safeDb.settings&&safeDb.settings.users) safeDb.settings.users=safeDb.settings.users.map(({pin:_,...u})=>u);
      localStorage.setItem('adelcare_backup', JSON.stringify(safeDb));
      localStorage.setItem('adelcare_backup_ts', new Date().toISOString());
    }catch(e){}
    _maybeDailySnapshot();
    _scheduleOpSnapshot();   // نسخة تشغيلية موثّقة بعد كل عملية
  }

  // ══════════════════════════════════════════════════════════════════
  //  نظام النسخ الاحتياطي الاحترافي (Version History في Firestore)
  //  ─ نسخة تلقائية بعد كل عملية (إضافة/تعديل/حذف) عبر debounce قصير
  //  ─ نسخة يومية أساسية + نسخة قبل كل استعادة/استيراد/تصفير
  //  ─ نسخة يدوية عند الطلب — كل نسخة موثّقة (وقت/عملية/مستخدم/أعداد)
  //  ─ يُحتفظ بسجل متدرّج حسب النوع (تقليم تلقائي)
  // ══════════════════════════════════════════════════════════════════
  //  ─ التصميم: كل نسخة = مستند بيانات (data blob) في adelcare_snapshots،
  //    مع مستند فهرس واحد "snap_index" يحوي بيانات وصفية خفيفة لكل النسخ.
  //    (ملاحظة: Firestore يحجز المعرّفات بنمط __..__ لذا لا يمكن استخدام "__index__")
  //    العرض/التقليم يقرآن الفهرس فقط (بايتات) — لا يُنزَّل أي blob إلا عند الاستعادة.
  const SNAP_KEEP = { op:60, auto:30, pre:20, manual:40 }; // الحد لكل نوع
  const OP_SNAP_DEBOUNCE = 1500;   // تجميع الحفظات المتتالية (مللي ثانية)
  let _snapInFlight = false;
  let _opTimer = null, _opPending = null, _snapIndexReady = false;

  function _snapColl(){ return _fsDB ? _fsDB.collection('adelcare_snapshots') : null; }
  function _snapIndexRef(){ const c=_snapColl(); return c ? c.doc('snap_index') : null; }
  function _snapKind(id){
    if(id.startsWith('op_'))     return 'op';
    if(id.startsWith('auto_'))   return 'auto';
    if(id.startsWith('manual_')) return 'manual';
    if(id.startsWith('pre_'))    return 'pre';
    return 'op';
  }
  // بناء الفهرس لمرة واحدة من النسخ القديمة (ترحيل من الصيغة السابقة)
  async function _bootstrapSnapIndex(){
    const coll=_snapColl(), idxRef=_snapIndexRef(); if(!coll||!idxRef) return [];
    try{
      const qs=await coll.get(); const list=[];
      qs.docs.forEach(d=>{ if(d.id==='snap_index'||d.id==='__index__') return; const dd=d.data()||{};
        list.push({ id:d.id, ts:dd.ts||"", action:dd.action||"", user:dd.user||"",
          kind:dd.kind||_snapKind(d.id), n:dd.n||null }); });
      list.sort((a,b)=>a.ts<b.ts?1:-1);
      await idxRef.set({ list });
      return list;
    }catch(e){ console.error('[Adelcare] bootstrap snap index:',e); return []; }
  }
  // ضمان وجود الفهرس قبل أي كتابة — يبني من النسخ القديمة مرة واحدة (يحمي من فقدها)
  async function _ensureSnapIndex(){
    if(_snapIndexReady) return;
    const ref=_snapIndexRef(); if(!ref){ return; }
    try{ const s=await ref.get(); if(!s.exists) await _bootstrapSnapIndex(); }
    catch(e){ console.error('[Adelcare] ensure snap index:',e); }
    _snapIndexReady=true;
  }
  // قراءة الفهرس (خفيف) — قائمة بيانات وصفية مرتّبة (الأحدث أولاً)
  async function _readSnapIndex(){
    const ref=_snapIndexRef(); if(!ref) return [];
    try{
      const s=await ref.get();
      if(!s.exists){ const l=await _bootstrapSnapIndex(); _snapIndexReady=true; return l; } // ترحيل لمرة واحدة
      _snapIndexReady=true;
      const list=(s.data().list)||[];
      return Array.isArray(list)?list.slice().sort((a,b)=>a.ts<b.ts?1:-1):[];
    }catch(e){ console.error('[Adelcare] read snap index:',e); return []; }
  }
  // كتابة نسخة: (1) مستند البيانات (2) تحديث الفهرس + تقليم — والتقليم يقرأ الفهرس فقط
  async function _writeSnapshot(id, db, meta){
    const coll=_snapColl(); const src=db||_memDB;
    if(!coll||!src||!_fsDB) return;
    await _ensureSnapIndex();   // يضمن ترحيل النسخ القديمة قبل أول كتابة (يمنع فقدها)
    const {audit, ...main}=src;
    const ts=new Date().toISOString(); const m=meta||{};
    const entry={ id, ts, action:m.action||"", user:m.user||"", kind:m.kind||_snapKind(id),
      n:{ doctors:(main.doctors||[]).length, branches:(main.branches||[]).length, leaves:(main.leaves||[]).length } };
    // 1) مستند البيانات (blob) — منفصل عن الفهرس.
    //    السجل (audit) يُحفظ داخل النسخة أيضاً: كان يُستثنى، فإذا مُحي السجل
    //    ضاع للأبد (فجوة 9–15 أغسطس مثال). حفظه هنا يجعله قابلاً للاسترجاع.
    //    ملاحظة: الاستعادة لا تكتب السجل فوق الحالي — يُستخدم عند الحاجة فقط.
    await coll.doc(id).set({ data: JSON.stringify({ ...main, audit: audit || [] }), ts });
    // 2) تحديث الفهرس بمعاملة آمنة + تحديد النسخ الزائدة للحذف
    const idxRef=_snapIndexRef(); let toDelete=[];
    try{
      await _fsDB.runTransaction(async tx=>{
        const s=await tx.get(idxRef);
        let list=(s.exists&&Array.isArray(s.data().list))?s.data().list.slice():[];
        list=list.filter(e=>e.id!==id); list.push(entry);
        const byKind={}; list.forEach(e=>{ (byKind[e.kind]=byKind[e.kind]||[]).push(e); });
        let kept=[]; toDelete=[];
        for(const k in byKind){
          const cap=SNAP_KEEP[k]||30;
          const arr=byKind[k].sort((a,b)=>a.ts<b.ts?1:-1); // الأحدث أولاً
          kept=kept.concat(arr.slice(0,cap));
          toDelete=toDelete.concat(arr.slice(cap).map(e=>e.id));
        }
        kept.sort((a,b)=>a.ts<b.ts?1:-1);
        tx.set(idxRef,{ list:kept });
      });
    }catch(e){ console.error('[Adelcare] snap index tx:',e); }
    // 3) حذف مستندات البيانات الزائدة (خارج المعاملة)
    for(const did of toDelete){ if(did!==id){ try{ await coll.doc(did).delete(); }catch(e){} } }
  }
  // نسخة يومية أساسية (مرة كل يوم)
  function _maybeDailySnapshot(){
    if(_snapInFlight||!_fsDB||!_memDB) return;
    const today=new Date().toISOString().slice(0,10);
    let done=null; try{ done=localStorage.getItem('adelcare_snap_date'); }catch(e){}
    if(done===today) return;
    _snapInFlight=true;
    _writeSnapshot('auto_'+today, null, {kind:'auto', action:'نسخة يومية تلقائية'}).then(()=>{
      try{ localStorage.setItem('adelcare_snap_date', today); }catch(e){}
    }).catch(e=>console.error('[Adelcare] daily snapshot:', e))
      .finally(()=>{ _snapInFlight=false; });
  }
  // نسخة تشغيلية بعد كل عملية — مع debounce لتجميع الحفظات المتلاحقة
  function _scheduleOpSnapshot(){
    if(!_fsDB) return;
    const a=_lastAction;
    _opPending = { action:(a&&a.action)||"تحديث بيانات", user:(a&&a.user)||"", count:((_opPending&&_opPending.count)||0)+1 };
    if(_opTimer) clearTimeout(_opTimer);
    _opTimer=setTimeout(()=>{
      const p=_opPending; _opPending=null; _opTimer=null;
      if(!p) return;
      const label = p.count>1 ? `${p.action} (+${p.count-1} عملية)` : p.action;
      const id='op_'+new Date().toISOString().replace(/[:.]/g,'-').slice(0,23);
      _writeSnapshot(id, null, {kind:'op', action:label, user:p.user})
        .catch(e=>console.error('[Adelcare] op snapshot:', e));
    }, OP_SNAP_DEBOUNCE);
  }

  async function _writeAllSections(db) {
    if (!_fsColl) return;
    _lastWriteTs = Date.now();
    const mainStr = JSON.stringify(_mainObj(db));
    const auditStr = JSON.stringify(db.audit || []);
    _lastMain = mainStr; _lastAudit = auditStr; _baseMain = mainStr; _baseAudit = auditStr;
    await Promise.all([
      _fsColl.doc('main').set({ data: mainStr,  ver: _APP_VER }),
      _fsColl.doc('audit').set({ data: auditStr, ver: _APP_VER })
    ]);
  }

  // تهيئة Firebase وانتظار استعادة الجلسة المحفوظة — بلا أي قراءة للبيانات
  let _fbReady = null;
  function _ensureFirebase() {
    if (!_fbReady) _fbReady = (async () => {
      firebase.initializeApp(_FB_CFG);
      await new Promise(res => { const un = firebase.auth().onAuthStateChanged(() => { un(); res(); }); });
    })();
    return _fbReady;
  }

  async function _doInit() {
    await _ensureFirebase();
    // لا قراءة قبل تسجيل الدخول — القواعد على الخادم تمنعها أصلاً،
    // ونمنعها هنا أيضاً حتى لا تظهر شاشة فارغة أو أخطاء صلاحيات.
    // حساب مجهول لا يكفي — قد يكون بقيّة جلسة قديمة، والقواعد سترفضه
    if (!_isRealAuth()) {
      try { if (firebase.auth().currentUser) await firebase.auth().signOut(); } catch (e) {}
      const e = new Error('NEEDS_LOGIN'); e.__needsLogin = true; throw e;
    }
    _fsDB   = firebase.firestore();
    _fsColl = _fsDB.collection('adelcare');

    const parseRaw = (raw, fallback) => {
      try { return raw && typeof raw.data === 'string' ? JSON.parse(raw.data) : fallback; }
      catch(e) { return fallback; }
    };

    const defSeq = {doctors:200, branches:10, leaves:50, audit:100};
    const mainSnap  = await _fsColl.doc('main').get();
    // بوابة الإصدار عند الإقلاع — رقم الإصدار مرافق لمستند البيانات نفسه
    if (mainSnap.exists) _noteServerVer((mainSnap.data() || {}).ver);
    const auditSnap = await _fsColl.doc('audit').get();
    if (mainSnap.exists) {
      // الصيغة الحية — مستند main واحد + audit منفصل
      const main = parseRaw(mainSnap.data(), {});
      _memDB = {
        doctors:  main.doctors  || [],
        branches: main.branches || [],
        leaves:   main.leaves   || [],
        settings: main.settings || {},
        _seq:     main._seq     || defSeq,
        audit:    parseRaw(auditSnap.exists ? auditSnap.data() : null, [])
      };
      _lastMain  = JSON.stringify(_mainObj(_memDB));
      _lastAudit = JSON.stringify(_memDB.audit);
      // النص الخام كما هو على الخادم — أساس المقارنة في القفل التفاؤلي
      _baseMain  = (mainSnap.data() || {}).data || null;
      _baseAudit = auditSnap.exists ? ((auditSnap.data() || {}).data || null) : null;
    } else {
      // أول تشغيل على الإطلاق — تهيئة من البذرة
      _memDB = JSON.parse(JSON.stringify({
        doctors:  SEED.doctors,
        branches: SEED.branches,
        leaves:   SEED.leaves   || [],
        audit:    [],
        settings: SEED.settings || {},
        _seq:     SEED._seq     || defSeq
      }));
      await _writeAllSections(_memDB);
    }

    _fsColl.onSnapshot(snap => {
      if (snap.metadata.hasPendingWrites) return;
      // ملاحظة: أُزيلت مهلة الـ3 ثوانٍ — كانت تُسقط تحديثات الأجهزة الأخرى فتُنتج بيانات قديمة.
      // مقارنة النص أدناه تكفي لتجاهل صدى كتابتنا نحن.
      if (!_memDB) return;
      let changed = false;
      snap.docChanges().forEach(ch => {
        if (ch.type === 'removed') return;
        const id = ch.doc.id;
        if (id !== 'main' && id !== 'audit') return; // يتجاهل أي مستندات مقسّمة قديمة
        const raw = ch.doc.data();
        if (!raw || typeof raw.data !== 'string') return;
        // كتابة من جهاز بنسخة أحدث ⇒ نعرف فوراً أننا قديمون
        if (id === 'main') _noteServerVer(raw.ver);
        if (id === 'main') {
          if (_lastMain === raw.data) return;
          try {
            const m = JSON.parse(raw.data);
            _memDB.doctors  = m.doctors  || [];
            _memDB.branches = m.branches || [];
            _memDB.leaves   = m.leaves   || [];
            _memDB.settings = m.settings || {};
            _memDB._seq     = m._seq     || _memDB._seq;
            _lastMain = raw.data; _baseMain = raw.data;   // أحدث نسخة معروفة على الخادم
            changed = true;
          } catch(e) {}
        } else { // audit
          if (_lastAudit === raw.data) return;
          try { _memDB.audit = JSON.parse(raw.data); _lastAudit = raw.data; _baseAudit = raw.data; } catch(e) {}
        }
      });
      if (changed) document.dispatchEvent(new CustomEvent('adelcare:sync'));
    });
    _maybeDailySnapshot();
  }

  function ensureInit() {
    // عند الفشل نُفرغ الوعد المخزَّن، وإلا بقيت التهيئة فاشلة للأبد
    // فلا تنجح القراءة حتى بعد تسجيل دخول صحيح.
    if (!_initPromise) _initPromise = _doInit().catch(e => { _initPromise = null; throw e; });
    return _initPromise;
  }

  // ── البيانات في Firestore — أول تشغيل يُهيئها من data.js ────────

  function initDB() { return _memDB; }

  function nextId(db, table) {
    const id = db._seq[table] || 1;
    db._seq[table] = id + 1;
    return id;
  }

  // ── توقيت الرياض ثابت UTC+3 بغض النظر عن جهاز المستخدم ────────────
  function _riyadhTS() {
    const d=new Date(Date.now()+3*3600000); // shift to UTC+3
    const p=x=>String(x).padStart(2,'0');
    return `${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
  }
  function _riyadhDate() { return _riyadhTS().slice(0,10); }
  // اليوم السابق لتاريخ "YYYY-MM-DD" — يُستخدم لحلّ سياق الوردية العابرة لمنتصف الليل
  function _prevDateStr(ds) {
    const p = String(ds||"").split("-").map(Number);
    if (p.length !== 3 || p.some(isNaN)) return ds;
    const d = new Date(Date.UTC(p[0], p[1]-1, p[2]));
    d.setUTCDate(d.getUTCDate() - 1);
    const z = x => String(x).padStart(2,'0');
    return `${d.getUTCFullYear()}-${z(d.getUTCMonth()+1)}-${z(d.getUTCDate())}`;
  }

  // ── تقليم سجل العمليات بالحجم الفعلي بالبايت ──────────────────────
  // حد Firestore للمستند 1,048,576 بايت. المقياس بايتات لا أحرف: النص
  // العربي ~1.34 بايت/حرف، فالعدّ بالأحرف يتجاوز الحد قبل أن يبلغه.
  // و`main` و`audit` يُكتبان في معاملة واحدة — فتضخّم السجل يوقف حفظ
  // البيانات كلها، لا السجل وحده. الميزانية 800KB (~76%) تترك هامشاً
  // لحقل `ver` وأعباء Firestore، وتستوعب ~1950 عملية بالمعدل الحالي.
  const AUDIT_MAX_BYTES = 800000;
  const AUDIT_MAX_ROWS  = 2500;     // حارس ثانٍ ضد الإدخالات الشاذة الصغر
  const _enc = (typeof TextEncoder !== "undefined") ? new TextEncoder() : null;
  const _bytes = (str) => _enc ? _enc.encode(str).length : str.length * 2;
  // مخبّأ حجم السجل — يُعاد حسابه تلقائياً متى استُبدل المصفوفة (تحميل من الخادم)
  let _auditRef = null, _auditBytes = 0;
  function _trimAudit(db) {
    const a = db.audit;
    if (!Array.isArray(a)) return;
    if (a !== _auditRef) {                      // مصفوفة جديدة ⇒ قياس كامل
      _auditRef = a; _auditBytes = _bytes(JSON.stringify(a));
    } else {
      _auditBytes += _bytes(JSON.stringify(a[0])) + 1;   // الإدخال الجديد + الفاصلة
    }
    while (a.length && (_auditBytes > AUDIT_MAX_BYTES || a.length > AUDIT_MAX_ROWS)) {
      _auditBytes -= _bytes(JSON.stringify(a[a.length - 1])) + 1;
      a.pop();                                  // الأقدم أولاً — الأحدث محفوظ دائماً
    }
    if (_auditBytes < 0) _auditBytes = 0;
  }

  let _lastAction = null; // آخر عملية مسجّلة — لتوثيق النسخة التشغيلية
  function log(db, action, entity, entity_id, detail, extra) {
    const s=getSession();
    const entry={
      id: nextId(db,'audit'),
      ts: _riyadhTS(),
      user: (s.name || "زائر"), userId: s.userId||null,
      action, entity, entity_id: entity_id||null, detail: detail||""
    };
    if(extra) Object.assign(entry,extra);
    db.audit.unshift(entry);
    _trimAudit(db);
    _lastAction = { action, user:(s.name||"زائر") };
  }

  // ══════════════════════════════════════════════════════════════════
  //  سجل تفصيلي — أدوات مقارنة الحقول (قبل ← بعد) بلغة مقروءة
  // ══════════════════════════════════════════════════════════════════
  const _DAY_AR=["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const _AUDIT_LABELS={ name:"الاسم", en_name:"الاسم بالإنجليزية", name_en:"الاسم بالإنجليزية",
    specialty:"التخصص", rank:"الدرجة", nationality:"الجنسية", gender:"الجنس", experience:"الخبرة",
    phone:"الهاتف", qualification:"المؤهل", cases:"الحالات المستقبلة", notes_coord:"ملاحظات التنسيق",
    languages:"اللغات", hours_raw:"نص الدوام" };
  function _fmtD(iso){ if(!iso) return "—"; const p=String(iso).split("-"); return p.length<3?String(iso):`${+p[2]}/${+p[1]}/${p[0]}`; }
  function _fmtDayShifts(arr){ return (arr&&arr.length)?arr.map(([s,e])=>fmtMin(s)+"–"+fmtMin(e)).join("، "):"—"; }
  function _auditVal(db,field,v){
    if(v===undefined||v===null||v==="") return "—";
    if(field==="branch_id"||field==="secondment_branch_id"){ const b=db.branches.find(x=>x.id==v); return b?b.name:("#"+v); }
    if(field==="home_visit") return v?"نعم":"لا";
    if(field==="status")     return v==="leave"?"إجازة":(v==="active"?"نشط":String(v));
    if(field==="dayoff"){ const a=Array.isArray(v)?v:[]; return a.length?a.slice().sort((x,y)=>x-y).map(i=>_DAY_AR[i]||i).join("، "):"—"; }
    return String(v);
  }
  // حقول إلزامية على بطاقة الممارس — كانت مكتوبة required في HTML فقط بلا
  // إنفاذ فعلي (زر الحفظ عادي لا submit، فلا يُفعِّل تحقق HTML5). النتيجة:
  // كان يمكن حفظ ممارس باسم فارغ يظهر ببطاقة شبه فارغة بلا أي تنبيه.
  const DOCTOR_REQUIRED_FIELDS = [
    ["name","الاسم"], ["rank","الرتبة / التخصص الدقيق"],
    ["nationality","الجنسية"], ["gender","الجنس"], ["experience","سنوات الخبرة"]
  ];
  function _validateDoctorFields(d){
    for(const [key,label] of DOCTOR_REQUIRED_FIELDS){
      if(!d[key] || !String(d[key]).trim()) throw new Error(`${label} مطلوب`);
    }
  }

  // يقارن ممارساً قبل/بعد ويُرجع قائمة تغييرات مقروءة
  function _diffDoctor(db,o,n){
    const ch=[];
    Object.keys(_AUDIT_LABELS).forEach(f=>{
      if(_AUDIT_LABELS[f] && (f in n) && String(o[f]??"")!==String(n[f]??""))
        ch.push(`${_AUDIT_LABELS[f]}: ${_auditVal(db,f,o[f])} ← ${_auditVal(db,f,n[f])}`);
    });
    if(("branch_id" in n) && String(o.branch_id)!==String(n.branch_id))
      ch.push(`الفرع: ${_auditVal(db,'branch_id',o.branch_id)} ← ${_auditVal(db,'branch_id',n.branch_id)}`);
    if(("home_visit" in n) && (o.home_visit?1:0)!==(n.home_visit?1:0))
      ch.push(`الزيارة المنزلية: ${o.home_visit?"نعم":"لا"} ← ${n.home_visit?"نعم":"لا"}`);
    if(("status" in n) && (o.status||"")!==(n.status||""))
      ch.push(`الحالة: ${_auditVal(db,'status',o.status)} ← ${_auditVal(db,'status',n.status)}`);
    if("dayoff" in n){ const a=(o.dayoff||[]).slice().sort().join(","), b=(n.dayoff||[]).slice().sort().join(",");
      if(a!==b) ch.push(`الإجازة الأسبوعية: ${_auditVal(db,'dayoff',o.dayoff)} ← ${_auditVal(db,'dayoff',n.dayoff)}`); }
    if("schedule" in n){ const os=o.schedule||{}, ns=n.schedule||{};
      for(let d=0;d<7;d++){ const oa=os[d]||os[String(d)]||[], na=ns[d]||ns[String(d)]||[];
        if(JSON.stringify(oa)!==JSON.stringify(na)){
          if(!oa.length)      ch.push(`أُضيف دوام ${_DAY_AR[d]}: ${_fmtDayShifts(na)}`);
          else if(!na.length) ch.push(`أُلغي دوام ${_DAY_AR[d]} (كان ${_fmtDayShifts(oa)})`);
          else                ch.push(`دوام ${_DAY_AR[d]}: ${_fmtDayShifts(oa)} ← ${_fmtDayShifts(na)}`);
        }
      }
    }
    return ch;
  }
  // يقارن فرعاً قبل/بعد
  const _BRANCH_LABELS={ name:"الاسم", grp:"المجموعة", info:"معلومات", hours:"ساعات العمل",
    phone:"الجوال", landline:"الهاتف الأرضي", bank_account:"الحساب البنكي", iban:"الآيبان", extra_info:"معلومات إضافية" };
  function _diffBranch(o,n){
    const ch=[];
    Object.keys(_BRANCH_LABELS).forEach(f=>{
      if((f in n) && String(o[f]??"")!==String(n[f]??""))
        ch.push(`${_BRANCH_LABELS[f]}: ${o[f]||"—"} ← ${n[f]||"—"}`);
    });
    return ch;
  }
  // يقارن سجل إجازة/ندب قبل/بعد
  function _diffLeave(db,o,n){
    const ch=[];
    if((o.type||"")!==(n.type||"")) ch.push(`النوع: ${o.type||"—"} ← ${n.type||"—"}`);
    if((o.start_date||"")!==(n.start_date||"")) ch.push(`من تاريخ: ${_fmtD(o.start_date)} ← ${_fmtD(n.start_date)}`);
    if((o.end_date||"")!==(n.end_date||"")) ch.push(`إلى تاريخ: ${_fmtD(o.end_date)} ← ${_fmtD(n.end_date)}`);
    if(String(o.shift||"")!==String(n.shift||"")){
      const _dOf=db.doctors.find(x=>x.id==(n.doctor_id||o.doctor_id));
      ch.push(`نوع الندب: ${o.shift?("شفت "+_shiftLabelByKey(_dOf,o.shift)):"ندب كامل"} ← ${n.shift?("شفت "+_shiftLabelByKey(_dOf,n.shift)):"ندب كامل"}`);
    }
    if(String(o.secondment_branch_id||"")!==String(n.secondment_branch_id||""))
      ch.push(`فرع الندب: ${_auditVal(db,'secondment_branch_id',o.secondment_branch_id)} ← ${_auditVal(db,'secondment_branch_id',n.secondment_branch_id)}`);
    if((o.reason||"")!==(n.reason||"")) ch.push(`الملاحظات: ${o.reason||"—"} ← ${n.reason||"—"}`);
    return ch;
  }

  // ── Helpers ──────────────────────────────────────────────────
  function fmtMin(m) {
    m = ((m % 1440) + 1440) % 1440;
    const h = Math.floor(m/60), mm = m%60;
    const suf = h < 12 ? "ص" : "م";
    return `${h%12||12}:${String(mm).padStart(2,"0")}${suf}`;
  }

  function normalizeAr(s) {
    return (s||"").trim()
      .replace(/[\u064B-\u065F\u0670\u0640]/g,"")
      .replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه");
  }


  function activeLeaveFn(leaves, doctorId, dateStr) {
    return leaves.find(l =>
      l.doctor_id == doctorId && l.start_date <= dateStr && l.end_date >= dateStr
    );
  }

  // ── ندب الشفت ──────────────────────────────────────────────────────
  // حقل اختياري واحد على سجل الندب: shift = "morning" | "evening".
  // غيابه = ندب كامل (السلوك القديم حرفياً) ⇒ توافق رجعي تام مع كل السجلات الحالية.
  // ندب الشفت مربوط بوردية فعلية من جدول الممارس — لا بتصنيف عام.
  // المفتاح "بداية-نهاية" بالدقائق (مثل "480-720") مشتق من نفس بيانات الجدول
  // المخزَّنة: schedule[يوم] = [[بداية, نهاية], ...]
  const _isSecRec = (l) => !!(l && l.type === "ندب" && l.secondment_branch_id);
  const _shiftKeyOf = (st, en) => `${st}-${en}`;
  // تسميات قديمة (morning/evening) — لأي سجل أُنشئ قبل هذا التعديل
  const SHIFT_LABEL = { morning:"صباحي", evening:"مسائي" };

  // كل ورديات الممارس المسجّلة خلال الأسبوع، بلا تكرار، مرتّبة بوقت البداية
  function _doctorShifts(doc) {
    const sc = (doc && doc.schedule) || {};
    const seen = new Map();
    for (let d = 0; d < 7; d++) {
      const arr = sc[d] || sc[String(d)] || [];
      for (const [st, en] of arr) {
        const key = _shiftKeyOf(st, en);
        if (!seen.has(key)) seen.set(key, { key, start:st, end:en, days:[] });
        seen.get(key).days.push(d);
      }
    }
    return [...seen.values()].sort((a,b) => a.start - b.start);
  }

  // نص الوردية كما يراه المستخدم — بنفس تنسيق الأوقات في كل النظام
  const _shiftLabelOf = (st, en) => `${fmtMin(st)} - ${fmtMin(en)}`;
  function _shiftLabelByKey(doc, key) {
    if (!key) return "";
    if (SHIFT_LABEL[key]) return SHIFT_LABEL[key];         // سجل قديم
    const parts = String(key).split("-");
    const st = +parts[0], en = +parts[1];
    if (isNaN(st) || isNaN(en)) return String(key);
    return _shiftLabelOf(st, en);
  }

  // مفتاح الوردية التي يعمل بها الممارس الآن — أو null إن لم يكن داخل وردية.
  // يشمل امتداد وردية الأمس بعد منتصف الليل (ليتطابق مع منطق الحالة).
  function _currentShiftKey(doc, nowMin, day) {
    const sc = (doc && doc.schedule) || {};
    const todays = (sc[day] || sc[String(day)] || []);
    for (const [st, en] of todays) {
      const e = en < st ? en + 1440 : en;
      if (st <= nowMin && nowMin < Math.min(e, 1440)) return _shiftKeyOf(st, en);
    }
    const yest = (sc[(day+6)%7] || sc[String((day+6)%7)] || []);
    for (const [st, en] of yest) {
      const e = en < st ? en + 1440 : en;
      if (e > 1440 && nowMin < e - 1440) return _shiftKeyOf(st, en);
    }
    return null;
  }

  // يفصل سجلات اليوم: إجازة حقيقية / ندب الشفت المطابق / ندب كامل.
  // الأولوية: إجازة حقيقية ← ندب شفت مطابق ← ندب كامل ← الفرع الأساسي.
  function _resolveDayRecords(leaves, doctorId, dateStr, shiftKind) {
    const all = (leaves || []).filter(l =>
      l.doctor_id == doctorId && l.start_date <= dateStr && l.end_date >= dateStr);
    const realLeave = all.find(l => !_isSecRec(l));
    const shiftSecs = all.filter(l => _isSecRec(l) && l.shift);
    const fullSec   = all.find(l => _isSecRec(l) && !l.shift);
    const matchedSec = (shiftKind ? shiftSecs.find(l => l.shift === shiftKind) : null) || fullSec || null;
    return { realLeave: realLeave || null, sec: matchedSec, shiftSecs, fullSec: fullSec || null };
  }

  // يبحث عن سجل إجازة/ندب متداخل مع الفترة [start,end] لنفس الممارس (عدا السجل المستثنى).
  // isSec/shift يصفان السجل الجديد. القاعدة:
  //   • شفتان مختلفان (صباحي/مسائي)         ← لا تعارض (جوهر الميزة)
  //   • نفس الشفت في تواريخ متداخلة          ← تعارض
  //   • ندب شفت مع ندب كامل                  ← لا تعارض (الشفت يغلب في فترته)
  //   • أي إجازة حقيقية مع أي ندب أو إجازة   ← تعارض (السلوك القديم)
  function overlapLeaveFn(leaves, doctorId, start, end, excludeId, isSec, shift) {
    return leaves.find(l => {
      if (l.doctor_id != doctorId || l.id === excludeId || l.synthetic) return false;
      if (!(start <= l.end_date && l.start_date <= end)) return false;
      const oldSec = _isSecRec(l);
      // أحد الطرفين إجازة حقيقية ⇒ تعارض دائماً
      if (!isSec || !oldSec) return true;
      // الطرفان ندب:
      if (shift && l.shift) return l.shift === shift;   // شفتان: تعارض فقط إن تطابقا
      if (!shift && !l.shift) return true;               // ندبان كاملان ⇒ تعارض (كالسابق)
      return false;                                      // كامل مع شفت، أو العكس ⇒ يتعايشان
    });
  }

  // تفعيل إنهاء العقد المجدول تلقائياً عند وصول تاريخه — يحوّله إلى حالة دائمة
  function applyDueTerminations(db) {
    if (!db || !db.doctors) return false;
    const today = _riyadhDate();
    let changed = false;
    db.doctors.forEach(d => {
      if (d.termination_scheduled && !d.terminated && d.termination_scheduled <= today) {
        d.terminated = 1;
        d.terminated_date = d.termination_scheduled;
        delete d.termination_scheduled;
        changed = true;
      }
    });
    return changed;
  }

  // ══════════════════════════════════════════════════════════════════
  //  الأرشفة التلقائية بعد انتهاء العقد
  // ══════════════════════════════════════════════════════════════════
  //  بعد مرور ARCHIVE_AFTER_DAYS يوماً كاملة من تاريخ انتهاء العقد يُخفى
  //  الممارس من كل القوائم. إخفاء لا حذف: البيانات تبقى كما هي، والاسترجاع
  //  بزر واحد. لذلك لا تلزم نسخة احتياطية مسبقة ولا بيئة تنفيذ خاصة.
  //
  //  يُوسم بـ auto_archived لتمييزه عن أرشفة أجراها موظف بيده — التمديد
  //  يلغي أرشفتنا وحدها، وقرار الموظف يبقى قراره.
  const ARCHIVE_AFTER_DAYS = 30;

  //  يقبل "YYYY-MM-DD" وحدها ويرفض ما عداها: فارغ، نص حر، أو يوم لا وجود له
  //  (2026-02-31). الرفض يعني «لا تؤرشف» لا «أرشِف الآن».
  function _parseISODate(s) {
    if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
    return dt;
  }
  //  فرق الأيام بين تاريخين — يُحسب على UTC فلا يتأثر بمنطقة جهاز المستخدم
  function _daysSince(fromISO, toISO) {
    const a = _parseISODate(fromISO), b = _parseISODate(toISO);
    if (!a || !b) return null;
    return Math.floor((b - a) / 86400000);
  }

  function autoArchiveExpired(db) {
    if (!db || !Array.isArray(db.doctors)) return false;
    const today = _riyadhDate();
    let changed = false;
    db.doctors.forEach(d => {
      if (!d.terminated || d.archived) return;          // غير منتهٍ، أو مخفي أصلاً
      if (d.auto_archive_optout) return;                // استرجعه موظف بيده ⇒ قراره يُحترم
      const days = _daysSince(d.terminated_date, today);
      if (days === null) return;                        // تاريخ مفقود أو تالف ⇒ لا شيء
      if (days < ARCHIVE_AFTER_DAYS) return;            // لم تمض المدة بعد
      d.archived = 1;
      d.auto_archived = 1;
      d.auto_archived_at = today;
      const bn = ((db.branches || []).find(b => b.id === d.branch_id) || {}).name || "";
      log(db, "أرشفة تلقائية", "doctor", d.id,
        `أُخفي "${d.name}" تلقائياً بعد ${days} يوماً من انتهاء عقده (${_fmtD(d.terminated_date)}) — البيانات محفوظة ويمكن استرجاعه`,
        { user: "النظام", userId: null, auto: 1, branch: bn, branch_id: d.branch_id });
      changed = true;
    });
    return changed;
  }

  //  يلغي الأرشفة التلقائية وحدها. تُستدعى عند تمديد العقد أو إلغاء إنهائه
  //  أو تغيير تاريخه، فيُعاد الاحتساب من التاريخ الجديد.
  function clearAutoArchive(d) {
    if (!d || !d.auto_archived) return false;
    d.archived = 0;
    delete d.auto_archived;
    delete d.auto_archived_at;
    delete d.auto_archive_optout;   // دورة عقد جديدة ⇒ احتساب جديد
    return true;
  }

  function computeStatus(doc, nowMin, day, dateStr, leaves) {
    if (doc.terminated) return {state:"terminated",label:"منتهي العقد",color:"terminated"};
    if (doc.archived) return {state:"archived",label:"مؤرشف",color:"gray"};

    const sc = doc.schedule || {};
    // normalise shift: if end < start treat as overnight (end += 1440)
    const norm = ([s,e]) => e < s ? [s, e+1440] : [s, e];
    const todays = (sc[day] || sc[String(day)] || []).map(norm);
    const yest   = (sc[(day+6)%7] || sc[String((day+6)%7)] || []).map(norm);

    // ما بعد منتصف الليل جزء من دوام أمس لا من اليوم الجديد.
    // نحتفظ بـ s,e الخام (بلا %1440) لعرض المدى الكامل "6:00م–1:00ص".
    const tail = (() => {
      for (const [s,e] of yest) if (e > 1440 && nowMin < e - 1440) return [s,e];
      return null;
    })();
    const tailEnd = tail ? tail[1]-1440 : null;

    // ── السياق الزمني الحاكم ──────────────────────────────────────────
    // الوردية العابرة لمنتصف الليل فترة واحدة متصلة تخصّ *يوم بدايتها*.
    // لذا حين نكون داخل امتدادها، تُحلّ الإجازة والندب بتاريخ الأمس لا اليوم:
    // تغيّر التاريخ عند 12:00ص وحده لا يُسقط أي حالة قبل انتهاء الوردية فعلياً.
    const _inTodayShift = todays.some(([s,e]) => s <= nowMin && nowMin < Math.min(e,1440));
    const _inTail = !_inTodayShift && tail !== null;
    const _ctxDate = _inTail ? _prevDateStr(dateStr) : dateStr;
    const _ctxShift = _inTail ? _shiftKeyOf(tail[0], tail[1]) : _currentShiftKey(doc, nowMin, day);
    const _rec = _resolveDayRecords(leaves, doc.id, _ctxDate, _ctxShift);

    // بلا رجوع إلى activeLeaveFn: كان يلتقط ندب شفت غير مطابق للفترة الحالية
    // فيُحوّل الممارس إلى "إجازة" في فترة هو فيها بفرعه الأساسي فعلاً.
    const lv = _rec.realLeave || _rec.sec;
    const isSecondment = !_rec.realLeave && !!_rec.sec;
    const sec = isSecondment ? {
      isSecondment:true, secondmentBranchId:_rec.sec.secondment_branch_id, leave:_rec.sec,
      ...(_rec.sec.shift ? {secondmentShift:_rec.sec.shift, secondmentShiftLabel:_shiftLabelByKey(doc,_rec.sec.shift)} : {})
    } : {};
    // كل ندبات الشفت لهذا السياق — لعرضها مجتمعة في البطاقة
    const _shiftSecList = _rec.shiftSecs.length ? {shiftSecondments:_rec.shiftSecs} : {};

    // الإجازة (غير الندب) تُلغي التواجد — ولا تتأثر بالزيارة.
    // تُقاس على السياق أعلاه: إجازة تغطي يوم بداية الوردية تستمر حتى نهايتها
    // الفعلية، وإجازة تبدأ اليوم التالي لا تقطع وردية بدأت أمس.
    if (!isSecondment && (lv || doc.status === "leave")) {
      const leaveType = lv ? (lv.type||"إجازة") : "إجازة";
      const detail = lv ? `${leaveType} · حتى ${lv.end_date}` : "";
      return {state:"leave", label:"إجازة", color:"leave", leaveType, detail, leave: lv||null};
    }

    // الزيارة = علامة فوق حالة الدوام الفعلية (لا تُلغي التواجد ولا تغيّر الحالة)
    const vis = base => ({ ..._shiftSecList, ...(doc.in_visit ? {...base, in_visit:true} : base) });

    // still inside a shift that started today (before midnight portion)
    for (const [s,e] of todays) {
      if (s <= nowMin && nowMin < Math.min(e, 1440))
        return vis({state:"present",label:"موجود الآن",color:"green",detail:`حتى ${fmtMin(e%1440)}`,
                    shift_end:e, disp_start:s, disp_end:e, ...sec});
    }
    // inside overnight tail from yesterday's shift
    if (tail !== null)
      return vis({state:"present",label:"موجود الآن",color:"green",detail:`حتى ${fmtMin(tailEnd)}`,
                  shift_end:tailEnd, disp_start:tail[0], disp_end:tail[1], ...sec});
    // upcoming shift today
    const starts = todays.filter(([s])=>s>nowMin).map(([s])=>s);
    if (starts.length) {
      const nx = Math.min(...starts);
      return vis({state:"upcoming",label:"يبدأ لاحقاً",color:"amber",detail:`يبدأ ${fmtMin(nx)}`,next_start:nx,...sec});
    }
    // had a shift today but it's done
    if (todays.length) {
      return vis({state:"finished",label:"انتهى دوامه",color:"red",detail:"انتهى اليوم",...sec});
    }
    return vis({state:"off",label:"إجازة أسبوعية",color:"black",detail:"يوم إجازة",...sec});
  }

  function nowInfo() {
    const d=new Date(Date.now()+3*3600000); // UTC+3 الرياض
    const day=d.getUTCDay();
    const nowMin=d.getUTCHours()*60+d.getUTCMinutes();
    const p=x=>String(x).padStart(2,'0');
    const dateStr=`${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())}`;
    return {day,nowMin,dateStr};
  }

  // حالة الممارس مُثراة بمعلومات الندب (اسم الفرع المنتدب إليه) — مصدر موحّد لكل المسارات
  function _liveOf(doc, db, nowMin, day, dateStr) {
    const live = computeStatus(doc, nowMin, day, dateStr, db.leaves);
    if (live.isSecondment && live.secondmentBranchId) {
      const sb = db.branches.find(b=>b.id==live.secondmentBranchId);
      if (sb) {
        live.secondmentBranchName = sb.name;
        // نسخة من سجل الندب مع اسم الفرع (بدون تعديل السجل الأصلي في القاعدة)
        if (live.leave) live.leave = { ...live.leave, secondment_branch_name: sb.name };
      }
    }
    // إثراء ندبات الشفت بأسماء الفروع — لتُعرض جاهزة في البطاقة والبحث
    if (Array.isArray(live.shiftSecondments) && live.shiftSecondments.length) {
      // حالة كل ندب شفت زمنياً: سارٍ الآن / انتهى وقته اليوم / يبدأ لاحقاً /
      // لا وردية له اليوم. السجل يبقى كما هو — التمييز عرضي فقط.
      const _todayShiftKeys = new Set(((doc.schedule||{})[day] || (doc.schedule||{})[String(day)] || [])
        .map(([st,en]) => _shiftKeyOf(st,en)));
      live.shiftSecondments = live.shiftSecondments.map(l => {
        const parts = String(l.shift||"").split("-");
        const st = +parts[0], en = +parts[1];
        let shift_state = "later";
        if (!_todayShiftKeys.has(String(l.shift))) shift_state = "noshift";
        else if (!isNaN(st) && !isNaN(en)) {
          const e = en < st ? en + 1440 : en;
          if (nowMin >= Math.min(e, 1440)) shift_state = "ended";
          else if (nowMin >= st)           shift_state = "now";
        }
        return {
          ...l,
          secondment_branch_name: (db.branches.find(b=>b.id==l.secondment_branch_id)||{}).name || "",
          shift_label: _shiftLabelByKey(doc, l.shift),
          shift_state
        };
      });
    }
    if (doc.termination_scheduled) live.termSched = doc.termination_scheduled;
    return live;
  }
  function withStatus(doc, db) {
    const {day,nowMin,dateStr} = nowInfo();
    return { ...doc, live: _liveOf(doc, db, nowMin, day, dateStr) };
  }

  function getExtra(db) {
    try { return Array.isArray(db.settings.extra_specialties) ? db.settings.extra_specialties : JSON.parse(db.settings.extra_specialties||"[]"); }
    catch(e) { return []; }
  }
  function setExtra(db, arr) {
    db.settings.extra_specialties = arr;
  }
  function allSpecialties(db) {
    const s = new Set(db.doctors.filter(d=>!d.archived&&d.specialty).map(d=>d.specialty));
    getExtra(db).forEach(x=>s.add(x));
    return [...s].sort();
  }

  // ── Routing ──────────────────────────────────────────────────
  function route(method, path, body) {
    const db = initDB();
    const sess = getSession();

    const needAuth = () => { if (!sess.auth) throw Object.assign(new Error("auth"),{status:401}); };
    const _hasPerm = (s, perm) => { if(!s.auth) return false; const p=s.permissions||[]; return p.includes("*")||p.includes(perm); };
    const needPerm = (perm) => { needAuth(); if(!_hasPerm(sess,perm)) throw Object.assign(new Error("لا تملك صلاحية لهذا الإجراء"),{status:403}); };
    const needAnyPerm = (...perms) => { needAuth(); if(!perms.some(p=>_hasPerm(sess,p))) throw Object.assign(new Error("لا تملك صلاحية لهذا الإجراء"),{status:403}); };
    const _hasBranch = (s, bid) => { const b=s.branches||[]; return b.includes("*")||b.includes(bid)||b.includes(String(bid)); };
    const needBranch = (bid) => { if(!_hasBranch(sess,bid)) throw Object.assign(new Error("لا تملك صلاحية للتعديل على هذا الفرع"),{status:403}); };
    const _hasSpecialty = (s, spec) => { if(!spec) return true; const sp=s.specialties||[]; return sp.includes("*")||sp.includes(spec); };
    const needSpecialty = (spec) => { if(!_hasSpecialty(sess,spec)) throw Object.assign(new Error("لا تملك صلاحية للتعديل على هذا القسم"),{status:403}); };

    // ── الترحيل والصيانة التلقائية ──────────────────────────────────────
    // مهم: تُطبَّق في الذاكرة دائماً (ليصحّ العرض)، لكن لا تُحفظ إلا مع عملية
    // تعديل حقيقية. الحفظ عند مجرد القراءة كان يجعل أي جهاز — بمجرد فتحه —
    // يكتب حالته القديمة فوق بيانات الجميع (السبب الرئيسي لفقدان البيانات).
    const _isWrite = method !== "GET";
    let _needSave = false;

    if (!db.settings.users || !db.settings.users.length) {
      db.settings.users = [{
        id:"super", name:"المدير الرئيسي",
        role:"super_admin", active:true,
        permissions:["*"], branches:["*"], specialties:["*"],
        created: new Date().toISOString()
      }];
      _needSave = true;
    }
    // patch users missing branches/specialties field
    (db.settings.users||[]).forEach(u=>{if(!u.branches){u.branches=["*"];_needSave=true;}if(!u.specialties){u.specialties=["*"];_needSave=true;}});
    // تفعيل أي إنهاء عقد مجدول حان تاريخه (حالة دائمة)
    if(applyDueTerminations(db)) _needSave = true;
    // إخفاء من مضى على انتهاء عقده 30 يوماً — مراجعة تلقائية لا تنتظر فتح بطاقته
    if(autoArchiveExpired(db)) _needSave = true;
    // يُحفظ فقط ضمن طلب تعديل — لا كتابة إطلاقاً عند القراءة
    if(_needSave && _isWrite) save(db);

    // AUTH — الدخول صار عبر Firebase Authentication (LocalDB.signIn).
    // أُزيل مسار /login القديم: كان يقبل رمزاً مشتركاً ورموز PIN مخزَّنة
    // نصّاً مكشوفاً داخل قاعدة بيانات يقرأها الجميع.
    if (method==="POST" && path==="/login") {
      throw Object.assign(new Error("طريقة الدخول تغيّرت — حدّث الصفحة"),{status:410});
    }
    if (method==="POST" && path==="/logout") { setSession({auth:false,edit:false,userId:null,name:null,permissions:[],branches:[],specialties:[]}); return {ok:true}; }
    if (method==="GET"  && path==="/me") {
      if (sess.auth && (!sess.permissions || !sess.branches || !sess.specialties)) {
        setSession({auth:false,edit:false,userId:null,name:null,permissions:[],branches:[],specialties:[]});
        return {user:null};
      }
      return {user: sess.auth ? sess : null};
    }

    // USERS MANAGEMENT
    if (method==="GET" && path==="/users") {
      needPerm("users_manage");
      return {users:(db.settings.users||[]).map(u=>({...u}))};
    }
    if (method==="POST" && path==="/users") {
      needPerm("users_manage");
      const name=(body.name||"").trim(); if(!name) throw new Error("اسم المستخدم مطلوب");
      const email=(body.email||"").trim().toLowerCase();
      if(!email) throw new Error("البريد المرتبط بحساب Firebase مطلوب");
      if((db.settings.users||[]).some(u=>(u.email||"").toLowerCase()===email)) throw new Error("هذا البريد مرتبط بمستخدم آخر");
      const id="u"+Date.now();
      const u={id,name,email,role:"user",active:true,permissions:body.permissions||[],branches:body.branches||["*"],specialties:body.specialties||["*"],created:new Date().toISOString()};
      db.settings.users.push(u);
      log(db,"إضافة مستخدم","user",id,`إضافة مستخدم "${name}" (${(u.permissions||[]).length} صلاحية)`); save(db);
      return {id};
    }
    const usrM=path.match(/^\/users\/([^/]+)$/);
    if(usrM){
      const uid=usrM[1];
      if(method==="PUT"){
        needPerm("users_manage");
        const u=(db.settings.users||[]).find(x=>x.id===uid); if(!u) throw Object.assign(new Error("not found"),{status:404});
        if(u.role==="super_admin"&&sess.userId!==u.id) throw new Error("لا يمكن تعديل المدير الرئيسي");
        const _uBefore={name:u.name,active:u.active,permissions:(u.permissions||[]).slice(),branches:(u.branches||[]).slice(),specialties:(u.specialties||[]).slice()};
        if(body.name) u.name=body.name.trim();
        if(body.email!==undefined){
          const em=(body.email||"").trim().toLowerCase();
          if(em&&(db.settings.users||[]).some(x=>x.id!==uid&&(x.email||"").toLowerCase()===em))
            throw new Error("هذا البريد مرتبط بمستخدم آخر");
          if(em) u.email=em; else delete u.email;
        }
        if(body.permissions!==undefined&&u.role!=="super_admin"){
          // Prevent privilege escalation: only super_admin can grant wildcard permissions
          u.permissions=_hasPerm(sess,"*")?body.permissions:body.permissions.filter(p=>p!=="*");
        }
        if(body.branches!==undefined&&u.role!=="super_admin") u.branches=body.branches;
        if(body.specialties!==undefined&&u.role!=="super_admin") u.specialties=body.specialties;
        if(body.active!==undefined&&u.role!=="super_admin") u.active=!!body.active;
        if(sess.userId===uid) setSession({...sess,name:u.name,permissions:u.permissions,branches:u.branches||["*"],specialties:u.specialties||["*"]});
        const uch=[];
        if(_uBefore.name!==u.name) uch.push(`الاسم: ${_uBefore.name} ← ${u.name}`);
        if(_uBefore.active!==u.active) uch.push(`الحالة: ${_uBefore.active?"نشط":"متوقف"} ← ${u.active?"نشط":"متوقف"}`);
        const _pb=_uBefore.permissions.join(","), _pa=(u.permissions||[]).join(",");
        if(_pb!==_pa) uch.push(`الصلاحيات: ${_uBefore.permissions.length} ← ${(u.permissions||[]).length} صلاحية`);
        if(_uBefore.branches.join(",")!==(u.branches||[]).join(",")) uch.push(`صلاحية الفروع محدّثة`);
        if(_uBefore.specialties.join(",")!==(u.specialties||[]).join(",")) uch.push(`صلاحية الأقسام محدّثة`);
        const uDetail=uch.length?`تعديل مستخدم "${u.name}":\n• ${uch.join("\n• ")}`:`فتح مستخدم "${u.name}" دون تغيير`;
        log(db,"تعديل مستخدم","user",uid,uDetail); save(db);
        return {ok:true};
      }
      if(method==="DELETE"){
        needPerm("users_manage");
        const u=(db.settings.users||[]).find(x=>x.id===uid); if(!u) throw Object.assign(new Error("not found"),{status:404});
        if(u.role==="super_admin") throw new Error("لا يمكن حذف المدير الرئيسي");
        db.settings.users=db.settings.users.filter(x=>x.id!==uid);
        log(db,"حذف مستخدم","user",uid,`حذف المستخدم "${u.name}"`); save(db);
        return {ok:true};
      }
    }

    // SETTINGS
    if (method==="GET" && path==="/settings") {
      needPerm("settings_access");
      const _su=(db.settings.users||[]).find(u=>u.role==="super_admin");
      return {last_backup_download:db.settings.last_backup_download||null,
        last_auto_export:db.settings.last_auto_export||null,
        auto_export_enabled:db.settings.auto_export_enabled!==false,
        auto_export_days:db.settings.auto_export_days||7,
        // هل المستخدم الحالي هو المدير الرئيسي؟ (لإظهار خيار تغيير رمزه فقط له)
        is_master: !!(_su && sess.userId===_su.id)};
    }
    if (method==="PUT" && path==="/settings") {
      needPerm("settings_access");
      // تحديثات خفيفة لا تُسجَّل في سجل العمليات (طوابع/إعدادات النسخ)
      let touched=false;
      if(body.last_backup_download){ db.settings.last_backup_download=body.last_backup_download; touched=true; }
      if(body.last_auto_export){ db.settings.last_auto_export=body.last_auto_export; touched=true; }
      if(typeof body.auto_export_enabled==="boolean"){ db.settings.auto_export_enabled=body.auto_export_enabled; touched=true; }
      if(body.auto_export_days){ const n=+body.auto_export_days; if(n>=1&&n<=90){ db.settings.auto_export_days=n; touched=true; } }
      if(touched){ save(db); return {ok:true}; }
      log(db,"تغيير إعدادات","settings");
      save(db); return {ok:true};
    }

    // SPECIALTIES
    if (method==="GET" && path==="/specialties") {
      needAuth();
      return {specialties:allSpecialties(db), extra:getExtra(db)};
    }
    if (method==="POST" && path==="/specialties") {
      needPerm("specialty_manage");
      const name=(body.name||"").trim(); if(!name) throw new Error("اسم القسم مطلوب");
      const ex=getExtra(db); if(!ex.includes(name)){ ex.push(name); setExtra(db,ex); }
      log(db,"إضافة قسم","specialty",null,name); save(db);
      return {ok:true,specialties:allSpecialties(db),extra:getExtra(db)};
    }
    if (method==="DELETE" && path==="/specialties") {
      needPerm("specialty_manage");
      const name=(body.name||"").trim();
      const ex=getExtra(db).filter(x=>x!==name); setExtra(db,ex);
      log(db,"حذف قسم","specialty",null,name); save(db);
      return {ok:true,specialties:allSpecialties(db),extra:getExtra(db)};
    }
    if (method==="PUT" && path==="/specialties") {
      needPerm("specialty_manage");
      const o=(body.old||"").trim(), n=(body.new||"").trim();
      const ex=getExtra(db).map(x=>x===o?n:x); setExtra(db,ex);
      db.doctors.forEach(d=>{ if(d.specialty===o) d.specialty=n; });
      log(db,"تعديل قسم","specialty",null,`${o} → ${n}`); save(db);
      return {ok:true,specialties:allSpecialties(db),extra:getExtra(db)};
    }

    // BRANCHES
    if (method==="GET" && path==="/branches") {
      needAuth();
      const {day,nowMin,dateStr}=nowInfo();
      // الفرع الفعلي الآن = فرع الندب السارية فترته (شفت أو كامل)، وإلا الفرع الأساسي.
      // يُشتق من _liveOf فيراعي ندب الشفت تلقائياً بدل إخراج الممارس طوال اليوم.
      const _effBranchNow=(d)=>{ const st=_liveOf(d,db,nowMin,day,dateStr);
        return (st.isSecondment&&st.secondmentBranchId)?st.secondmentBranchId:d.branch_id; };
      return {branches: db.branches.map(b=>{
        const baseDocs=db.doctors.filter(d=>!d.archived&&!d.terminated&&_effBranchNow(d)==b.id&&d.branch_id==b.id);
        const seconded=db.doctors.filter(d=>!d.archived&&!d.terminated&&d.branch_id!=b.id&&_effBranchNow(d)==b.id);
        const docs=[...baseDocs,...seconded];
        const present=docs.filter(d=>{ const st=_liveOf(d,db,nowMin,day,dateStr); return st.state==="present"; }).length;
        const secCnt=seconded.length;
        return {...b,doctor_count:docs.length,seconded_count:secCnt,present,specialties:[...new Set(docs.map(d=>d.specialty))].sort()};
      })};
    }
    const brM = path.match(/^\/branches\/(\d+)$/);
    if (brM) {
      const bid=+brM[1];
      if (method==="GET") {
        needAuth();
        const b=db.branches.find(x=>x.id===bid); if(!b) throw Object.assign(new Error("not found"),{status:404});
        const {dateStr:dStr}=nowInfo();
        const {day:_bd,nowMin:_bn}=nowInfo();
        const _effB=(d)=>{ const st=_liveOf(d,db,_bn,_bd,dStr);
          return (st.isSecondment&&st.secondmentBranchId)?st.secondmentBranchId:d.branch_id; };
        const baseDocs=db.doctors.filter(d=>!d.archived&&!d.terminated&&d.branch_id===bid&&_effB(d)==bid);
        const seconded=db.doctors.filter(d=>!d.archived&&!d.terminated&&d.branch_id!==bid&&_effB(d)==bid);
        const allDocs=[...baseDocs,...seconded].sort((a,b2)=>a.name.localeCompare(b2.name));
        return {branch:b,doctors:allDocs.map(d=>({...withStatus(d,db),branch_name:(db.branches.find(x=>x.id===d.branch_id)||{}).name||""})),specialties:[...new Set(allDocs.map(d=>d.specialty))].sort()};
      }
      if (method==="PUT") {
        needPerm("branch_manage");
        const b=db.branches.find(x=>x.id===bid); if(!b) throw Object.assign(new Error("not found"),{status:404});
        const _bBefore={...b};
        ["name","grp","info","hours","phone","landline","bank_account","iban","extra_info","details"].forEach(k=>{ if(k in body) b[k]=body[k]; });
        const bchanges=_diffBranch(_bBefore,b);
        const bDetail=bchanges.length?`تعديل فرع "${b.name}":\n• ${bchanges.join("\n• ")}`:`فتح فرع "${b.name}" دون تغيير`;
        log(db,"تعديل فرع","branch",bid,bDetail); save(db); return {ok:true};
      }
      if (method==="DELETE") {
        needPerm("branch_manage");
        const _bDel=db.branches.find(x=>x.id===bid);
        const n=db.doctors.filter(d=>d.branch_id===bid&&!d.archived).length;
        if(n) throw new Error(`لا يمكن حذف فرع يضم ${n} طبيب`);
        db.branches=db.branches.filter(x=>x.id!==bid);
        log(db,"حذف فرع","branch",bid,_bDel?`حذف فرع "${_bDel.name}"`:"حذف فرع"); save(db); return {ok:true};
      }
    }
    if (method==="POST" && path==="/branches") {
      needPerm("branch_manage");
      const id=nextId(db,"branches");
      const b={id,name:body.name||"",grp:body.grp||"",info:body.info||"",hours:body.hours||"",phone:body.phone||"",landline:body.landline||"",bank_account:body.bank_account||"",iban:body.iban||"",extra_info:body.extra_info||""};
      db.branches.push(b); log(db,"إضافة فرع","branch",id,`إضافة فرع جديد "${b.name}"`); save(db); return {id};
    }

    // DOCTORS
    if (method==="GET" && (path==="/doctors" || path.startsWith("/doctors?"))) {
      needAuth();
      const incArch=path.includes("archived=1");
      const incTerm=path.includes("terminated=1");
      let docs=db.doctors.filter(d=>(incArch||!d.archived)&&(incTerm||!d.terminated)).sort((a,b)=>a.name.localeCompare(b.name));
      return {doctors:docs.map(d=>withStatus(d,db))};
    }
    const docM = path.match(/^\/doctors\/(\d+)(\/archive|\/terminate)?$/);
    if (docM) {
      const did=+docM[1];
      if (method==="GET") {
        needAuth();
        const d=db.doctors.find(x=>x.id===did); if(!d) throw Object.assign(new Error("not found"),{status:404});
        const b=db.branches.find(x=>x.id===d.branch_id);
        const _bmap={}; db.branches.forEach(x=>_bmap[x.id]=x.name);
        const doc={...withStatus(d,db), branch_name:b?b.name:"",
          // إثراء السجلات باسم الفرع المنتدب إليه — ليظهر الندب موحّداً في كل الواجهات
          leaves:db.leaves.filter(l=>+l.doctor_id===did).sort((a,b)=>a.start_date.localeCompare(b.start_date))
            .map(l=>({...l, secondment_branch_name:l.secondment_branch_id?(_bmap[l.secondment_branch_id]||""):""}))};
        return {doctor:doc};
      }
      if (method==="PUT" && !docM[2]) {
        // تغيير الحالة فقط (إلغاء إجازة يدوية): يُتيحه مديرو الحالة أيضاً — ويحفظ باقي الحقول
        const _bk=Object.keys(body||{});
        const _statusOnly=_bk.length===1 && _bk[0]==="status";
        if(_statusOnly) needAnyPerm("doctor_edit","schedule_edit","leave_manage","status_manage");
        else needAnyPerm("doctor_edit","schedule_edit"); // تعديل البطاقة بالكامل
        const idx=db.doctors.findIndex(x=>x.id===did); if(idx<0) throw Object.assign(new Error("not found"),{status:404});
        const old=db.doctors[idx];
        needBranch(old.branch_id);
        needSpecialty(old.specialty);
        let updated;
        if(_statusOnly){
          updated={...old, status:body.status, id:did}; // يحدّث الحالة فقط
        } else {
          updated={...old,...body,id:did};
          if(body.schedule) updated.schedule=body.schedule;
          if(body.dayoff) updated.dayoff=body.dayoff;
          // حفظ قيمة الزيارة المنزلية كما هي إن لم يرسلها النموذج (بدل تصفيرها)
          if("home_visit" in body) updated.home_visit=body.home_visit?1:0;
          else updated.home_visit=old.home_visit?1:0;
          _validateDoctorFields(updated);
        }
        const changes=_diffDoctor(db,old,updated);
        db.doctors[idx]=updated;
        const bn=(db.branches.find(x=>x.id===updated.branch_id)||{}).name||"";
        const detail=changes.length?`تعديل بيانات "${updated.name}":\n• ${changes.join("\n• ")}`:`فتح بيانات "${updated.name}" دون تغيير`;
        log(db,"تعديل طبيب","doctor",did,detail,{branch:bn,branch_id:updated.branch_id}); save(db); return {ok:true};
      }
      if (method==="POST" && docM[2]==="/archive") {
        needPerm("doctor_delete");
        const d=db.doctors.find(x=>x.id===did); if(!d) throw Object.assign(new Error("not found"),{status:404});
        needBranch(d.branch_id);
        needSpecialty(d.specialty);
        d.archived=body.unarchive?0:1;
        // استرجاع يدوي ⇒ استثناء دائم من الأرشفة التلقائية حتى تتغيّر حالة العقد.
        // أرشفة يدوية ⇒ تصير قرار موظف لا أرشفة تلقائية.
        if(body.unarchive){ delete d.auto_archived; delete d.auto_archived_at; d.auto_archive_optout=1; }
        else { delete d.auto_archived; delete d.auto_archived_at; }
        const bn=(db.branches.find(x=>x.id===d.branch_id)||{}).name||"";
        log(db,d.archived?"أرشفة طبيب":"استرجاع طبيب","doctor",did,`${d.archived?"أرشفة":"استرجاع"} الممارس "${d.name}" (الفرع ${bn||"—"})`,{branch:bn,branch_id:d.branch_id}); save(db); return {ok:true};
      }
      if (method==="POST" && docM[2]==="/terminate") {
        needAnyPerm("doctor_edit","status_manage");
        const d=db.doctors.find(x=>x.id===did); if(!d) throw Object.assign(new Error("not found"),{status:404});
        needBranch(d.branch_id);
        needSpecialty(d.specialty);
        const bn=(db.branches.find(x=>x.id===d.branch_id)||{}).name||"";
        const today=_riyadhDate();
        if(body.unterm){
          // إلغاء إنهاء العقد / إعادة تفعيل — يمسح المجدول والمنفّذ
          const wasSched=d.termination_scheduled;
          d.terminated=0; delete d.terminated_date; delete d.termination_scheduled;
          const wasAuto=clearAutoArchive(d);   // كان مخفياً تلقائياً ⇒ يعود للظهور
          log(db,"إعادة تفعيل طبيب","doctor",did,`إلغاء إنهاء عقد "${d.name}"${wasSched?` (كان مجدولاً بتاريخ ${_fmtD(wasSched)})`:""} وإعادة تفعيله${wasAuto?" وإلغاء إخفائه التلقائي":""}`,{branch:bn,branch_id:d.branch_id}); save(db); return {ok:true};
        }
        const date=body.date||today;
        if(date>today){
          // تاريخ مستقبلي — يُفعّل تلقائياً عند وصوله (لا يزال يعمل حتى ذلك اليوم)
          d.termination_scheduled=date; d.terminated=0; delete d.terminated_date;
          clearAutoArchive(d);   // يستمر بالعمل حتى التاريخ الجديد
          log(db,"جدولة إنهاء عقد","doctor",did,`جدولة إنهاء عقد "${d.name}" بتاريخ ${_fmtD(date)} (يستمر بالعمل حتى ذلك التاريخ)`,{branch:bn,branch_id:d.branch_id}); save(db); return {ok:true,scheduled:date};
        }
        // اليوم أو تاريخ سابق — إنهاء فوري
        d.terminated=1; d.terminated_date=date; delete d.termination_scheduled;
        clearAutoArchive(d);   // تاريخ جديد ⇒ تُحتسب الثلاثون يوماً منه
        log(db,"إنهاء عقد طبيب","doctor",did,`إنهاء عقد "${d.name}" بتاريخ ${_fmtD(date)}`,{branch:bn,branch_id:d.branch_id}); save(db); return {ok:true};
      }
      if (method==="DELETE") {
        needPerm("doctor_delete");
        const d=db.doctors.find(x=>x.id===did);
        if(d){ needBranch(d.branch_id); needSpecialty(d.specialty); }
        db.doctors=db.doctors.filter(x=>x.id!==did);
        db.leaves=db.leaves.filter(l=>l.doctor_id!==did);
        const bn=d?(db.branches.find(x=>x.id===d.branch_id)||{}).name||"":"";
        log(db,"حذف طبيب","doctor",did,d?`حذف نهائي للممارس "${d.name}" · ${d.specialty||"—"} · الفرع ${bn||"—"}`:"حذف ممارس",{branch:bn,branch_id:d?d.branch_id:null}); save(db); return {ok:true};
      }
    }
    if (method==="POST" && path==="/doctors") {
      needPerm("doctor_add");
      needBranch(body.branch_id);
      needSpecialty(body.specialty);
      const id=nextId(db,"doctors");
      const d={id,...body,home_visit:body.home_visit?1:0,archived:0,status:body.status||"active"};
      _validateDoctorFields(d);
      db.doctors.push(d);
      const bn=(db.branches.find(x=>x.id===+body.branch_id)||{}).name||"";
      log(db,"إضافة طبيب","doctor",id,`إضافة ممارس جديد "${d.name}" · ${d.specialty||"—"} · الفرع ${bn||"—"}`,{branch:bn,branch_id:d.branch_id}); save(db); return {id};
    }
    const visitM=path.match(/^\/doctors\/(\d+)\/visit$/);
    if(visitM && method==="POST"){
      needPerm("visit_manage"); // صلاحية مستقلة لزر الزيارة فقط
      const vid=+visitM[1];
      const d=db.doctors.find(x=>x.id===vid); if(!d) throw Object.assign(new Error("not found"),{status:404});
      needBranch(d.branch_id);
      needSpecialty(d.specialty);
      d.in_visit=!!body.in_visit;
      const bn=(db.branches.find(x=>x.id===d.branch_id)||{}).name||"";
      log(db,d.in_visit?"تفعيل زيارة":"إلغاء زيارة","doctor",vid,d.in_visit?`تغيير حالة "${d.name}": الدوام المعتاد ← في زيارة الآن`:`تغيير حالة "${d.name}": في زيارة الآن ← العودة للدوام المعتاد`,{branch:bn,branch_id:d.branch_id}); save(db);
      return {ok:true,in_visit:d.in_visit};
    }

    // LEAVES
    if (method==="GET" && path==="/leaves") {
      needAuth();
      const bmap={};db.branches.forEach(b=>bmap[b.id]=b.name);
      // work_days: أرقام الأيام (0=الأحد..6=السبت) التي للممارس فيها دوام — لحساب أول يوم عمل بعد الإجازة
      const _workDays=(sc)=>{const o=sc||{};const out=[];for(let i=0;i<7;i++){const sh=o[i]||o[String(i)];if(sh&&sh.length)out.push(i);}return out;};
      const dmap={};db.doctors.forEach(d=>{dmap[d.id]={name:d.name,branch_id:d.branch_id,specialty:d.specialty||"",terminated:!!d.terminated,archived:!!d.archived,work_days:_workDays(d.schedule)};});
      const today=_riyadhDate();
      // استثناء منتهي العقد والمؤرشفين — لا يُحتسبون كإجازات
      const realLeaves=db.leaves.filter(l=>{const doc=dmap[l.doctor_id];return !doc||(!doc.terminated&&!doc.archived);}).map(l=>{
        const doc=dmap[l.doctor_id]||{};
        return {...l,doctor_name:doc.name||"",branch_id:doc.branch_id||null,branch_name:bmap[doc.branch_id]||"",specialty:doc.specialty||"",
          work_days:doc.work_days||[],secondment_branch_name:l.secondment_branch_id?bmap[l.secondment_branch_id]||"":"",
          shift_label:l.shift?_shiftLabelByKey(db.doctors.find(x=>x.id==l.doctor_id),l.shift):""};
      });
      // Include doctors manually set to leave status with no active leave record
      const docIdsWithActiveLeave=new Set(db.leaves.filter(l=>l.start_date<=today&&l.end_date>=today).map(l=>l.doctor_id));
      const syntheticLeaves=db.doctors
        .filter(d=>!d.archived&&!d.terminated&&d.status==="leave"&&!docIdsWithActiveLeave.has(d.id))
        .map(d=>({id:"syn_"+d.id,doctor_id:d.id,start_date:today,end_date:today,type:"وضع يدوي",reason:"",synthetic:true,
          doctor_name:d.name,branch_id:d.branch_id||null,branch_name:bmap[d.branch_id]||"",specialty:d.specialty||"",work_days:_workDays(d.schedule)}));
      return {leaves:[...realLeaves,...syntheticLeaves].sort((a,b)=>b.start_date.localeCompare(a.start_date))};
    }
    if (method==="POST" && path==="/leaves") {
      needAnyPerm("leave_manage","status_manage");
      const d=db.doctors.find(x=>x.id===+body.doctor_id);
      if(!d) throw Object.assign(new Error("الممارس غير موجود"),{status:404}); // منع إنشاء إجازة لممارس غير موجود
      needBranch(d.branch_id); needSpecialty(d.specialty);
      const _newIsSec=(body.type==="ندب"&&!!body.secondment_branch_id);
      // الوردية يجب أن تكون مسجّلة فعلاً في جدول هذا الممارس
      const _docShiftKeys=new Set(_doctorShifts(d).map(x=>x.key));
      let _newShift=null;
      if(_newIsSec && body.shift){
        if(!_docShiftKeys.has(String(body.shift)))
          throw Object.assign(new Error("⛔ هذه الوردية غير مسجّلة في جدول دوام الممارس"),{status:400});
        _newShift=String(body.shift);
      }
      const clash=overlapLeaveFn(db.leaves,+body.doctor_id,body.start_date,body.end_date,null,_newIsSec,_newShift);
      if(clash) throw Object.assign(new Error(`⛔ تعارض في التواريخ: يوجد "${clash.type||"إجازة"}" من ${clash.start_date} إلى ${clash.end_date}`),{status:409});
      const id=nextId(db,"leaves");
      const lv={id,doctor_id:+body.doctor_id,start_date:body.start_date,end_date:body.end_date,type:body.type||"إجازة",reason:body.reason||"",
        secondment_branch_id:(body.type==="ندب"&&body.secondment_branch_id)?+body.secondment_branch_id:null};
      if(_newShift) lv.shift=_newShift;   // ندب شفت — غيابه يعني ندباً كاملاً
      db.leaves.push(lv);
      const bn=d?(db.branches.find(x=>x.id===d.branch_id)||{}).name||"":"";
      const dNm=d?d.name:"";
      const lvDetail=(lv.type==="ندب")
        ?`إنشاء ${lv.shift?("ندب شفت ("+_shiftLabelByKey(d,lv.shift)+")"):"ندب"} لـ"${dNm}" إلى فرع ${_auditVal(db,'secondment_branch_id',lv.secondment_branch_id)} من ${_fmtD(lv.start_date)} إلى ${_fmtD(lv.end_date)}`
        :`إضافة ${lv.type} لـ"${dNm}" من ${_fmtD(lv.start_date)} إلى ${_fmtD(lv.end_date)}`;
      log(db,"إضافة إجازة","leave",id,lvDetail,{branch:bn,branch_id:d?d.branch_id:null}); save(db); return {id};
    }
    const lvM=path.match(/^\/leaves\/(\d+)$/);
    if(lvM&&method==="PUT"){
      needAnyPerm("leave_manage","status_manage");
      const l=db.leaves.find(x=>x.id===+lvM[1]);
      if(!l) throw Object.assign(new Error("not found"),{status:404});
      const d=db.doctors.find(x=>x.id===l.doctor_id);
      if(d){ needBranch(d.branch_id); needSpecialty(d.specialty); }
      const _ns=("start_date" in body)?body.start_date:l.start_date, _ne=("end_date" in body)?body.end_date:l.end_date;
      const _uType=("type" in body)?body.type:l.type;
      const _uBranch=("secondment_branch_id" in body)?body.secondment_branch_id:l.secondment_branch_id;
      const _uIsSec=(_uType==="ندب"&&!!_uBranch);
      let _uShift=null;
      if(_uIsSec){
        if("shift" in body){
          if(body.shift){
            const _dShifts=new Set(_doctorShifts(d).map(x=>x.key));
            // يُقبل مفتاح مسجّل في الجدول، أو تسمية قديمة لسجل سابق
            if(!_dShifts.has(String(body.shift)) && !SHIFT_LABEL[body.shift])
              throw Object.assign(new Error("⛔ هذه الوردية غير مسجّلة في جدول دوام الممارس"),{status:400});
            _uShift=String(body.shift);
          }
        } else _uShift=l.shift||null;   // لم يُرسل الحقل ⇒ يبقى كما هو (لا حذف تلقائي)
      }
      const clash=overlapLeaveFn(db.leaves,l.doctor_id,_ns,_ne,l.id,_uIsSec,_uShift);
      if(clash) throw Object.assign(new Error(`⛔ تعارض في التواريخ: يوجد "${clash.type||"إجازة"}" من ${clash.start_date} إلى ${clash.end_date}`),{status:409});
      const _before={type:l.type,start_date:l.start_date,end_date:l.end_date,reason:l.reason,secondment_branch_id:l.secondment_branch_id,shift:l.shift||null};
      ["start_date","end_date","type","reason"].forEach(k=>{ if(k in body) l[k]=body[k]; });
      l.secondment_branch_id=(l.type==="ندب"&&body.secondment_branch_id)?+body.secondment_branch_id:null;
      if(_uShift) l.shift=_uShift; else delete l.shift;   // تحويل بين ندب كامل/شفت
      const bn=d?(db.branches.find(x=>x.id===d.branch_id)||{}).name||"":"";
      const lchanges=_diffLeave(db,_before,l);
      const editDetail=lchanges.length?`تعديل ${l.type||"إجازة"} لـ"${d?d.name:""}":\n• ${lchanges.join("\n• ")}`:`فتح إجازة "${d?d.name:""}" دون تغيير`;
      log(db,"تعديل إجازة","leave",+lvM[1],editDetail,{branch:bn,branch_id:d?d.branch_id:null}); save(db); return {ok:true};
    }
    if(lvM&&method==="DELETE"){
      needAnyPerm("leave_manage","status_manage");
      const l=db.leaves.find(x=>x.id===+lvM[1]);
      if(l){const d=db.doctors.find(x=>x.id===l.doctor_id); if(d){ needBranch(d.branch_id); needSpecialty(d.specialty); }}
      db.leaves=db.leaves.filter(lx=>lx.id!==+lvM[1]);
      const d=l?db.doctors.find(x=>x.id===l.doctor_id):null;
      const bn=d?(db.branches.find(x=>x.id===d.branch_id)||{}).name||"":"";
      const delDetail=l?(l.type==="ندب"
          ?`إلغاء ندب "${d?d.name:""}" إلى ${_auditVal(db,'secondment_branch_id',l.secondment_branch_id)} (${_fmtD(l.start_date)} — ${_fmtD(l.end_date)})`
          :`إلغاء ${l.type||"إجازة"} لـ"${d?d.name:""}" (${_fmtD(l.start_date)} — ${_fmtD(l.end_date)})`)
        :"إلغاء إجازة";
      log(db,"حذف إجازة","leave",+lvM[1],delDetail,{branch:bn,branch_id:d?d.branch_id:null}); save(db); return {ok:true};
    }

    // DASHBOARD
    if (method==="GET" && path.startsWith("/dashboard")) {
      needAuth();
      const branch_id=path.includes("branch_id=")?+path.split("branch_id=")[1]:null;
      const {day,nowMin,dateStr}=nowInfo();
      const docs=db.doctors.filter(d=>!d.archived&&!d.terminated&&(!branch_id||d.branch_id===branch_id));
      const buckets={present:[],upcoming:[],finished:[],leave:[],off:[]};
      const stats={present:0,morning:0,evening:0,leave:0,home_visit_now:0,total:docs.length};
      docs.forEach(d=>{
        const st=_liveOf(d,db,nowMin,day,dateStr);
        const doc={...d,live:st};
        const bucket=st.state;
        (buckets[bucket]||buckets.off).push(doc);
        if(st.state==="present"){stats.present++;if(d.home_visit)stats.home_visit_now++;}
        if(st.state==="leave") stats.leave++;
        const sc=d.schedule||{};
        const todays=sc[day]||sc[String(day)]||[];
        if(todays.length){const first=Math.min(...todays.map(x=>x[0]));if(first<840)stats.morning++;else stats.evening++;}
      });
      Object.values(buckets).forEach(arr=>arr.sort((a,b)=>a.name.localeCompare(b.name)));
      return {buckets,stats,now:fmtMin(nowMin),day};
    }

    // AVAILABLE NOW
    if (method==="GET" && path==="/available-now") {
      needAuth();
      const {day,nowMin,dateStr}=nowInfo();
      const bmap={};db.branches.forEach(b=>bmap[b.id]=b.name);
      const by_branch={},home=[];
      db.doctors.filter(d=>!d.archived).forEach(d=>{
        const st=_liveOf(d,db,nowMin,day,dateStr);
        if(st.state!=="present") return;
        const bn=bmap[d.branch_id]||"";
        const doc={...d,live:st,branch_name:bn};
        (by_branch[bn]=by_branch[bn]||[]).push(doc);
        if(d.home_visit) home.push(doc);
      });
      return {by_branch,home_visit:home};
    }

    // SEARCH — comprehensive ranked search across all doctor fields
    if (method==="GET" && path.startsWith("/search")) {
      needAuth();
      const rawQ=decodeURIComponent((path.split("q=")[1]||"").split("&")[0]).trim();
      const qNorm=normalizeAr(rawQ).toLowerCase();
      const {day,nowMin,dateStr}=nowInfo();
      const bmap={};db.branches.forEach(b=>bmap[b.id]=b.name);

      // ── Intent detection (filter-level, before scoring) ─────────────────
      const has=w=>qNorm.includes(w);
      const wantAvail  = has("متاح الان")||has("موجود الان")||has("متاحين")||has("الحاضرين")||has("موجود الان")||has("حاضر الان");
      const wantLeave  = (has("اجازه")||has("اجازة")||has("مجازه")) && !wantAvail;
      const wantHome   = has("زياره منزليه")||has("زياره منزل")||has("منزليه");
      const wantMorning= has("صباحي")||has("الشفت الصباحي")||has("شفت صباح");
      const wantEvening= has("مسائي")||has("الشفت المسائي")||has("شفت مساء");

      const tokens=SmartSearch.tokenize(rawQ);

      // Pre-compute first-shift hour for morning/evening filter
      const firstShiftMin=(d)=>{
        const sh=(d.schedule&&(d.schedule[day]||d.schedule[String(day)]))||[];
        return sh.length?sh[0][0]:null;
      };

      const out=[];
      db.doctors.filter(d=>!d.archived).forEach(d=>{
        const st=_liveOf(d,db,nowMin,day,dateStr);

        // Intent-level hard filters
        if(wantAvail   && st.state!=="present") return;
        if(wantLeave   && st.state!=="leave")   return;
        if(wantHome    && !d.home_visit)        return;
        if(wantMorning ){ const fs=firstShiftMin(d); if(fs===null||fs>=14*60) return; }
        if(wantEvening ){ const fs=firstShiftMin(d); if(fs===null||fs< 14*60) return; }

        if(!tokens.length&&!(wantAvail||wantLeave||wantHome||wantMorning||wantEvening)) return;

        // ── نفس محرك SmartSearch المستخدم في بحث الممارسين (نتائج موحّدة) ──
        let totalScore = SmartSearch.score(rawQ, {
          name:d.name, en_name:d.en_name||d.name_en||"",
          specialty:d.specialty, branch:bmap[d.branch_id]||"",
          nationality:d.nationality, status:SmartSearch.statusText(st),
          rank:d.rank, qualification:d.qualification, gender:d.gender,
          experience:d.experience, hours:d.hours_raw, cases:d.cases,
          coord:d.notes_coord, languages:d.languages, id:d.id
        });
        if(tokens.length && !totalScore) return;

        // Availability boost — never overrides name quality ranking
        if(st.state==="present")       totalScore+=30;
        else if(st.state==="upcoming") totalScore+=10;

        out.push({...d,live:st,branch_name:bmap[d.branch_id]||"",_score:totalScore});
      });

      out.sort((a,b)=>b._score-a._score||a.name.localeCompare(b.name));
      return {results:out.slice(0,80),count:out.length};
    }

    // BEST DOCTOR
    if (method==="POST" && path==="/best-doctor") {
      needAuth();
      const {specialty, branch_id, gender} = body||{};
      const {day,nowMin,dateStr} = nowInfo();
      const bmap={}; db.branches.forEach(b=>bmap[b.id]=b.name);
      const PRIO={present:0,upcoming:1,finished:2,off:3,leave:4,archived:5};
      let docs=db.doctors.filter(d=>!d.archived);
      if(specialty) docs=docs.filter(d=>d.specialty===specialty);
      if(branch_id) docs=docs.filter(d=>d.branch_id===+branch_id);
      if(gender) docs=docs.filter(d=>d.gender===gender);
      docs=docs.map(d=>{const st=_liveOf(d,db,nowMin,day,dateStr);
        return {...d,live:st,branch_name:bmap[d.branch_id]||""};});
      docs.sort((a,b)=>{const pa=PRIO[a.live.state]??9,pb=PRIO[b.live.state]??9;
        return pa!==pb?pa-pb:a.name.localeCompare(b.name);});
      return {results:docs};
    }

    // AUDIT
    if (method==="GET" && path==="/audit") {
      needPerm("audit_view");
      // السقف هنا كان 300 بينما التخزين 500 — فكانت 180 عملية موجودة وغير مرئية،
      // ويبدو للمستخدم أنها حُذفت. الآن يُعرض كل ما هو محفوظ فعلاً.
      return {audit:db.audit.slice(0,2500)};
    }

    throw Object.assign(new Error("not found"),{status:404});
  }

  // ── Public call ───────────────────────────────────────────────
  async function call(path, opts={}) {
    await ensureInit();
    const method=(opts.method||"GET").toUpperCase();
    const body=opts.body||{};
    let result;
    try {
      result = route(method, path, body);
    } catch(e) {
      const status=e.status||500;
      if(status===401) throw Object.assign(new Error(e.message||"auth"),{isAuth:true});
      throw new Error(e.message||"خطأ");
    }
    return result;
  }

  ensureInit(); // start loading in background

  function exportDB() {
    const db = load();
    return db ? JSON.parse(JSON.stringify(db)) : null;
  }

  function importDB(data){
    // نسخة تلقائية من البيانات الحالية قبل الاستبدال
    const ts=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
    _writeSnapshot('pre_restore_'+ts,null,{kind:'pre',action:'نسخة أمان قبل استيراد ملف'}).catch(e=>console.error('[Adelcare] pre-restore snapshot:',e));
    const db={doctors:data.doctors||[],branches:data.branches||[],leaves:data.leaves||[],audit:data.audit||[],settings:data.settings||{},_seq:data._seq||{doctors:200,branches:10,leaves:50,audit:100}};
    save(db);
  }

  return {
    // سطح مكشوف للاختبارات فقط — دوال خالصة تعمل على كائن يُمرَّر إليها،
    // لا تقرأ ولا تكتب في قاعدة البيانات الحيّة.
    __contract: { ARCHIVE_AFTER_DAYS, _parseISODate, _daysSince, autoArchiveExpired, clearAutoArchive },
    call: (m,p,b)=>{ if(m==="GET"&&p==="/export-db"){const s=getSession();if(!s.auth)throw Object.assign(new Error("يرجى تسجيل الدخول أولاً"),{status:401,isAuth:true});if(!_permOk(s,"settings_access"))throw Object.assign(new Error("لا تملك صلاحية لهذا الإجراء"),{status:403});return exportDB();} if(m==="POST"&&p==="/import-db"){const s=getSession();if(!s.auth)throw Object.assign(new Error("يرجى تسجيل الدخول أولاً"),{status:401,isAuth:true});if(!_permOk(s,"settings_access"))throw Object.assign(new Error("لا تملك صلاحية لهذا الإجراء"),{status:403});importDB(b);return{ok:true};} if(m==="GET"&&p==="/snapshots"){const s=getSession();if(!s.auth)throw Object.assign(new Error("يرجى تسجيل الدخول أولاً"),{status:401,isAuth:true});if(!_permOk(s,"settings_access"))throw Object.assign(new Error("لا تملك صلاحية لهذا الإجراء"),{status:403});const coll=_snapColl();if(!coll)return Promise.resolve({snapshots:[]});return _readSnapIndex().then(list=>({snapshots:list}));} if(m==="POST"&&p==="/snapshot-now"){const s=getSession();if(!s.auth)throw Object.assign(new Error("يرجى تسجيل الدخول أولاً"),{status:401,isAuth:true});if(!_permOk(s,"settings_access"))throw Object.assign(new Error("لا تملك صلاحية لهذا الإجراء"),{status:403});const coll=_snapColl();if(!coll)throw new Error("النسخ الاحتياطية غير متاحة حالياً");const id='manual_'+new Date().toISOString().replace(/[:.]/g,'-').slice(0,23);return _writeSnapshot(id,null,{kind:'manual',action:(b&&b.note)||'نسخة يدوية',user:(s.name||"")}).then(()=>({ok:true,id}));} if(m==="POST"&&p==="/restore-snapshot"){const s=getSession();if(!s.auth)throw Object.assign(new Error("يرجى تسجيل الدخول أولاً"),{status:401,isAuth:true});if(!_permOk(s,"settings_access"))throw Object.assign(new Error("لا تملك صلاحية لهذا الإجراء"),{status:403});return (async()=>{const coll=_snapColl();if(!coll)throw new Error("النسخ التلقائية غير متاحة حالياً");const ts=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);await _writeSnapshot('pre_restore_'+ts,null,{kind:'pre',action:'نسخة أمان قبل الاستعادة',user:(s.name||"")});const snap=await coll.doc(b.id).get();if(!snap.exists||!snap.data().data)throw new Error("النسخة غير موجودة");const main=JSON.parse(snap.data().data);const db={...main,audit:(_memDB&&_memDB.audit)||[]};log(db,"استعادة نسخة تلقائية: "+b.id,"settings");save(db);return{ok:true};})();} return call(m,p,b); }, reset: async()=>{ const s=getSession(); if(!s.auth) throw Object.assign(new Error("يرجى تسجيل الدخول أولاً"),{status:401,isAuth:true}); if(!_permOk(s,"settings_access")) throw Object.assign(new Error("لا تملك صلاحية لهذا الإجراء"),{status:403}); const ts=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19); try{ await _writeSnapshot('pre_reset_'+ts,null,{kind:'pre',action:'نسخة أمان قبل التصفير',user:(s.name||"")}); }catch(e){ console.error('[Adelcare] pre-reset snapshot:', e); } const fresh=JSON.parse(JSON.stringify({doctors:SEED.doctors,branches:SEED.branches,leaves:[],settings:SEED.settings,audit:[],_seq:SEED._seq||{doctors:200,branches:10,leaves:50,audit:100}})); _memDB=fresh; await _writeAllSections(fresh); }, resync: ()=>_forceResync(),
    // ── الكاشف: يقارن أرقام المراجعة بأحدث نسخة احتياطية ──────────────
    // رقم المراجعة لا ينقص أبداً في التشغيل السليم، والنسخة مستند كُتب في
    // الماضي فلا يستطيع جهاز قديم تزويرها ⇒ نقصانه دليل قاطع لا احتمال.
    integrityCheck: async()=>{
      const s=getSession();
      if(!s.auth) throw Object.assign(new Error("يرجى تسجيل الدخول أولاً"),{status:401});
      if(!_permOk(s,"settings_access")) throw Object.assign(new Error("لا تملك صلاحية لهذا الإجراء"),{status:403});
      const coll=_snapColl(); if(!coll||!_memDB) throw new Error("النسخ الاحتياطية غير متاحة");
      const list=await _readSnapIndex();
      if(!list.length) throw new Error("لا توجد نسخة احتياطية للمقارنة");
      const newest=list.slice().sort((a,b)=>a.ts<b.ts?1:-1)[0];
      const snap=await coll.doc(newest.id).get();
      if(!snap.exists||!snap.data().data) throw new Error("تعذّر قراءة النسخة");
      const ref={}; (JSON.parse(snap.data().data).doctors||[]).forEach(d=>{ ref[d.id]=d; });
      const reverted=[], missing=[];
      (_memDB.doctors||[]).forEach(d=>{
        const r=ref[d.id]; if(!r) return;
        const a=(typeof d._rev==='number')?d._rev:0, b=(typeof r._rev==='number')?r._rev:0;
        if(a<b) reverted.push({id:d.id, name:d.name, now:a, saved:b,
                               was:r.updated_at||null, is:d.updated_at||null});
      });
      Object.keys(ref).forEach(id=>{
        if(!(_memDB.doctors||[]).some(d=>String(d.id)===String(id))) missing.push(ref[id].name);
      });
      return { snapshot:newest.id, snapshotTs:newest.ts,
               checked:(_memDB.doctors||[]).length, reverted, missing };
    },
    signIn: (userId,password)=>_signInUser(userId,password),
    // يعيد بناء الجلسة من حساب Firebase المسجَّل — يُستدعى عند الإقلاع
    // ليستعيد المستخدم جلسته بعد إعادة التحميل بلا دخول جديد.
    restoreSession: async()=>{ try{ await ensureInit(); }catch(e){ return null; } return _sessionFromAuth(); },
    signOut: ()=>_signOutUser(),
    isRealAuth: ()=>_isRealAuth(),
    // قائمة الأسماء لشاشة الدخول — بلا أي بيانات حسّاسة
    // ورديات ممارس معيّن كما هي مسجّلة في جدوله — مصدر خيارات "ندب شفت"
    doctorShifts: (doctorId)=>{ const db=load(); if(!db) return [];
      const d=(db.doctors||[]).find(x=>x.id==doctorId); if(!d) return [];
      return _doctorShifts(d).map(x=>({key:x.key, label:_shiftLabelOf(x.start,x.end), days:x.days})); },
    loginUsers: ()=>{ const db=load(); if(!db) return [];
      return (db.settings.users||[]).filter(u=>u.active&&u.email).map(u=>({id:u.id,name:u.name})); } };
})();

