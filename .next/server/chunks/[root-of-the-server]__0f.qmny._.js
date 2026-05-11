module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},46786,(e,t,r)=>{t.exports=e.x("os",()=>require("os"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},4446,(e,t,r)=>{t.exports=e.x("net",()=>require("net"))},55004,(e,t,r)=>{t.exports=e.x("tls",()=>require("tls"))},54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},88947,(e,t,r)=>{t.exports=e.x("stream",()=>require("stream"))},60438,(e,t,r)=>{t.exports=e.x("perf_hooks",()=>require("perf_hooks"))},46255,(e,t,r)=>{t.exports={users:[{email:"admin@classsport.edu.co",password_hash:"$2b$10$IZSkofFZvfDjGAOafWmg3e.hIEfmf5quk5SW/hnYa6i37xqPrXjTm",role:"admin",name:"Administrador",is_active:!0}],blocks:[{name:"Bloque A",code:"A"},{name:"Bloque B",code:"B"},{name:"Bloque C",code:"C"}],slots:[{name:"07:00–09:00",start_time:"07:00",end_time:"09:00",order:1},{name:"09:00–11:00",start_time:"09:00",end_time:"11:00",order:2},{name:"11:00–13:00",start_time:"11:00",end_time:"13:00",order:3},{name:"14:00–16:00",start_time:"14:00",end_time:"16:00",order:4},{name:"16:00–18:00",start_time:"16:00",end_time:"18:00",order:5},{name:"18:00–20:00",start_time:"18:00",end_time:"20:00",order:6}],rooms:[{code:"A-101",block_code:"A",type:"salon",capacity:40,equipment:"Videobeam, tablero"},{code:"A-102",block_code:"A",type:"salon",capacity:35,equipment:"Tablero"},{code:"B-201",block_code:"B",type:"laboratorio",capacity:25,equipment:"Computadores, videobeam"},{code:"C-301",block_code:"C",type:"auditorio",capacity:120,equipment:"Videobeam, sonido, aire"}]}},56815,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),s=e.i(59756),o=e.i(61916),i=e.i(74677),n=e.i(69741),l=e.i(16795),d=e.i(87718),E=e.i(95169),u=e.i(47587),c=e.i(66012),p=e.i(70101),T=e.i(26937),m=e.i(10372),R=e.i(93695);e.i(52474);var N=e.i(220),A=e.i(89171),_=e.i(67652),I=e.i(46255);async function L(){try{for(let e of[`CREATE TABLE IF NOT EXISTS users (
        id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
        name                 VARCHAR(100) NOT NULL,
        email                VARCHAR(255) UNIQUE NOT NULL,
        password_hash        TEXT         NOT NULL,
        role                 VARCHAR(15)  NOT NULL
                             CHECK (role IN ('profesor', 'coordinador', 'admin')),
        is_active            BOOLEAN      DEFAULT true,
        must_change_password BOOLEAN      DEFAULT false,
        last_login_at        TIMESTAMPTZ,
        created_at           TIMESTAMPTZ  DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);
      
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL       PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ  DEFAULT NOW()
      );`,`CREATE TABLE IF NOT EXISTS blocks (
        id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
        name       VARCHAR(50)  NOT NULL,
        code       VARCHAR(5)   UNIQUE NOT NULL,
        is_active  BOOLEAN      DEFAULT true,
        created_at TIMESTAMPTZ  DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS slots (
        id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
        name        VARCHAR(20) NOT NULL,
        start_time  TIME        NOT NULL,
        end_time    TIME        NOT NULL,
        order_index INTEGER     NOT NULL,
        is_active   BOOLEAN     DEFAULT true,
        UNIQUE (start_time, end_time)
      );
      
      CREATE TABLE IF NOT EXISTS rooms (
        id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
        block_id    UUID         NOT NULL REFERENCES blocks(id),
        code        VARCHAR(20)  NOT NULL,
        type        VARCHAR(20)  NOT NULL DEFAULT 'salon'
                    CHECK (type IN ('salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro')),
        capacity    INTEGER      NOT NULL CHECK (capacity > 0),
        equipment   TEXT,
        is_active   BOOLEAN      DEFAULT true,
        created_at  TIMESTAMPTZ  DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  DEFAULT NOW(),
        UNIQUE (block_id, code)
      );
      
      CREATE INDEX IF NOT EXISTS idx_rooms_block  ON rooms(block_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);
      CREATE INDEX IF NOT EXISTS idx_blocks_code  ON blocks(code);
      CREATE INDEX IF NOT EXISTS idx_slots_order  ON slots(order_index);`,`CREATE TABLE IF NOT EXISTS reservations (
        id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
        room_id          UUID         NOT NULL REFERENCES rooms(id),
        slot_id          UUID         NOT NULL REFERENCES slots(id),
        professor_id     UUID         NOT NULL REFERENCES users(id),
        reservation_date DATE         NOT NULL,
        subject          VARCHAR(150) NOT NULL,
        group_name       VARCHAR(50)  NOT NULL,
        status           VARCHAR(15)  NOT NULL DEFAULT 'confirmada'
                         CHECK (status IN ('confirmada', 'cancelada')),
        cancellation_reason TEXT,
        cancelled_by     UUID         REFERENCES users(id),
        cancelled_at     TIMESTAMPTZ,
        created_by       UUID         REFERENCES users(id),
        created_at       TIMESTAMPTZ  DEFAULT NOW()
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_reservation
        ON reservations(room_id, slot_id, reservation_date)
        WHERE status = 'confirmada';
      
      CREATE INDEX IF NOT EXISTS idx_reservations_professor  ON reservations(professor_id, reservation_date DESC);
      CREATE INDEX IF NOT EXISTS idx_reservations_room_date  ON reservations(room_id, reservation_date);
      CREATE INDEX IF NOT EXISTS idx_reservations_date       ON reservations(reservation_date);
      CREATE INDEX IF NOT EXISTS idx_reservations_status     ON reservations(status);`,`ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
      ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
      ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY service_role_all_users ON users
        FOR ALL TO service_role USING (true) WITH CHECK (true);
      
      CREATE POLICY service_role_all_blocks ON blocks
        FOR ALL TO service_role USING (true) WITH CHECK (true);
      
      CREATE POLICY service_role_all_slots ON slots
        FOR ALL TO service_role USING (true) WITH CHECK (true);
      
      CREATE POLICY service_role_all_rooms ON rooms
        FOR ALL TO service_role USING (true) WITH CHECK (true);
      
      CREATE POLICY service_role_all_reservations ON reservations
        FOR ALL TO service_role USING (true) WITH CHECK (true);
      
      NOTIFY pgrst, 'reload schema';`])await (0,_.executeSql)(e);let e=(0,_.getSupabaseClient)();if(!e)throw Error("Supabase client not available after schema creation");if(I.default.users&&I.default.users.length>0){let{error:t}=await e.from("users").insert(I.default.users);if(t)throw Error(`Failed to insert users: ${t.message}`)}if(I.default.blocks&&I.default.blocks.length>0){let{error:t}=await e.from("blocks").insert(I.default.blocks);if(t)throw Error(`Failed to insert blocks: ${t.message}`)}if(I.default.slots&&I.default.slots.length>0){let t=I.default.slots.map(e=>({name:e.name,start_time:e.start_time,end_time:e.end_time,order_index:e.order||0})),{error:r}=await e.from("slots").insert(t);if(r)throw Error(`Failed to insert slots: ${r.message}`)}if(I.default.rooms&&I.default.rooms.length>0){let{data:t,error:r}=await e.from("blocks").select("id, code");if(r)throw Error(`Failed to fetch blocks: ${r.message}`);let a=new Map(t.map(e=>[e.code,e.id])),s=I.default.rooms.map(e=>({block_id:a.get(e.block_code),code:e.code,type:e.type,capacity:e.capacity,equipment:e.equipment})),{error:o}=await e.from("rooms").insert(s);if(o)throw Error(`Failed to insert rooms: ${o.message}`)}return A.NextResponse.json({success:!0,message:"Database initialized successfully",tables:{users:I.default.users?.length||0,blocks:I.default.blocks?.length||0,slots:I.default.slots?.length||0,rooms:I.default.rooms?.length||0}},{headers:{"Cache-Control":"no-store",Pragma:"no-cache",Expires:"0"}})}catch(e){return console.error("[bootstrap] Error:",e),A.NextResponse.json({success:!1,error:e instanceof Error?e.message:"Unknown error",details:e instanceof Error?e.stack:void 0},{status:500})}}e.s(["POST",0,L],73590);var O=e.i(73590);let C=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/system/bootstrap/route",pathname:"/api/system/bootstrap",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/system/bootstrap/route.ts",nextConfigOutput:"",userland:O,...{}}),{workAsyncStorage:f,workUnitAsyncStorage:v,serverHooks:U}=C;async function h(e,t,a){a.requestMeta&&(0,s.setRequestMeta)(e,a.requestMeta),C.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let A="/api/system/bootstrap/route";A=A.replace(/\/index$/,"")||"/";let _=await C.prepare(e,t,{srcPage:A,multiZoneDraftMode:!1});if(!_)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:I,deploymentId:L,params:O,nextConfig:f,parsedUrl:v,isDraftMode:U,prerenderManifest:h,routerServerContext:x,isOnDemandRevalidate:S,revalidateOnlyGenerated:b,resolvedPathname:g,clientReferenceManifest:y,serverActionsManifest:F}=_,w=(0,n.normalizeAppPath)(A),D=!!(h.dynamicRoutes[w]||h.routes[g]),k=async()=>((null==x?void 0:x.render404)?await x.render404(e,t,v,!1):t.end("This page could not be found"),null);if(D&&!U){let e=!!h.routes[g],t=h.dynamicRoutes[w];if(t&&!1===t.fallback&&!e){if(f.adapterPath)return await k();throw new R.NoFallbackError}}let P=null;!D||C.isDev||U||(P="/index"===(P=g)?"/":P);let q=!0===C.isDev||!D,H=D&&!q;F&&y&&(0,i.setManifestsSingleton)({page:A,clientReferenceManifest:y,serverActionsManifest:F});let M=e.method||"GET",X=(0,o.getTracer)(),B=X.getActiveScopeSpan(),Y=!!(null==x?void 0:x.isWrappedByNextServer),K=!!(0,s.getRequestMeta)(e,"minimalMode"),j=(0,s.getRequestMeta)(e,"incrementalCache")||await C.getIncrementalCache(e,f,h,K);null==j||j.resetRequestCache(),globalThis.__incrementalCache=j;let V={params:O,previewProps:h.preview,renderOpts:{experimental:{authInterrupts:!!f.experimental.authInterrupts},cacheComponents:!!f.cacheComponents,supportsDynamicResponse:q,incrementalCache:j,cacheLifeProfiles:f.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,s)=>C.onRequestError(e,t,a,s,x)},sharedContext:{buildId:I,deploymentId:L}},W=new l.NodeNextRequest(e),$=new l.NodeNextResponse(t),G=d.NextRequestAdapter.fromNodeNextRequest(W,(0,d.signalFromNodeResponse)(t));try{let s,i=async e=>C.handle(G,V).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=X.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==E.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${M} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),s&&s!==e&&(s.setAttribute("http.route",a),s.updateName(t))}else e.updateName(`${M} ${A}`)}),n=async s=>{var o,n;let l=async({previousCacheEntry:r})=>{try{if(!K&&S&&b&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await i(s);e.fetchMetrics=V.renderOpts.fetchMetrics;let n=V.renderOpts.pendingWaitUntil;n&&a.waitUntil&&(a.waitUntil(n),n=void 0);let l=V.renderOpts.collectedTags;if(!D)return await (0,c.sendResponse)(W,$,o,V.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(o.headers);l&&(t[m.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==V.renderOpts.collectedRevalidate&&!(V.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&V.renderOpts.collectedRevalidate,a=void 0===V.renderOpts.collectedExpire||V.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:V.renderOpts.collectedExpire;return{value:{kind:N.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await C.onRequestError(e,t,{routerKind:"App Router",routePath:A,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:S})},!1,x),t}},d=await C.handleResponse({req:e,nextConfig:f,cacheKey:P,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:h,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:b,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:K});if(!D)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==N.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(n=d.value)?void 0:n.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});K||t.setHeader("x-nextjs-cache",S?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),U&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);return K&&D||E.delete(m.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,T.getCacheControlHeader)(d.cacheControl)),await (0,c.sendResponse)(W,$,new Response(d.value.body,{headers:E,status:d.value.status||200})),null};Y&&B?await n(B):(s=X.getActiveScopeSpan(),await X.withPropagatedContext(e.headers,()=>X.trace(E.BaseServerSpan.handleRequest,{spanName:`${M} ${A}`,kind:o.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},n),void 0,!Y))}catch(t){if(t instanceof R.NoFallbackError||await C.onRequestError(e,t,{routerKind:"App Router",routePath:w,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:S})},!1,x),D)throw t;return await (0,c.sendResponse)(W,$,new Response(null,{status:500})),null}}e.s(["handler",0,h,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:v})},"routeModule",0,C,"serverHooks",0,U,"workAsyncStorage",0,f,"workUnitAsyncStorage",0,v],56815)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0f.qmny._.js.map