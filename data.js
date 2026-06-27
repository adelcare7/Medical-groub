/*
 * ══════════════════════════════════════════════════════════════
 *  بيانات مجموعة عادل الطبية
 *  ──────────────────────────────────────────────────────────
 *  هذا الملف يحتوي على جميع بيانات النظام.
 *  عدّل هذا الملف فقط لتحديث البيانات (ممارسين، فروع، إجازات).
 *  لا تعدّل index.html إلا لتحديث الأكواد.
 * ══════════════════════════════════════════════════════════════
 */

const SEED = {

  // ── أرقام التسلسل (لا تعدّلها يدوياً) ──
  _seq: {"doctors": 200, "branches": 10, "leaves": 50, "audit": 100},

  // ══════════════════════════════════════════════════════════════
  //  الفروع
  // ══════════════════════════════════════════════════════════════
  branches: [
    {
        "grp": "عادل كير",
        "hours": "من 8ص حتى 3ص، والجمعة من 1م حتى 3ص",
        "id": 1,
        "info": "المستقبل سابقاً",
        "name": "عادل كير - فرع الشرق",
        "phone": null
    },
    {
        "grp": "عادل كير",
        "hours": "من 8ص حتى 1ص، والجمعة من 1م حتى 1ص",
        "id": 2,
        "info": "طريق عمر بن الخطاب - مقابل حي البشر",
        "name": "عادل كير - الإسكان",
        "phone": null
    },
    {
        "grp": "عادل كير",
        "hours": "من 8ص حتى 1ص، والجمعة من 1م حتى 1ص",
        "id": 3,
        "info": "حي الحزم",
        "name": "عادل كير - فرع الشمال",
        "phone": null
    },
    {
        "grp": "بلوديم",
        "hours": "من 8ص حتى 12ص، والجمعة من 1م حتى 12ص",
        "id": 4,
        "info": "",
        "name": "بلوديم - فرع الزرقاء",
        "phone": "0502057999"
    },
    {
        "grp": "بلوديم",
        "hours": "من 8ص حتى 3ص، والجمعة من 1م حتى 12ص",
        "id": 5,
        "info": "",
        "name": "بلوديم - فرع الأفق",
        "phone": null
    }
],

  // ══════════════════════════════════════════════════════════════
  //  الإجازات
  // ══════════════════════════════════════════════════════════════
  leaves: [],

  // ══════════════════════════════════════════════════════════════
  //  الإعدادات
  // ══════════════════════════════════════════════════════════════
  settings: {
    "access_code": "123",
    "admin_code": "12345",
    "edit_code": "1212"
},

  // ══════════════════════════════════════════════════════════════
  //  سجل العمليات
  // ══════════════════════════════════════════════════════════════
  audit: [],

  // ══════════════════════════════════════════════════════════════
  //  الممارسون
  //  ─────────────────────────────────────────────────────────
  //  كل ممارس يحتوي على:
  //    id, name, branch_id, specialty, rank, nationality,
  //    gender, experience, qualification, status,
  //    schedule (جدول الدوام), dayoff (أيام الإجازة),
  //    cases, notes_coord, notes_admin, phone, photo
  // ══════════════════════════════════════════════════════════════
  doctors: [
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "11 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 7,
        "languages": "",
        "name": "أحمد رجب",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "باطنة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "8 سنوات",
        "gender": "",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 75,
        "languages": "",
        "name": "أحمد شعبان",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "منتدب للإسكان",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "أطفال",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "جميع حالات الجراحه والزراعة (يستقبل حالات الخاصه بالاطفال *ابلاغ الطبيب مسبقا ) / حالات الحمل : يستقبل كشف - لايتم اي اجراء الا بتقرير طبي من طبيبة النساء",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "17",
        "gender": "",
        "home_visit": false,
        "hours_raw": "من 10:00 الى 12- ومن 4 الى 10:30 مساءً",
        "id": 126,
        "languages": "",
        "name": "أحمد محمد",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي جراحة",
        "rank": "أخصائي جراحة",
        "schedule": {
            "0": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1350
                ]
            ],
            "1": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1350
                ]
            ],
            "2": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1350
                ]
            ],
            "3": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1350
                ]
            ],
            "4": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1350
                ]
            ],
            "5": [],
            "6": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1350
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "17 مصريه",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 10ص إلى 12م || من 4م إلى 10م",
        "id": 17,
        "languages": "",
        "name": "أسماء ضرار",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "ابتدأ من السبت6\\6 ( من 10ص - 6م || الخميس من 10ص - 12م ومن 4م - 10م)",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "نساء وولادة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "7 سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4 م إلى 12ص",
        "id": 65,
        "languages": "",
        "name": "أشرف بابو",
        "nationality": "هندي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي عصب",
        "rank": "اخصائي عصب",
        "schedule": {
            "0": [
                [
                    960,
                    1440
                ]
            ],
            "1": [
                [
                    960,
                    1440
                ]
            ],
            "2": [
                [
                    960,
                    1440
                ]
            ],
            "3": [
                [
                    960,
                    1440
                ]
            ],
            "4": [
                [
                    960,
                    1440
                ]
            ],
            "5": [],
            "6": [
                [
                    960,
                    1440
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "3م-11م /الجمعة من3م -11م",
        "id": 53,
        "languages": "",
        "name": "أمل عثمان",
        "nationality": "انثى",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "",
        "rank": "اخصائي",
        "schedule": {
            "0": [
                [
                    900,
                    1380
                ]
            ],
            "1": [
                [
                    900,
                    1380
                ]
            ],
            "2": [
                [
                    900,
                    1380
                ]
            ],
            "3": [
                [
                    900,
                    1380
                ]
            ],
            "4": [],
            "5": [
                [
                    900,
                    1380
                ]
            ],
            "6": [
                [
                    900,
                    1380
                ]
            ]
        },
        "specialty": "نساء وولادة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "6 سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 14,
        "languages": "",
        "name": "أنس درويش",
        "nationality": "سوري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "مسالك بولية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "10سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8ص -4:30م || الخميس 9:30-12 & 4م-10م",
        "id": 11,
        "languages": "",
        "name": "احمد سرور",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "اجازة من 1/06 - العودة 1/07",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    480,
                    990
                ]
            ],
            "1": [
                [
                    480,
                    990
                ]
            ],
            "2": [
                [
                    480,
                    990
                ]
            ],
            "3": [
                [
                    480,
                    990
                ]
            ],
            "4": [
                [
                    570,
                    720
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    990
                ]
            ]
        },
        "specialty": "أطفال",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "9 سنوات",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 2:00 م إلى 10:00 م",
        "id": 55,
        "languages": "",
        "name": "اريج",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "ندب إلى الشرق",
        "phone": "",
        "photo": "",
        "qualification": "جلدية",
        "rank": "جلدية",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [
                [
                    840,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 2م إلى 10م",
        "id": 109,
        "languages": "",
        "name": "اسماء محمد",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "",
        "rank": "اخصائية",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [],
            "5": [
                [
                    840,
                    1320
                ]
            ],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "نساء وولادة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "15 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من9:30ص-12م||4م-10م",
        "id": 10,
        "languages": "",
        "name": "اسماعيل",
        "nationality": "سوري",
        "notes_admin": "",
        "notes_coord": "متوفر الختان الجراحي و عن طريق الجهاز الكي الكهربائي والختان الحلقي/ عرض حاليا الختان + التحاليل 329",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي",
        "rank": "اخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "جراحة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "تنظيف أسنان ،جميع الحشوات ، علاج الجذور وحشو العصب ، علاج اللثة (توريد،قص) ،التبييض المنزلي والليزر، الخلع العادي والجراحي البسيط ، الأطفال من 10 سنوات / حالات الحمل : يستقبل بتقرير طبي من دكتورة النساء",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "13",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4:30م إلى 1:00ص",
        "id": 131,
        "languages": "",
        "name": "السيد عطية",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    990,
                    1500
                ]
            ],
            "1": [
                [
                    990,
                    1500
                ]
            ],
            "2": [
                [
                    990,
                    1500
                ]
            ],
            "3": [
                [
                    990,
                    1500
                ]
            ],
            "4": [
                [
                    990,
                    1500
                ]
            ],
            "5": [],
            "6": [
                [
                    990,
                    1500
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "",
        "coverage": "",
        "dayoff": [],
        "dayoff_raw": "",
        "experience": "",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8ص الى 12ص الجمعة من 2م الى 10م",
        "id": 89,
        "languages": "",
        "name": "الليزر",
        "nationality": "",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "",
        "rank": "",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "specialty": "الأشعة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "باطنة جميع الحالات  العظام الحالات البسيطة / الجراحة  الحالات البسيطة/تخريم اذن فوق 6 أشهر / اصغر من 6 شهور يكشف عليه من قبل الطبيبه أولا/عيون التهابات بسيطة/صدرية جميع الحالات/مسالك الحالات البسيطة الأطفال من3 سنوات //اقل من 3 سنوات يكشف علية من قبل الطبيبة/اذن انف حنجرة من غير تنظيف اذن",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "3 سنوات",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 4:30 م -1ص",
        "id": 44,
        "languages": "",
        "name": "امل ادم",
        "nationality": "سودانية",
        "notes_admin": "",
        "notes_coord": "تستقبل اطفال من عمر 6 اشهر فاعلى حسب الحالة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    990,
                    1500
                ]
            ],
            "1": [
                [
                    990,
                    1500
                ]
            ],
            "2": [
                [
                    990,
                    1500
                ]
            ],
            "3": [
                [
                    990,
                    1500
                ]
            ],
            "4": [
                [
                    990,
                    1500
                ]
            ],
            "5": [],
            "6": [
                [
                    990,
                    1500
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "20 سنه",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 2م - 10م",
        "id": 136,
        "languages": "",
        "name": "امل حامد",
        "nationality": "",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "نساء وولادة",
        "rank": "نساء وولادة",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [],
            "5": [
                [
                    840,
                    1320
                ]
            ],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "نساء وولادة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "باطنة جميع الحالات  ، العظام روماتيزم + حالات مناعية/ الجراحات والحروق البسيطة/تخريم أذن ومناطق أخرى/عيون التهابات بسيطة/صدرية جميع الحالات/مسالك الحالات البسيطة/الأطفال جميع الحالات /اذن انف حنجرة من غير تنظيف اذن",
        "coverage": "",
        "dayoff": [],
        "dayoff_raw": "لا يوجد",
        "experience": "18 سنة",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 8ص -4:30م",
        "id": 42,
        "languages": "",
        "name": "اميمة",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "الجمعة من1م -1ص // تستقبل اطفال جميع الاعمار حسب الحالة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    990
                ]
            ],
            "1": [
                [
                    480,
                    990
                ]
            ],
            "2": [
                [
                    480,
                    990
                ]
            ],
            "3": [
                [
                    480,
                    990
                ]
            ],
            "4": [
                [
                    480,
                    990
                ]
            ],
            "5": [
                [
                    480,
                    990
                ]
            ],
            "6": [
                [
                    480,
                    990
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 1:00م إلى 10:00م",
        "id": 57,
        "languages": "",
        "name": "ايمان",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "فنية بشرة",
        "rank": "فنية بشرة",
        "schedule": {
            "0": [
                [
                    780,
                    1320
                ]
            ],
            "1": [
                [
                    780,
                    1320
                ]
            ],
            "2": [
                [
                    780,
                    1320
                ]
            ],
            "3": [
                [
                    780,
                    1320
                ]
            ],
            "4": [
                [
                    780,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    780,
                    1320
                ]
            ]
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 118,
        "languages": "",
        "name": "ثامر",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "منتدب للإسكان",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "أنف وأذن وحنجرة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "جميع حالات الأسنان للأطفال",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "12 سنة",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 1:00م إلى 10:00م",
        "id": 83,
        "languages": "",
        "name": "جودي",
        "nationality": "هندية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي أطفال",
        "rank": "اخصائي أطفال",
        "schedule": {
            "0": [
                [
                    780,
                    1320
                ]
            ],
            "1": [
                [
                    780,
                    1320
                ]
            ],
            "2": [
                [
                    780,
                    1320
                ]
            ],
            "3": [
                [
                    780,
                    1320
                ]
            ],
            "4": [
                [
                    780,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    780,
                    1320
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 1 م الى 10 م",
        "id": 40,
        "languages": "",
        "name": "جوماري",
        "nationality": "فلبينية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "فني",
        "rank": "فني",
        "schedule": {
            "0": [
                [
                    780,
                    1320
                ]
            ],
            "1": [
                [
                    780,
                    1320
                ]
            ],
            "2": [
                [
                    780,
                    1320
                ]
            ],
            "3": [
                [
                    780,
                    1320
                ]
            ],
            "4": [
                [
                    780,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    780,
                    1320
                ]
            ]
        },
        "specialty": "علاج طبيعي",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 119,
        "languages": "",
        "name": "حسام",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي",
        "rank": "اخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "عظام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "33 سنة",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9ص-12م || من 4م-9:00م",
        "id": 16,
        "languages": "",
        "name": "حنان فرحات",
        "nationality": "مصريه",
        "notes_admin": "",
        "notes_coord": "إجازة من الجمعة 12\\6 العودة 9\\7",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1260
                ]
            ],
            "1": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1260
                ]
            ],
            "2": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1260
                ]
            ],
            "3": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1260
                ]
            ],
            "4": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1260
                ]
            ],
            "5": [],
            "6": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1260
                ]
            ]
        },
        "specialty": "نساء وولادة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "يتملك تدريب سريري في التعوضات السنية ( التركيبات) /  الأطفال من 4 سنوات",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "المباشرة 05/05  من 8 ص الى 4 م الخميس من2م -10م",
        "id": 63,
        "languages": "",
        "name": "خالد الفريح",
        "nationality": "سعودي",
        "notes_admin": "",
        "notes_coord": "اجازة من 27/06 العودة 30/06",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "specialty": "أسنان",
        "status": "leave"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "7",
        "gender": "",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 97,
        "languages": "",
        "name": "د. أحمد رمضان",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي",
        "rank": "اخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "أنف وأذن وحنجرة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "الاطفال من 13 سنة.  /حالات الحمل : يستقبل لكن لن يتم اي اجراء الا بتقرير طبي",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "14",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "تاريخ المباشرة 01\\06 من 2م الى 10 م",
        "id": 107,
        "languages": "",
        "name": "د. تامر نبيل",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي جراحة وزراعة",
        "rank": "أخصائي جراحة وزراعة",
        "schedule": {
            "0": [
                [
                    780,
                    1080
                ]
            ],
            "1": [
                [
                    780,
                    1080
                ]
            ],
            "2": [
                [
                    780,
                    1080
                ]
            ],
            "3": [
                [
                    780,
                    1080
                ]
            ],
            "4": [
                [
                    780,
                    1080
                ]
            ],
            "5": [],
            "6": [
                [
                    780,
                    1080
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "تملك زمالة بريطانية جراحة جميع علاجات الاسنان ( توريد وقص لثة ) / الأطفال من 4 سنوات / تنظيف وحشوات مؤفتة - اجراءات اخرى بتقرير طبي.",
        "coverage": "",
        "dayoff": [
            6
        ],
        "dayoff_raw": "السبت",
        "experience": "7سنوات",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 2 م الى 10 م الجمعة من 2م ل 10م",
        "id": 61,
        "languages": "",
        "name": "د. رانيا",
        "nationality": "مصريه",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [
                [
                    840,
                    1320
                ]
            ],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "الباطنه والصدرية جميع الحالات ,تخريم يستقبل مواليد لابد الكشف اولا ,واعلى,الأطفال من غير حديثي الولادة,عظام جميع الحالات ماعدا الجبيرة,الجراحة الجراحات والحروق البسيطة,مسالك التهاب المسالك و الحصوات,العيون التهابات بسيطة,أنف وأذن وحنجرة من غير تنظيف الأذن",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "6",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من3:30م- 12ص",
        "id": 94,
        "languages": "",
        "name": "د. رشا ادم",
        "nationality": "سودانية",
        "notes_admin": "",
        "notes_coord": "تستقبل اطفال من عمر 6 اشهر فاعلى حسب الحالة — إجازة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    930,
                    1440
                ]
            ],
            "1": [
                [
                    930,
                    1440
                ]
            ],
            "2": [
                [
                    930,
                    1440
                ]
            ],
            "3": [
                [
                    930,
                    1440
                ]
            ],
            "4": [
                [
                    930,
                    1440
                ]
            ],
            "5": [],
            "6": [
                [
                    930,
                    1440
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "علاجات اللثة وتجميل (توريد- قص).  تنظيف ، تبييض ، علاج عصب ، دعامات ،  || الاطفال جميع الاعمار /  حالات الحمل: وجود تقرير طبي",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "10",
        "gender": "أنثى",
        "home_visit": true,
        "hours_raw": "من 4 م إلى 12 ص",
        "id": 104,
        "languages": "",
        "name": "د. زينب علي",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "زيارة منزلية",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    960,
                    1440
                ]
            ],
            "1": [
                [
                    960,
                    1440
                ]
            ],
            "2": [
                [
                    960,
                    1440
                ]
            ],
            "3": [
                [
                    960,
                    1440
                ]
            ],
            "4": [
                [
                    960,
                    1440
                ]
            ],
            "5": [],
            "6": [
                [
                    960,
                    1440
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "د. محمد صلاح ( زراعة وجراحة اسنان )/ جميع علاجات الأسنان",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "7 سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "إنهاء عقد",
        "id": 64,
        "languages": "",
        "name": "د. محمد صلاح",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "الباطنه والصدرية جميع الحالات ,تخريم الأذن مواليد لابد الكشف اولا واعلى  ,الأطفال من فوق3س, العظام جميع الحالات ماعدا الجبيرة,الجراحة الجراحات والحروق البسيطة,مسالك التهاب المسالك و الحصوات,العيون التهابات بسيطة,أنف وأذن وحنجرة من غير تنظيف الأذن",
        "coverage": "",
        "dayoff": [
            2
        ],
        "dayoff_raw": "الثلاثاء",
        "experience": "5",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 8ص -4م // الجمعة من 1م -9:30ص",
        "id": 93,
        "languages": "",
        "name": "د. هنا رفيق",
        "nationality": "باكستانية",
        "notes_admin": "",
        "notes_coord": "تستقبل اطفال من عمر 6 اشهر فاعلى حسب الحالة — على رأس العمل",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    960
                ]
            ],
            "1": [
                [
                    480,
                    960
                ]
            ],
            "2": [],
            "3": [
                [
                    480,
                    960
                ]
            ],
            "4": [
                [
                    480,
                    960
                ]
            ],
            "5": [
                [
                    480,
                    960
                ]
            ],
            "6": [
                [
                    480,
                    960
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "تنظيف، تبييض ، جميع الحشوات ، تلبيسات ، تركيبات ، دعامات  ، قص لثة ، تنظيف لثة عميق ،علاج عصب ، خلع عادي وجراحي بسيط ، ||  اطفال من 8 سنوات / حالات الحمل: تنظيف حشوة مؤقتة إجرائات اخرى بتقرير طبي",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "22",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4 م إلى 12 ص",
        "id": 101,
        "languages": "",
        "name": "د. وسيم",
        "nationality": "هندي",
        "notes_admin": "",
        "notes_coord": "اجازة من 27/06 العودة 06/08 — منتدب للإسكان",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    960,
                    1440
                ]
            ],
            "1": [
                [
                    960,
                    1440
                ]
            ],
            "2": [
                [
                    960,
                    1440
                ]
            ],
            "3": [
                [
                    960,
                    1440
                ]
            ],
            "4": [
                [
                    960,
                    1440
                ]
            ],
            "5": [],
            "6": [
                [
                    960,
                    1440
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "23 سنة",
        "gender": "",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 48,
        "languages": "",
        "name": "د. وليد",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أطفال",
        "rank": "أطفال",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "أطفال",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "جميع علاجات الاسنان الأطفال من 4 سنوات /حالات الحمل : تنظيف وحشوات مؤفتة - اجراءات اخرى بتقرير طبي",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "11سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8 ص إلى 4 م",
        "id": 59,
        "languages": "",
        "name": "د.اسراء",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [
                [
                    480,
                    960
                ]
            ],
            "1": [
                [
                    480,
                    960
                ]
            ],
            "2": [
                [
                    480,
                    960
                ]
            ],
            "3": [
                [
                    480,
                    960
                ]
            ],
            "4": [
                [
                    480,
                    960
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    960
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "16 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 1:30م الى 9:30م",
        "id": 111,
        "languages": "",
        "name": "د.امينة شاهين",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخاصئية",
        "rank": "اخاصئية",
        "schedule": {
            "0": [
                [
                    810,
                    1290
                ]
            ],
            "1": [
                [
                    810,
                    1290
                ]
            ],
            "2": [
                [
                    810,
                    1290
                ]
            ],
            "3": [
                [
                    810,
                    1290
                ]
            ],
            "4": [
                [
                    810,
                    1290
                ]
            ],
            "5": [],
            "6": [
                [
                    810,
                    1290
                ]
            ]
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "تنظيف تبييض علاج عصب/ تركيبات  / الأطفال من 4 سنوات /حالات الحمل حشوات مؤقته - خلع لابد تقريرطبي",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "4 سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4 م إلى 12ص",
        "id": 60,
        "languages": "",
        "name": "د.بلال بحري",
        "nationality": "سوري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [
                [
                    960,
                    1440
                ]
            ],
            "1": [
                [
                    960,
                    1440
                ]
            ],
            "2": [
                [
                    960,
                    1440
                ]
            ],
            "3": [
                [
                    960,
                    1440
                ]
            ],
            "4": [
                [
                    960,
                    1440
                ]
            ],
            "5": [],
            "6": [
                [
                    960,
                    1440
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "10",
        "gender": "",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 98,
        "languages": "",
        "name": "د.تامر",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "باطنة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "12",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 2م ل10م",
        "id": 106,
        "languages": "",
        "name": "د.جوهرعبد المجيد",
        "nationality": "هندي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي تركيبات",
        "rank": "أخصائي تركيبات",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [
                [
                    840,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "د زياد حاصل ع تدريب سريري في علاج العصب  / الأطفال من 4 سنوات /حالات الحمل - تنظيف وحشوات مؤفتة",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "8سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 05/05 من 4 م - 12ص / الجمعة من 5م ل1ص",
        "id": 62,
        "languages": "",
        "name": "د.زياد",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [
                [
                    1020,
                    1500
                ]
            ],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "جميع حالات العصب الاطفال من 9 سنوات / حالات الحمل تسكين الالم فقط - لا يتم اجراء  اي علاج الا بتقرير طبي من طبيبة نساء",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "10",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 2 م - 10 م",
        "id": 33,
        "languages": "",
        "name": "د.سناء",
        "nationality": "هنديه",
        "notes_admin": "",
        "notes_coord": "اجازة من 01/06 العودة 27/06",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي عصب",
        "rank": "أخصائي عصب",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [
                [
                    840,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "leave"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "3",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 16\\06 من 10 ص إلى 12 م ومن 4م الى 10 م",
        "id": 66,
        "languages": "",
        "name": "د.سيد عبدالباسط",
        "nationality": "هندي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي تركيبات",
        "rank": "أخصائي تركيبات",
        "schedule": {
            "0": [
                [
                    960,
                    1080
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    960,
                    1080
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    960,
                    1080
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    960,
                    1080
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    960,
                    1080
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    960,
                    1080
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "6",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "(من 02/05 يوم السبت من 1:30م  الى  10م)",
        "id": 108,
        "languages": "",
        "name": "د.شوج اشكان",
        "nationality": "هندي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي تقويم",
        "rank": "أخصائي تقويم",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": [
                [
                    300,
                    810
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "8 سنوات",
        "gender": "",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 49,
        "languages": "",
        "name": "د.عباس",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "عظام",
        "rank": "عظام",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "عظام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            0
        ],
        "dayoff_raw": "الاحد",
        "experience": "3",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4م -12ص // الجمعة من 3:30م -12ص",
        "id": 95,
        "languages": "",
        "name": "د.عبدالمجيب",
        "nationality": "باكستاني",
        "notes_admin": "",
        "notes_coord": "يستقبل اطفال جميع الاعمار حسب الحالة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [],
            "1": [
                [
                    960,
                    1440
                ]
            ],
            "2": [
                [
                    960,
                    1440
                ]
            ],
            "3": [
                [
                    960,
                    1440
                ]
            ],
            "4": [
                [
                    960,
                    1440
                ]
            ],
            "5": [
                [
                    930,
                    1440
                ]
            ],
            "6": [
                [
                    960,
                    1440
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "‏حشوات ,‏خلع الأسنان ,‏تنظيف وعلاج اللثة ,‏علاج عصب للاسنان الأمامية وال ضواحك الطبيب لديه خبره في الجراحه وحاصل عى تدريب سريري   || الاطفال جميع الاعمار / حالات الحمل : يستقبل  بالاشهر 4,5,6 ولابد من وجود تقرير طبي",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "3",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8ص إلى 4:00م",
        "id": 105,
        "languages": "",
        "name": "د.عزام",
        "nationality": "سعودي",
        "notes_admin": "",
        "notes_coord": "اجازة من 17/06 العودة 11/07",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    960
                ]
            ],
            "1": [
                [
                    480,
                    960
                ]
            ],
            "2": [
                [
                    480,
                    960
                ]
            ],
            "3": [
                [
                    480,
                    960
                ]
            ],
            "4": [
                [
                    480,
                    960
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    960
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "leave"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "11 سنة",
        "gender": "",
        "home_visit": false,
        "hours_raw": "من 10:00 الى 12- ومن 4 الى 10 مساءً",
        "id": 112,
        "languages": "",
        "name": "د.فاطمة",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "إجازة من 15\\6 العودة 1/7",
        "phone": "",
        "photo": "",
        "qualification": "اخاصئية",
        "rank": "اخاصئية",
        "schedule": {
            "0": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "11 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4:00م -10:00م",
        "id": 144,
        "languages": "",
        "name": "د.فاطمة",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخاصئية",
        "rank": "اخاصئية",
        "schedule": {
            "0": [
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "15",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "اخر يوم عمل 21/06/2026",
        "id": 32,
        "languages": "",
        "name": "د.محمد الشرفي",
        "nationality": "يمني",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "د.محمد الشرفي",
        "rank": "د.محمد الشرفي",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "specialty": "أسنان",
        "status": "leave"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "حالات الجراحة بالكامل",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "13 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 3:30 م إلى 11 م  |",
        "id": 29,
        "languages": "",
        "name": "د.محمد حامد",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "مقيم جراحة",
        "rank": "مقيم جراحة",
        "schedule": {
            "0": [
                [
                    930,
                    1380
                ]
            ],
            "1": [
                [
                    930,
                    1380
                ]
            ],
            "2": [
                [
                    930,
                    1380
                ]
            ],
            "3": [
                [
                    930,
                    1380
                ]
            ],
            "4": [
                [
                    930,
                    1380
                ]
            ],
            "5": [],
            "6": [
                [
                    930,
                    1380
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "4",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8ص -4م",
        "id": 96,
        "languages": "",
        "name": "د.محمد حسين",
        "nationality": "باكستاني",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "الطب العام",
        "rank": "الطب العام",
        "schedule": {
            "0": [
                [
                    480,
                    960
                ]
            ],
            "1": [
                [
                    480,
                    960
                ]
            ],
            "2": [
                [
                    480,
                    960
                ]
            ],
            "3": [
                [
                    480,
                    960
                ]
            ],
            "4": [
                [
                    480,
                    960
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    960
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 9:30م -12م \\\\4:00م-10م",
        "id": 100,
        "languages": "",
        "name": "د.مروة",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي",
        "rank": "اخصائي",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "specialty": "أطفال",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "يستقبل حالات العصب والتركيبات والزراعة   الأطفال من عمر 15سنه  (امتياز في جراحة الفم والأسنان) / حالات الحمل : لايستقبل",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "23 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4:00م إلى 12:30ص",
        "id": 80,
        "languages": "",
        "name": "د.مصطفى سعيد",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [
                [
                    960,
                    1470
                ]
            ],
            "1": [
                [
                    960,
                    1470
                ]
            ],
            "2": [
                [
                    960,
                    1470
                ]
            ],
            "3": [
                [
                    960,
                    1470
                ]
            ],
            "4": [
                [
                    960,
                    1470
                ]
            ],
            "5": [],
            "6": [
                [
                    960,
                    1470
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "علاج عصب / الأطفال من 4 سنوات /حالات الحمل  اول 3 شهور ماتستقبل",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "6سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8 ص إلى 4 م",
        "id": 58,
        "languages": "",
        "name": "د.منى الحربي",
        "nationality": "سعودية",
        "notes_admin": "",
        "notes_coord": "اجازة من 02/06",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [
                [
                    480,
                    960
                ]
            ],
            "1": [
                [
                    480,
                    960
                ]
            ],
            "2": [
                [
                    480,
                    960
                ]
            ],
            "3": [
                [
                    480,
                    960
                ]
            ],
            "4": [
                [
                    480,
                    960
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    960
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "leave"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 2:00م إلى 10:00م",
        "id": 113,
        "languages": "",
        "name": "د.نعمة",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائية",
        "rank": "اخصائية",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [],
            "5": [
                [
                    840,
                    1320
                ]
            ],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "جميع الحشوات(تجميلية)، تنظيف ،تبييض  || الاطفال جميع الاعمار / حالات الحمل : لاتستقبل",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "7",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 2:00م إلى 10:00م | ( الجمعة من 2م إلى 10م )",
        "id": 102,
        "languages": "",
        "name": "د.هديل حماده",
        "nationality": "سورية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [
                [
                    840,
                    1320
                ]
            ],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "3",
        "gender": "",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 99,
        "languages": "",
        "name": "د.هيثم",
        "nationality": "سوري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي",
        "rank": "اخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "عظام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "33سنة",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 3م الى 10:30م",
        "id": 85,
        "languages": "",
        "name": "داليا",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائية نساء",
        "rank": "اخصائية نساء",
        "schedule": {
            "0": [
                [
                    900,
                    1350
                ]
            ],
            "1": [
                [
                    900,
                    1350
                ]
            ],
            "2": [
                [
                    900,
                    1350
                ]
            ],
            "3": [
                [
                    900,
                    1350
                ]
            ],
            "4": [
                [
                    900,
                    1350
                ]
            ],
            "5": [],
            "6": [
                [
                    900,
                    1350
                ]
            ]
        },
        "specialty": "نساء وولادة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "12",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً|| الجمعة من 3م -11:30",
        "id": 8,
        "languages": "",
        "name": "دينا فايز",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "اجازة من 26/05 حتى 27/06",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [],
            "5": [
                [
                    900,
                    1410
                ]
            ],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "صدرية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "الباطنه و الصدرية جميع الحالات,العظام الحالات البسيطة,الجراحة الجراحات والحروق البسيطة,المسالك التهاب المسالك و الحصوات,الأطفال فوق3س,أنف و أذن وحنجرة منغير تنظيف الأذن,العيون التهابات بسيطة,التخريم الأنف و الأذن",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "3 سنوات",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 8ص -4:30م || السبت من 10ص -6:30م|| الجمعة من 1م -9:30م",
        "id": 2,
        "languages": "",
        "name": "راما",
        "nationality": "سورية",
        "notes_admin": "",
        "notes_coord": "تستقبل اطفال من عمر 6 شهور فاعلى حسب الحالة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    990
                ]
            ],
            "1": [
                [
                    480,
                    990
                ]
            ],
            "2": [
                [
                    480,
                    990
                ]
            ],
            "3": [
                [
                    480,
                    990
                ]
            ],
            "4": [],
            "5": [
                [
                    780,
                    1290
                ]
            ],
            "6": [
                [
                    600,
                    1110
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "تنظيف - تبييض ليزر وقوالب - حشوات - عصب على حسب الحالة - خلع عادي - اطفال اكثر من 5 سنوات",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "3",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 8:00 ص الى 4:00 م - الجمعة من 1:00 م الى 9:00م",
        "id": 21,
        "languages": "",
        "name": "رانيا",
        "nationality": "سودانيه",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [
                [
                    480,
                    960
                ]
            ],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9ص-12م // من 4م-9:30م",
        "id": 123,
        "languages": "",
        "name": "رانيا",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1290
                ]
            ],
            "1": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1290
                ]
            ],
            "2": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1290
                ]
            ],
            "3": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1290
                ]
            ],
            "4": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1290
                ]
            ],
            "5": [],
            "6": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1290
                ]
            ]
        },
        "specialty": "باطنة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "الباطنه والصدرية جميع الحالات ,تخريم الأذن والأنف وأخرى ,الأطفال من فوق3س, العظام جميع الحالات ماعدا الجبيرة,الجراحة الجراحات والحروق البسيطة,مسالك التهاب المسالك و الحصوات,العيون التهابات بسيطة,أنف وأذن وحنجرة من غير تنظيف الأذن",
        "coverage": "",
        "dayoff": [
            6
        ],
        "dayoff_raw": "السبت",
        "experience": "4سنوات",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 4:30م -1ص || الجمعة  من 1م -9:30م||الخميس 25/06 من 8ص -4:30م",
        "id": 1,
        "languages": "",
        "name": "رزان",
        "nationality": "سودانيه",
        "notes_admin": "",
        "notes_coord": "تستقبل اطفال جميع الاعمار حسب الحالة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    990,
                    1500
                ]
            ],
            "1": [
                [
                    990,
                    1500
                ]
            ],
            "2": [
                [
                    990,
                    1500
                ]
            ],
            "3": [
                [
                    990,
                    1500
                ]
            ],
            "4": [
                [
                    990,
                    1500
                ]
            ],
            "5": [
                [
                    780,
                    1290
                ]
            ],
            "6": []
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "يتوفر العلاج عن طريق الابر الجافة لدى الاخصائية رهف // الكشف من قبل اخصائي العظام او الاخصائية رهف // سعر الجلسة 150 ريال",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9ص -5م",
        "id": 50,
        "languages": "",
        "name": "رهف",
        "nationality": "سعودية",
        "notes_admin": "",
        "notes_coord": "يتوفر العلاج عن طريق الابر الجافة لدى الاخصائية// الكشف من قبل اخصائي العظام اولا او عن طريق الاخصائية نسرين // سعر الجلسة 150 ريال (برجاء متابعة العروض)",
        "phone": "",
        "photo": "",
        "qualification": "علاج طبيعي",
        "rank": "علاج طبيعي",
        "schedule": {
            "0": [
                [
                    540,
                    1020
                ]
            ],
            "1": [
                [
                    540,
                    1020
                ]
            ],
            "2": [
                [
                    540,
                    1020
                ]
            ],
            "3": [
                [
                    540,
                    1020
                ]
            ],
            "4": [
                [
                    540,
                    1020
                ]
            ],
            "5": [],
            "6": [
                [
                    540,
                    1020
                ]
            ]
        },
        "specialty": "علاج طبيعي",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 2م -11م",
        "id": 51,
        "languages": "",
        "name": "روز",
        "nationality": "فلبينيه",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "علاج طبيعي",
        "rank": "علاج طبيعي",
        "schedule": {
            "0": [
                [
                    840,
                    1380
                ]
            ],
            "1": [
                [
                    840,
                    1380
                ]
            ],
            "2": [
                [
                    840,
                    1380
                ]
            ],
            "3": [
                [
                    840,
                    1380
                ]
            ],
            "4": [
                [
                    840,
                    1380
                ]
            ],
            "5": [],
            "6": [
                [
                    840,
                    1380
                ]
            ]
        },
        "specialty": "علاج طبيعي",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "",
        "id": 142,
        "languages": "",
        "name": "ريم",
        "nationality": "",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "فنية بشرة",
        "rank": "فنية بشرة",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 4:30م -1ص// الجمعة من 2م-10:30م",
        "id": 121,
        "languages": "",
        "name": "ريهام",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    990,
                    1500
                ]
            ],
            "1": [
                [
                    990,
                    1500
                ]
            ],
            "2": [
                [
                    990,
                    1500
                ]
            ],
            "3": [
                [
                    990,
                    1500
                ]
            ],
            "4": [],
            "5": [
                [
                    840,
                    1350
                ]
            ],
            "6": [
                [
                    990,
                    1500
                ]
            ]
        },
        "specialty": "أطفال",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "21 سنة",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 10ص إلى 12م || من 4م إلى 10م",
        "id": 110,
        "languages": "",
        "name": "ساره يحيى",
        "nationality": "يمنية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخاصئية",
        "rank": "اخاصئية",
        "schedule": {
            "0": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "نساء وولادة",
        "status": "leave"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "25 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 9,
        "languages": "",
        "name": "سامر الصمصام",
        "nationality": "سوري",
        "notes_admin": "",
        "notes_coord": "انهاء عقد",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "أنف وأذن وحنجرة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "الباطنه والصدرية جميع الحالات ,تخريم الأذن والأنف وأخرى ,الأطفال من فوق3س, العظام جميع الحالات ماعدا الجبيرة,الجراحة الجراحات والحروق البسيطة,مسالك التهاب المسالك و الحصوات,العيون التهابات بسيطة,أنف وأذن وحنجرة من غير تنظيف الأذن",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "ك",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 3:00م - 11:30م",
        "id": 114,
        "languages": "",
        "name": "سجاد",
        "nationality": "باكستاني",
        "notes_admin": "",
        "notes_coord": "يستقبل من عمر 3سنوات حسب الحالة — على رأس العمل",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    900,
                    1410
                ]
            ],
            "1": [
                [
                    900,
                    1410
                ]
            ],
            "2": [
                [
                    900,
                    1410
                ]
            ],
            "3": [
                [
                    900,
                    1410
                ]
            ],
            "4": [
                [
                    900,
                    1410
                ]
            ],
            "5": [],
            "6": [
                [
                    900,
                    1410
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "الباطنه و الصدرية جميع الحالات,العظام الحالات البسيطة,الجراحة الجراحات والحروق البسيطة,المسالك التهاب المسالك و الحصوات,الأطفال فوق3س,أنف و أذن وحنجرة منغير تنظيف الأذن,العيون التهابات بسيطة,التخريم الأنف و الأذن",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "3 سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8ص -4:30م",
        "id": 71,
        "languages": "",
        "name": "سجاد أحمد",
        "nationality": "باكستاني",
        "notes_admin": "",
        "notes_coord": "يستقبل اطفال جميع الاعمار حسب الحالة — زيارة تسويقية",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    990
                ]
            ],
            "1": [
                [
                    480,
                    990
                ]
            ],
            "2": [
                [
                    480,
                    990
                ]
            ],
            "3": [
                [
                    480,
                    990
                ]
            ],
            "4": [
                [
                    480,
                    990
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    990
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "10 سنوات",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12 ومن 4 م  الى 10 م",
        "id": 45,
        "languages": "",
        "name": "سحر",
        "nationality": "يمنية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "",
        "rank": "اخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "باطنة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "3",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "تاريخ المباشرة 23/05 من 4م الى 12 ص",
        "id": 133,
        "languages": "",
        "name": "سعد المخلفي",
        "nationality": "سعودي",
        "notes_admin": "",
        "notes_coord": "اجازة من 24/06 العودة 27/06",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "تنظيف - تبييض ليزر وقوالب - حشوات - عصب - الخلع العادي - الاطفال جميع الاعمار",
        "coverage": "",
        "dayoff": [
            6
        ],
        "dayoff_raw": "السبت",
        "experience": "3",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 8ص ل4م | الجمعة من 4م الى 12 ص",
        "id": 27,
        "languages": "",
        "name": "سلوى الحربي",
        "nationality": "سعوية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [
                [
                    480,
                    960
                ]
            ],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "19 سنة",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 47,
        "languages": "",
        "name": "سليمة لمغربي",
        "nationality": "جزائرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أنف أذن حنجرة",
        "rank": "أنف أذن حنجرة",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "أنف وأذن وحنجرة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "13 سنة",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 10:00 الى 12- ومن 4 الى 10 مساءً",
        "id": 19,
        "languages": "",
        "name": "سمر",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "إجازة من 1/7 والعودة 1/8",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي",
        "rank": "اخصائي",
        "schedule": {
            "0": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "9 سنه",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 10ص إلى 12م || من 4م إلى 10م",
        "id": 143,
        "languages": "",
        "name": "سميه",
        "nationality": "",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "نساء وولادة",
        "rank": "نساء وولادة",
        "schedule": {
            "0": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "نساء وولادة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "19",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 2م إلى 10م)",
        "id": 125,
        "languages": "",
        "name": "شاكيب",
        "nationality": "هندي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي تركيبات",
        "rank": "اخصائي تركيبات",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [
                [
                    840,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "جميع حالات الأطفال وجميع الأعمار",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "15 سنة",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 1:30 م حتى 10 م",
        "id": 31,
        "languages": "",
        "name": "شامنا",
        "nationality": "هنديه",
        "notes_admin": "",
        "notes_coord": "الغاز الضاحك غير متوفر",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي اطفال",
        "rank": "أخصائي اطفال",
        "schedule": {
            "0": [
                [
                    810,
                    1320
                ]
            ],
            "1": [
                [
                    810,
                    1320
                ]
            ],
            "2": [
                [
                    810,
                    1320
                ]
            ],
            "3": [
                [
                    810,
                    1320
                ]
            ],
            "4": [
                [
                    810,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    810,
                    1320
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "الباطنه والصدرية جميع الحالات ,تخريم يستقبل من عمر سنتين,الأطفال من غير حديثي الولادة,عظام جميع الحالات ماعدا الجبيرة,الجراحة الجراحات والحروق البسيطة,مسالك التهاب المسالك و الحصوات,العيون التهابات بسيطة,أنف وأذن وحنجرة من غير تنظيف الأذن",
        "coverage": "",
        "dayoff": [],
        "dayoff_raw": "بدون اوف لهذا الاسبوع",
        "experience": "",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8ص -4:30م // الجمعة من 1م -9:30م",
        "id": 115,
        "languages": "",
        "name": "شفيق",
        "nationality": "باكستاني",
        "notes_admin": "",
        "notes_coord": "يستقبل من عمر 2 سنه حسب الحالة — إجازة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    990
                ]
            ],
            "1": [
                [
                    480,
                    990
                ]
            ],
            "2": [
                [
                    480,
                    990
                ]
            ],
            "3": [
                [
                    480,
                    990
                ]
            ],
            "4": [
                [
                    480,
                    990
                ]
            ],
            "5": [
                [
                    780,
                    1290
                ]
            ],
            "6": [
                [
                    480,
                    990
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "تنظيف ،تبييض، تركيبات ، جميع الحشوات ، الاطفال من 5 سنوات تنظيف حشوات فلورايد | لديها شهادة امتياز تركيبات  / حالات الحمل : تستقبل حشوات وتنظيف",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "1",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 8:00ص إلى 4:00م",
        "id": 134,
        "languages": "",
        "name": "شهد الشمراني",
        "nationality": "سعودية",
        "notes_admin": "",
        "notes_coord": "اجازة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    960
                ]
            ],
            "1": [
                [
                    480,
                    960
                ]
            ],
            "2": [
                [
                    480,
                    960
                ]
            ],
            "3": [
                [
                    480,
                    960
                ]
            ],
            "4": [
                [
                    480,
                    960
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    960
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "leave"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "تستقبل تخريم انف و اذن جميع الاعمار",
        "coverage": "",
        "dayoff": [
            3
        ],
        "dayoff_raw": "الاربعاء",
        "experience": "3 سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4:30م -1ص ||الجمعة من 6:30م -3ص",
        "id": 3,
        "languages": "",
        "name": "شير",
        "nationality": "باكستاني",
        "notes_admin": "",
        "notes_coord": "يستقبل اطفال جميع الاعمار حسب الحالة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    990,
                    1500
                ]
            ],
            "1": [
                [
                    990,
                    1500
                ]
            ],
            "2": [
                [
                    990,
                    1500
                ]
            ],
            "3": [],
            "4": [
                [
                    990,
                    1500
                ]
            ],
            "5": [
                [
                    1110,
                    1620
                ]
            ],
            "6": [
                [
                    990,
                    1500
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 120,
        "languages": "",
        "name": "شيرين",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "منتدب للزرقاء",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "أطفال",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "تستقبل تخريم انف واذن مواليد",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "الجمعة من 3:30م -12ص  //من 6:30م -3ص",
        "id": 117,
        "languages": "",
        "name": "صابرين",
        "nationality": "سودانية",
        "notes_admin": "",
        "notes_coord": "تستقبل من عمر 2 سنه حسب الحالة — منتدب للشرق",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    1110,
                    180
                ]
            ],
            "1": [
                [
                    1110,
                    180
                ]
            ],
            "2": [
                [
                    1110,
                    180
                ]
            ],
            "3": [
                [
                    1110,
                    180
                ]
            ],
            "5": [
                [
                    930,
                    0
                ]
            ],
            "6": [
                [
                    1110,
                    180
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "تنظيف أسنان، جميع الحشوات ، الاطفال ، تبييض الأسنان منزلي والليزر ، توريد اللثة ، التركيبات، سحب عصب حالات الحمل: تنظيف حشوة مؤقتة -إجرائات اخرى بتقرير طبي",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "10سنوات",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 8ص-4م",
        "id": 76,
        "languages": "",
        "name": "صفية",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "منتدب للزرقاء",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    960
                ]
            ],
            "1": [
                [
                    480,
                    960
                ]
            ],
            "2": [
                [
                    480,
                    960
                ]
            ],
            "3": [
                [
                    480,
                    960
                ]
            ],
            "4": [
                [
                    480,
                    960
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    960
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "23 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "",
        "id": 84,
        "languages": "",
        "name": "عبد الكريم",
        "nationality": "سوري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي جراحة وزراعة اسنان",
        "rank": "اخصائي جراحة وزراعة اسنان",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "حاصل على تدريب سريري في اللثة وعلاجاتها",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "3 سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4 م الى 12 ص",
        "id": 81,
        "languages": "",
        "name": "عبد الله الحموض",
        "nationality": "سعودي",
        "notes_admin": "",
        "notes_coord": "اجازة من 28/06 العودة 11/07",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [
                [
                    960,
                    1440
                ]
            ],
            "1": [
                [
                    960,
                    1440
                ]
            ],
            "2": [
                [
                    960,
                    1440
                ]
            ],
            "3": [
                [
                    960,
                    1440
                ]
            ],
            "4": [
                [
                    960,
                    1440
                ]
            ],
            "5": [],
            "6": [
                [
                    960,
                    1440
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 4,
        "cases": "( حاصل على امتياز في علاج عصب )",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "1",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "8 ص إلى 4 م",
        "id": 103,
        "languages": "",
        "name": "عبد الله السلومي",
        "nationality": "سعودي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    960
                ]
            ],
            "1": [
                [
                    480,
                    960
                ]
            ],
            "2": [
                [
                    480,
                    960
                ]
            ],
            "3": [
                [
                    480,
                    960
                ]
            ],
            "4": [
                [
                    480,
                    960
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    960
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "الحشوات , الخلع العادي , الاطفال , يستقبل علاج العصب للأسنان السفلية كاملة والعلوية الأمامية , والتركيبات",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "5",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 20/06 من 4 م الى 12 ص",
        "id": 23,
        "languages": "",
        "name": "عبدالرحمن الرشيد",
        "nationality": "سعودي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "10",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 3 م الى 11",
        "id": 124,
        "languages": "",
        "name": "عبدالرحمن محمود",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي تقويم",
        "rank": "أخصائي تقويم",
        "schedule": {
            "0": [
                [
                    900,
                    1380
                ]
            ],
            "1": [
                [
                    900,
                    1380
                ]
            ],
            "2": [
                [
                    900,
                    1380
                ]
            ],
            "3": [
                [
                    900,
                    1380
                ]
            ],
            "4": [
                [
                    900,
                    1380
                ]
            ],
            "5": [],
            "6": [
                [
                    900,
                    1380
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "يستقبل تخريم من عمر سنتين",
        "coverage": "",
        "dayoff": [],
        "dayoff_raw": "",
        "experience": "",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 6:30م - 3ص || الجمعة من  2:30م -12ص",
        "id": 116,
        "languages": "",
        "name": "عبدالعزيز",
        "nationality": "يمني",
        "notes_admin": "",
        "notes_coord": "اجازة العودة 1/07// يستقبل من عمر سنتين حسب الحالة — منتدب للشمال",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    1110,
                    1620
                ]
            ],
            "1": [
                [
                    1110,
                    1620
                ]
            ],
            "2": [
                [
                    1110,
                    1620
                ]
            ],
            "3": [
                [
                    1110,
                    1620
                ]
            ],
            "4": [
                [
                    1110,
                    1620
                ]
            ],
            "5": [
                [
                    870,
                    1440
                ]
            ],
            "6": [
                [
                    1110,
                    1620
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "leave"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            0,
            1,
            6
        ],
        "dayoff_raw": "السبت|الاحد|الاثنين",
        "experience": "",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "تاريخ المباشرة 23/06 من 8 ص الى 4م الجمعة من 1م الى 9 م",
        "id": 132,
        "languages": "",
        "name": "عبدالعزيز الشتيوي",
        "nationality": "سعودي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "15 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 15,
        "languages": "",
        "name": "عبدالقادر خليل",
        "nationality": "سوداني",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "مقيم",
        "rank": "مقيم",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "عظام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9:00 الى 12- ومن 4 الى 10 مساءً",
        "id": 87,
        "languages": "",
        "name": "عبير",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائية جلدية",
        "rank": "اخصائية جلدية",
        "schedule": {
            "0": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    540,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 3م إلى 10 م",
        "id": 86,
        "languages": "",
        "name": "علا",
        "nationality": "يمنيه",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائية نساء",
        "rank": "اخصائية نساء",
        "schedule": {
            "0": [
                [
                    900,
                    1320
                ]
            ],
            "1": [
                [
                    900,
                    1320
                ]
            ],
            "2": [
                [
                    900,
                    1320
                ]
            ],
            "3": [
                [
                    900,
                    1320
                ]
            ],
            "4": [
                [
                    900,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    900,
                    1320
                ]
            ]
        },
        "specialty": "نساء وولادة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            4,
            5
        ],
        "dayoff_raw": "الجمعة + الخميس",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9 ص الى 5 م",
        "id": 41,
        "languages": "",
        "name": "غادة",
        "nationality": "سعودية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي",
        "rank": "اخصائي",
        "schedule": {
            "0": [
                [
                    540,
                    1020
                ]
            ],
            "1": [
                [
                    540,
                    1020
                ]
            ],
            "2": [
                [
                    540,
                    1020
                ]
            ],
            "3": [
                [
                    540,
                    1020
                ]
            ],
            "4": [],
            "5": [],
            "6": [
                [
                    540,
                    1020
                ]
            ]
        },
        "specialty": "علاج طبيعي",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "ملاحظة من الساعة9م ل 10م لا يتم تقديم غاز ضاحك للحالات",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "12",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "(من 2 م الى 10م)",
        "id": 127,
        "languages": "",
        "name": "غادة",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي أطفال",
        "rank": "أخصائي أطفال",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [
                [
                    840,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9 ص الى 5 م",
        "id": 39,
        "languages": "",
        "name": "فلورا",
        "nationality": "فلبينية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "فني",
        "rank": "فني",
        "schedule": {
            "0": [
                [
                    540,
                    1020
                ]
            ],
            "1": [
                [
                    540,
                    1020
                ]
            ],
            "2": [
                [
                    540,
                    1020
                ]
            ],
            "3": [
                [
                    540,
                    1020
                ]
            ],
            "4": [
                [
                    540,
                    1020
                ]
            ],
            "5": [],
            "6": [
                [
                    540,
                    1020
                ]
            ]
        },
        "specialty": "علاج طبيعي",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "2",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8ص-4م",
        "id": 79,
        "languages": "",
        "name": "فيصل السمحان",
        "nationality": "سعودي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    960
                ]
            ],
            "1": [
                [
                    480,
                    960
                ]
            ],
            "2": [
                [
                    480,
                    960
                ]
            ],
            "3": [
                [
                    480,
                    960
                ]
            ],
            "4": [
                [
                    480,
                    960
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    960
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "الاطفال من14 سنة / حالات الحمل : تسكين الالم فقط - لا يتم اجراء  اي علاج الا بتقرير طبي من طبيبة نساء",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "9",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4 م إلى 12ص",
        "id": 82,
        "languages": "",
        "name": "كارتيك",
        "nationality": "هندي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي عصب",
        "rank": "اخصائي عصب",
        "schedule": {
            "0": [
                [
                    960,
                    1440
                ]
            ],
            "1": [
                [
                    960,
                    1440
                ]
            ],
            "2": [
                [
                    960,
                    1440
                ]
            ],
            "3": [
                [
                    960,
                    1440
                ]
            ],
            "4": [
                [
                    960,
                    1440
                ]
            ],
            "5": [],
            "6": [
                [
                    960,
                    1440
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            6
        ],
        "dayoff_raw": "السبت",
        "experience": "13",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 4:00 الى 12:00 ص | الجمعة  1 م - 9 م",
        "id": 28,
        "languages": "",
        "name": "ماري لو",
        "nationality": "فلبينية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي تقويم أسنان",
        "rank": "أخصائي تقويم أسنان",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [
                [
                    960,
                    1440
                ]
            ],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "22 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 9:30ص -12م // من 4م -10م",
        "id": 74,
        "languages": "",
        "name": "محمد ابوالديار",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "منتدب للأفق",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "باطنة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "تنظيف ،تبييض باليزر،الحشوات ، علاج عصب      (حاصل على تدريب سريري في علاج العصب)",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "2",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8 ص الى 4 | الخميس من 4 م الى 12 ص",
        "id": 20,
        "languages": "",
        "name": "محمد المحيسن",
        "nationality": "سعودي",
        "notes_admin": "",
        "notes_coord": "اجازة من 20/06 العودة 23/06",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [
                [
                    480,
                    960
                ]
            ],
            "5": [],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "تنظيف الأسنان، علاج عصب ، الخلع الجراحي والغير جراحي ، تبييض الأسنان المنزلي والليزر ،الاطفال  ، تجميل اللثة  / حالات الحمل : لايستقبل",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "27 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8 ص الى 4م (الجمعة من 2:00م إلى 10:00ص)",
        "id": 78,
        "languages": "",
        "name": "محمد سعد",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [
                [
                    480,
                    960
                ]
            ],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "باطنة جميع الحالات  العظام الحالات البسيطة /عيون التهابات بسيطة/صدرية جميع الحالات/مسالك الحالات البسيطة/اذن انف حنجرة من غير تنظيف اذن",
        "coverage": "",
        "dayoff": [
            2,
            3
        ],
        "dayoff_raw": "الثلاثاء و الاربعاء",
        "experience": "4 سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4:30 م -1ص",
        "id": 43,
        "languages": "",
        "name": "محمد شازاد",
        "nationality": "باكستاني",
        "notes_admin": "",
        "notes_coord": "يستقبل اطفال جميع الاعمار حسب الحالة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    990,
                    1500
                ]
            ],
            "1": [
                [
                    990,
                    1500
                ]
            ],
            "2": [],
            "3": [],
            "4": [
                [
                    990,
                    1500
                ]
            ],
            "5": [
                [
                    990,
                    1500
                ]
            ],
            "6": [
                [
                    990,
                    1500
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "6",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "إنهاء عقد",
        "id": 25,
        "languages": "",
        "name": "محمد صلاح",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام (ماجسيتر زراعة)",
        "rank": "طبيب عام (ماجسيتر زراعة)",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "specialty": "أسنان",
        "status": "leave"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "",
        "coverage": "",
        "dayoff": [
            6
        ],
        "dayoff_raw": "السبت",
        "experience": "7 سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4:30م -1ص || الجمعة من 1م -9:30م",
        "id": 73,
        "languages": "",
        "name": "محمد عثمان",
        "nationality": "باكستاني",
        "notes_admin": "",
        "notes_coord": "يستقبل اطفال جميع الاعمار حسب الحالة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    990,
                    1500
                ]
            ],
            "1": [
                [
                    990,
                    1500
                ]
            ],
            "2": [
                [
                    990,
                    1500
                ]
            ],
            "3": [
                [
                    990,
                    1500
                ]
            ],
            "4": [
                [
                    990,
                    1500
                ]
            ],
            "5": [
                [
                    780,
                    1290
                ]
            ],
            "6": []
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "لا يستقبل تأمين",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "9",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 2م -10م",
        "id": 128,
        "languages": "",
        "name": "محمد فصيح",
        "nationality": "هندي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائي عصب",
        "rank": "اخصائي عصب",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [
                [
                    840,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "حالات الحمل : مايستقبل",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "9",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4 م -12 ص (الجمعة من 4م -12ص)",
        "id": 130,
        "languages": "",
        "name": "محمود السعيدي",
        "nationality": "يمني",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [
                [
                    960,
                    1440
                ]
            ],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "الباطنة والصدرية جميع الحالات,العظام جميع الحالات ماعدا الجبيرة,الجراحة الجراحات و الحروق البسيطة,المسالك التهاب المسالك و الحصوات ,الأطفال فوق 10س ,أنف وأذن وحنجرة من غير تنظيف الأذن,التخريم يستقبل, العيون لايستقبل.",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "3 سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 6:30م -3ص",
        "id": 5,
        "languages": "",
        "name": "محيي الدين",
        "nationality": "سوري",
        "notes_admin": "",
        "notes_coord": "يستقبل اطفال من عمر 6شهور فاعلى حسب الحالة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    1110,
                    1620
                ]
            ],
            "1": [
                [
                    1110,
                    1620
                ]
            ],
            "2": [
                [
                    1110,
                    1620
                ]
            ],
            "3": [
                [
                    1110,
                    1620
                ]
            ],
            "4": [
                [
                    1110,
                    1620
                ]
            ],
            "5": [],
            "6": [
                [
                    1110,
                    1620
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 2:00 م إلى 10:00 م",
        "id": 137,
        "languages": "",
        "name": "مروه الصاحي",
        "nationality": "",
        "notes_admin": "",
        "notes_coord": "اجازة من 14/2 حتى 18/2",
        "phone": "",
        "photo": "",
        "qualification": "جلدية",
        "rank": "جلدية",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [
                [
                    840,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "7 سنوات",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 2:30م إلى 10:30م",
        "id": 18,
        "languages": "",
        "name": "مروى السيد",
        "nationality": "مصريه",
        "notes_admin": "",
        "notes_coord": "ابتدأ من الجمعة 12\\6 ( من 3م - 11م) إجازة من 30/7 والعودة 4/9",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    870,
                    1350
                ]
            ],
            "1": [
                [
                    870,
                    1350
                ]
            ],
            "2": [
                [
                    870,
                    1350
                ]
            ],
            "3": [
                [
                    870,
                    1350
                ]
            ],
            "4": [],
            "5": [
                [
                    870,
                    1350
                ]
            ],
            "6": [
                [
                    870,
                    1350
                ]
            ]
        },
        "specialty": "نساء وولادة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "تنظيف ،تبييض ،علاج عصب ،تركيبات ,تجميل لثة ، الاطفال من 4 سنوات",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "5",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 4 م الى 12 ص",
        "id": 77,
        "languages": "",
        "name": "مريم الصغير",
        "nationality": "يمنيه",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    960,
                    1440
                ]
            ],
            "1": [
                [
                    960,
                    1440
                ]
            ],
            "2": [
                [
                    960,
                    1440
                ]
            ],
            "3": [
                [
                    960,
                    1440
                ]
            ],
            "4": [
                [
                    960,
                    1440
                ]
            ],
            "5": [],
            "6": [
                [
                    960,
                    1440
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "تنظيف أسنان،تبييض أسنان منزلي وبالليزر وعصب",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "18 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من  4:00 م إلى 11:30 م",
        "id": 22,
        "languages": "",
        "name": "مصطفى عبده",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [
                [
                    960,
                    1410
                ]
            ],
            "1": [
                [
                    960,
                    1410
                ]
            ],
            "2": [
                [
                    960,
                    1410
                ]
            ],
            "3": [
                [
                    960,
                    1410
                ]
            ],
            "4": [
                [
                    960,
                    1410
                ]
            ],
            "5": [],
            "6": [
                [
                    960,
                    1410
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "30سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 3:30 م إلى 12:00 ص",
        "id": 46,
        "languages": "",
        "name": "مصطفى محمد",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "صدرية",
        "rank": "صدرية",
        "schedule": {
            "0": [
                [
                    930,
                    1440
                ]
            ],
            "1": [
                [
                    930,
                    1440
                ]
            ],
            "2": [
                [
                    930,
                    1440
                ]
            ],
            "3": [
                [
                    930,
                    1440
                ]
            ],
            "4": [
                [
                    930,
                    1440
                ]
            ],
            "5": [],
            "6": [
                [
                    930,
                    1440
                ]
            ]
        },
        "specialty": "صدرية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            2,
            3,
            4,
            5
        ],
        "dayoff_raw": "الثلاثاء|الاربعاء|الخميس|الجمعة",
        "experience": "1",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "السبت والاحد والاثنين  من 8:00ص إلى 4:00م",
        "id": 135,
        "languages": "",
        "name": "معاذ الحميد",
        "nationality": "سعودي",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    960
                ]
            ],
            "1": [
                [
                    480,
                    960
                ]
            ],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": [
                [
                    480,
                    960
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "20 سنه",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 12,
        "languages": "",
        "name": "معتز",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "أطفال",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "28 سنة",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9:30 ص الى 12 م - ومن 4 الى 10 مساءً || الجمعة من2م -10م",
        "id": 6,
        "languages": "",
        "name": "منال الهادي",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [],
            "5": [
                [
                    840,
                    1320
                ]
            ],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "باطنة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "",
        "coverage": "",
        "dayoff": [
            3
        ],
        "dayoff_raw": "الاربعاء",
        "experience": "",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 3:30م -12ص / الجمعة من 3:30م -12ص",
        "id": 122,
        "languages": "",
        "name": "نديم",
        "nationality": "باكستاني",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    930,
                    1440
                ]
            ],
            "1": [
                [
                    930,
                    1440
                ]
            ],
            "2": [
                [
                    930,
                    1440
                ]
            ],
            "3": [],
            "4": [
                [
                    930,
                    1440
                ]
            ],
            "5": [
                [
                    930,
                    1440
                ]
            ],
            "6": [
                [
                    930,
                    1440
                ]
            ]
        },
        "specialty": "باطنة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "يتوفر العلاج عن طريق الابر الجافة لدى الاخصائية// الكشف من قبل اخصائي العظام اولا او عن طريق الاخصائية نسرين // سعر الجلسة 150 ريال",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 2م -10م",
        "id": 52,
        "languages": "",
        "name": "نسرين",
        "nationality": "سعودية",
        "notes_admin": "",
        "notes_coord": "يتوفر العلاج عن طريق الابر الجافة لدى الاخصائية// الكشف من قبل اخصائي العظام اولا او عن طريق الاخصائية نسرين // سعر الجلسة 150 ريال( برجاء متابعة العروض)",
        "phone": "",
        "photo": "",
        "qualification": "علاج طبيعي",
        "rank": "علاج طبيعي",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [
                [
                    840,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "علاج طبيعي",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "15 سنة",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 2:00 م إلى 10:00 م",
        "id": 56,
        "languages": "",
        "name": "نورا نظمي",
        "nationality": "الجمعة",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "جلدية",
        "rank": "جلدية",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [
                [
                    840,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 5,
        "cases": "تبييض،تنظيف ،علاج عصب، تركيبات ،خلع  الأطفال من 10 سنوات / حالات الحمل اجرائات بسيطة",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "5",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 8 ص الى 4 م",
        "id": 129,
        "languages": "",
        "name": "نورهان جمال",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    960
                ]
            ],
            "1": [
                [
                    480,
                    960
                ]
            ],
            "2": [
                [
                    480,
                    960
                ]
            ],
            "3": [
                [
                    480,
                    960
                ]
            ],
            "4": [
                [
                    480,
                    960
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    960
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "تستقبل تخريم جميع الاعمار - دون 10 اشهر بالكشف المسبق",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "7 سنوات",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 4:30م -1ص|| الجمعة من 4:30م -1ص",
        "id": 72,
        "languages": "",
        "name": "نيرة",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "تستقبل اطفال جميع الاعمار حسب الحالة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    990,
                    1500
                ]
            ],
            "1": [
                [
                    990,
                    1500
                ]
            ],
            "2": [
                [
                    990,
                    1500
                ]
            ],
            "3": [
                [
                    990,
                    1500
                ]
            ],
            "4": [],
            "5": [
                [
                    990,
                    1500
                ]
            ],
            "6": [
                [
                    990,
                    1500
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "تركيبات وعصب",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "15 سنة",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 4:30 م إلى 12:30 ص |  يوم الخميس من 8 ص الى 4 م",
        "id": 24,
        "languages": "",
        "name": "هارون",
        "nationality": "يمني",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "طبيب عام",
        "rank": "طبيب عام",
        "schedule": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [
                [
                    990,
                    1470
                ]
            ],
            "5": [],
            "6": []
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 3,
        "cases": "",
        "coverage": "",
        "dayoff": [
            4
        ],
        "dayoff_raw": "الخميس",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 2م الى 10م",
        "id": 88,
        "languages": "",
        "name": "هبة",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "اخصائية جلدية",
        "rank": "اخصائية جلدية",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [],
            "5": [
                [
                    840,
                    1320
                ]
            ],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "جلدية",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 2,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 10 ص  إلى 12 م || من 4م إلى 10م",
        "id": 54,
        "languages": "",
        "name": "هبه",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "نساء وولادة",
        "rank": "نساء وولادة",
        "schedule": {
            "0": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    600,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "نساء وولادة",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "11 سنوات",
        "gender": "أنثى",
        "home_visit": false,
        "hours_raw": "من 9:30 الى 12- ومن 4 الى 10 مساءً",
        "id": 13,
        "languages": "",
        "name": "هبه داوود",
        "nationality": "مصرية",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي",
        "rank": "أخصائي",
        "schedule": {
            "0": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "1": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "2": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "3": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "4": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    570,
                    720
                ],
                [
                    960,
                    1320
                ]
            ]
        },
        "specialty": "عيون",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "10",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 2 م الى 10 م",
        "id": 30,
        "languages": "",
        "name": "هيثم هشام",
        "nationality": "مصري",
        "notes_admin": "",
        "notes_coord": "",
        "phone": "",
        "photo": "",
        "qualification": "أخصائي تركيبات",
        "rank": "أخصائي تركيبات",
        "schedule": {
            "0": [
                [
                    840,
                    1320
                ]
            ],
            "1": [
                [
                    840,
                    1320
                ]
            ],
            "2": [
                [
                    840,
                    1320
                ]
            ],
            "3": [
                [
                    840,
                    1320
                ]
            ],
            "4": [
                [
                    840,
                    1320
                ]
            ],
            "5": [],
            "6": [
                [
                    840,
                    1320
                ]
            ]
        },
        "specialty": "أسنان",
        "status": "active"
    },
    {
        "archived": false,
        "branch_id": 1,
        "cases": "الباطنة والصدرية جميع الحالات,العظام جميع الحالات ماعدا الجبيرة,الجراحة الجراحات و الحروق البسيطة,المسالك التهاب المسالك و الحصوات ,الأطفال فوق سنتين ,أنف وأذن وحنجرة من غير تنظيف الأذن,التخريم يستقبل, العيون التهابات بسيطة.",
        "coverage": "",
        "dayoff": [
            5
        ],
        "dayoff_raw": "الجمعة",
        "experience": "3 سنوات",
        "gender": "غير محدد",
        "home_visit": false,
        "hours_raw": "من 8ص -4:30م/ الخميس25/06من 10ص -6:30م",
        "id": 4,
        "languages": "",
        "name": "وليد جابر",
        "nationality": "باكستاني",
        "notes_admin": "",
        "notes_coord": "يستقبل اطفال جميع الاعمار حسب الحالة",
        "phone": "",
        "photo": "",
        "qualification": "طب عام",
        "rank": "طب عام",
        "schedule": {
            "0": [
                [
                    480,
                    990
                ]
            ],
            "1": [
                [
                    480,
                    990
                ]
            ],
            "2": [
                [
                    480,
                    990
                ]
            ],
            "3": [
                [
                    480,
                    990
                ]
            ],
            "4": [
                [
                    480,
                    990
                ]
            ],
            "5": [],
            "6": [
                [
                    480,
                    990
                ]
            ]
        },
        "specialty": "طب عام",
        "status": "active"
    }
]

};
