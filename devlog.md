# MixTrip Dev Log

## C.v1.ph3.bugfix [2025-04-09]

```devnote
#bugfix.redirect
-meta@index.html; ✓fix→infinite.redirect.loop
+commit→8d1f3e3; ✓issue→home.redir.loop
✓test→app.load.ok; +UI→no.loop.now
```

## C.v1.ph2 [2025-04-09]

```devnote
#usr.mdl
+crypto@User.js; ✓schema,hash,token-gen
#auth.rt
-tmpCtrl+realCtrl@auth.js; +valid.rgstd
#mdw.auth
✓chk->jwt,session,role; +csfP
#err.hdl
+ApiErr(msg,code,errs); ✓status->resp; +JWT/MDB-err.map
#API.end
+trip.js,loc.js->plhldr; +authC.getMe@user.rt
#tst
✓conn.MDB→ac-51p9euz.jzvgfrf

## Q.Ph2
[x]201:U.mdl [x]202:API [x]203:pw [x]204:RBAC
[]205:rgst.FE []206:valid []207:login.FE []208:JWT/sess
[]209:prof.FE []210:edit.prof []211:img.upld []212:sec.priv
[]213:eml.verif []214:pw.rst []215:antiattk []216:auto.lgout

## ToDo.nxt
1.prof.FE (209,210)→chk:users/prof.ejs
2.img.upld (211)→✓fileUpld
3.sec.priv (212)→UI.pref
4.eml+pw (213,214)→impl.send.eml
5.prot (215,216)→+CSRF,+RL.more

## PH3.prep
Trip+Loc.mdl→API→FE; prpr.map.intg
```

## C.v1.ph3 [2025-04-10]

```devnote
#120.assets
+comp@CSS:btn,form,alrt,mdl; ✓struct→/comp,/mdl,/pg
+JS.mod→auth,ui; ✓part→css/js-incl@views
+MVC→loc/search,loc/detail; +UI→map.intg

#loc.impl
+loc/detail.ejs; ✓pg.layout→map,info,crud
+loc/search.ejs; ✓srch.ui→box,fltr,map,rslt
+js/loc.js→edit,del,add2trip; ✓intg→maps.js

#trip.API
+getUserTripsJSON(); ✓route→/my-trips/list-json
+trip-loc.bind→add/rmv@API; ✓ctrl→2way.link

## Q.Ph3
[x]301:Trip.mdl [x]302:Loc.mdl [x]303:U-T-L.rel 
[x]304:API.end [x]305:create.FE [x]306:img.upld
[x]307:trip.edit/del [x]308:trip.list
[x]120:js/css.mgmt
[x]309:loc.add.manual

## ToDo.nxt
1.gmap.fix→API.key; +err.fallback→OSM
2.loc.test→crud.cycle; +UX→autocmp
3.trip.loc→drag.reorder; +UI.opt

## PH4.prep
Privacy+Sharing→API+FE; +trip.explore.enh
```

## C.v1.ph3.309 [2025-04-10]

```devnote
#309.manual.loc
+map.click→create.marker; ✓drag→update.coords
+form.val→name,coord.chk; +addr.fmt→autocmp
+css→location.css; ✓ui→success/err.msg
+err.hdl→form.valid; ✓exp→user.test
+mrkr.icn→grn.dot; ✓intg→maps.js@click.pos
+bounds.val→lat:±90°,lng:±180°; ✓init→BKK.dflt
+UI.ehc→load.ind+resp.style; +form→mtsk.sel
+addr.parse→fmt.addr.str; ✓CRUD→val.test
+flow.opt→err.recovery; +msg→anim.fade
+clean→btn.diab@proc; ✓XHR→hdrs.tkn
+git→push@4f0f1ca; ✓struct→MVC.pat
```

## 解読キー (AI専用)

このログは高度に圧縮されており、次の規則に従っています：
- `#`：セクション見出し
- `+`：追加された機能/コード
- `-`：削除された機能/コード
- `@`：ファイルパス/場所
- `✓`：検証済みまたは完了
- `→`：次のステップまたは関連事項
- `[]`：チケット (空=未完了、x=完了)
- 省略形：usr=user、mdl=model、rt=route、mdw=middleware、err=error、hdl=handler、FE=frontend、prpr=prepare、intg=integration