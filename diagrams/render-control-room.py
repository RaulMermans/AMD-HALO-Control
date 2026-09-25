# Renders diagrams/control-room.svg and screenshots/control-room.png from examples/*.json (synthetic).
# Usage: pip install cairosvg && python3 diagrams/render-control-room.py
import json
T=json.load(open('examples/synthetic-telemetry.json'));M=json.load(open('examples/synthetic-models.json'))['models']
W_=json.load(open('examples/synthetic-workloads.json'))['workloads'];A=json.load(open('examples/synthetic-activity.json'))['events']
BG,GRID,SURF,PANEL,PANEL2,BORDER,ACT='#080d14','#0d1723','#0e1621','#121d2a','#172536','#233449','#3c82a5'
TP,TS,TM,ACC,ACCD,OK,WARN,ERR,DIS='#eef5f8','#a6b8c7','#718497','#68d7d2','#1b5964','#72dbad','#f1c66f','#f08387','#8493a3'
W,H=1440,940;o=[]
def t(x,y,s,sz=13,c=TP,w=400,a='start',mono=False):
    f="DejaVu Sans Mono, Menlo, monospace" if mono else "Inter, DejaVu Sans, Helvetica, Arial, sans-serif"
    s=str(s).replace('&','&amp;').replace('<','&lt;')
    o.append(f'<text x="{x}" y="{y}" font-size="{sz}" fill="{c}" font-weight="{w}" text-anchor="{a}" font-family="{f}">{s}</text>')
def r(x,y,w,h,f=PANEL,st=BORDER,rx=8): o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{f}" stroke="{st}"/>')
def chip(x,y,label,c):
    w=len(label)*7.7+30; o.append(f'<rect x="{x}" y="{y}" width="{w}" height="22" rx="11" fill="{c}" fill-opacity=".13" stroke="{c}" stroke-opacity=".45"/><circle cx="{x+11}" cy="{y+11}" r="3.5" fill="{c}"/>'); t(x+20,y+15,label,11,c,600); return w
def panel(x,y,w,h,title,sub=None):
    r(x,y,w,h); t(x+18,y+28,title.upper(),11,TM,700); 
    if sub: t(x+w-18,y+28,sub,11,TM,400,'end')
def spark(x,y,w,h,vals,c,mx):
    pts=' '.join(f'{x+i*w/(len(vals)-1):.1f},{y+h-h*v/mx:.1f}' for i,v in enumerate(vals))
    o.append(f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="2" stroke-linejoin="round"/>')
    o.append(f'<polygon points="{x},{y+h} {pts} {x+w},{y+h}" fill="{c}" opacity=".10"/>')
def bar(x,y,w,pct,c): r(x,y,w,6,BORDER,'none',3); r(x,y,w*pct/100,6,c,'none',3)
o.append(f'<rect width="{W}" height="{H}" fill="{BG}"/>')
for gx in range(0,W,40): o.append(f'<line x1="{gx}" y1="0" x2="{gx}" y2="{H}" stroke="{GRID}" stroke-width="1"/>')
for gy in range(0,H,40): o.append(f'<line x1="0" y1="{gy}" x2="{W}" y2="{gy}" stroke="{GRID}" stroke-width="1"/>')
# header
o.append(f'<circle cx="46" cy="44" r="13" fill="none" stroke="{ACC}" stroke-width="2.5"/><circle cx="46" cy="44" r="5" fill="{ACC}"/>')
t(70,40,'HALO Control',20,TP,700); t(70,58,'Control Room · local AI workstation',12,TS)
x=590
for lab,c in [('CORE HEALTHY',OK),('INFERENCE READY',OK),('ACTIVITY HEALTHY',OK),('COMPUTE PLANE CONNECTED',ACC)]: x+=chip(x,33,lab,c)+8
t(W-32,92,'SYNTHETIC DEMO STATE — not observed on real hardware',10,WARN,600,'end',True)
# tiles
tiles=[('CPU',f"{T['cpu']['utilizationPct']}%",f"{T['cpu']['logicalCores']} logical cores",T['cpu']['utilizationPct'],ACC),
('GPU',f"{T['gpu']['utilizationPct']}%",'accelerator utilization',T['gpu']['utilizationPct'],ACC),
('UNIFIED MEMORY',f"{T['memory']['usedGiB']:.0f} / {T['memory']['unifiedTotalGiB']} GiB",f"{T['memory']['gpuReservedGiB']} GiB reserved for GPU",T['memory']['usedGiB']/T['memory']['unifiedTotalGiB']*100,ACC),
('THERMAL',f"{T['thermal']['packageC']} °C",'package temperature',T['thermal']['packageC'],WARN),
('THROUGHPUT',f"{T['inference']['tokensPerSecond']} tok/s",f"active: {T['inference']['activeModel']}",None,OK),
('QUEUE',f"{T['inference']['queuedRequests']} queued",f"{T['inference']['inFlight']} in flight",None,OK)]
tw=(W-64-5*16)/6
for i,(k,v,s,p,c) in enumerate(tiles):
    x=32+i*(tw+16); r(x,108,tw,112); t(x+16,132,k,11,TM,700); t(x+16,168,v,24,TP,600); t(x+16,190,s,11,TS)
    if p is not None: bar(x+16,202,tw-32,p,c)
    else:
        vals=T['series']['tokensPerSecond'] if k=='THROUGHPUT' else [0,1,1,2,3,2,2,3,2,2,3,2]
        spark(x+16,196,tw-32,16,vals,c,max(vals) or 1)
# models panel
px,py,pw,ph=32,240,860,330; panel(px,py,pw,ph,'Model registry',f'{len(M)} registered · {sum(m["enabled"] for m in M)} enabled')
cols=[(18,'MODEL'),(330,'CAPABILITIES'),(510,'CONTEXT'),(600,'MEMORY'),(690,'STATUS')]
for dx,h in cols: t(px+dx,py+62,h,10,TM,700)
for i,m in enumerate(M):
    y=py+92+i*46; o.append(f'<line x1="{px+14}" y1="{y-20}" x2="{px+pw-14}" y2="{y-20}" stroke="{BORDER}"/>')
    t(px+18,y,m['displayName'],13,TP if m['enabled'] else DIS,600); t(px+18,y+17,f"{m['id']} · {m['quantization']} · {m['provider']}",10.5,TM,400,'start',True)
    cx=px+330
    for cap in m['capabilities']:
        w=len(cap)*7+16; o.append(f'<rect x="{cx}" y="{y-13}" width="{w}" height="19" rx="4" fill="{ACCD}" fill-opacity=".45" stroke="{ACCD}"/>'); t(cx+8,y+1,cap,11,ACC,600); cx+=w+6
    t(px+510,y,f"{m['contextWindowTokens']//1024}k",13,TS); t(px+600,y,f"~{m['resources']['approxMemoryGiB']:g} GiB",13,TS)
    sc={'loaded':OK,'available':ACC,'disabled':DIS}[m['availability']]; chip(px+700,y-14,m['availability'].upper(),sc)
# routing panel
rx0,ry,rw,rh=908,240,500,330; panel(rx0,ry,rw,rh,'Capability routing','deterministic policy')
routes=[('coding','coder-large'),('reasoning','generalist'),('general','generalist'),('vision','vision-small'),('embeddings','embedder')]
for i,(cap,mid) in enumerate(routes):
    y=ry+76+i*50; r(rx0+18,y-18,130,32,PANEL2,BORDER,6); t(rx0+83,y+3,cap,13,ACC,600,'middle')
    o.append(f'<line x1="{rx0+150}" y1="{y-2}" x2="{rx0+262}" y2="{y-2}" stroke="{ACT}" stroke-width="1.5" stroke-dasharray="4 4"/><polygon points="{rx0+262},{y-6} {rx0+270},{y-2} {rx0+262},{y+2}" fill="{ACT}"/>')
    r(rx0+274,y-18,206,32,PANEL2,BORDER,6); t(rx0+290,y+3,mid,13,TP,600,'start',True)
t(rx0+18,ry+rh-18,'No silent fallback: an unroutable capability is an explicit error.',11,TM)
# workloads
wx,wy,ww,wh=32,586,560,322; panel(wx,wy,ww,wh,'Workloads · application registry',f'{len(W_)} registered')
for i,w in enumerate(W_):
    y=wy+70+i*60; r(wx+18,y-22,ww-36,50,PANEL2,BORDER,6)
    t(wx+34,y,w['displayName'],14,TP,600); t(wx+34,y+18,w['kind']+' · '+', '.join(w['allowedCapabilities']),11,TM)
    sc={'active':OK,'queued':WARN,'idle':DIS}[w['state']]; chip(wx+ww-230,y-12,w['state'].upper(),sc)
    t(wx+ww-34,y+3,f"{w['requests24h']:,} req/24h",12,TS,400,'end')
# activity
ax,ay,aw,ah=608,586,800,322; panel(ax,ay,aw,ah,'Recent activity','metadata only · no prompts or outputs')
for dx,h in [(18,'TIME'),(100,'WORKLOAD'),(250,'CAPABILITY'),(380,'MODEL'),(530,'RESULT'),(700,'LATENCY')]: t(ax+dx,ay+62,h,10,TM,700)
for i,e in enumerate(A):
    y=ay+92+i*37; o.append(f'<line x1="{ax+14}" y1="{y-22}" x2="{ax+aw-14}" y2="{y-22}" stroke="{BORDER}"/>')
    t(ax+18,y,e['at'],12,TS,400,'start',True); t(ax+100,y,e['workload'],12,TP,600); t(ax+250,y,e['capability'],12,ACC)
    t(ax+380,y,e['model'] or '—',12,TS,400,'start',True)
    sc={'succeeded':OK,'queued':WARN,'denied':ERR}[e['status']]; chip(ax+530,y-15,e['status'].upper(),sc)
    t(ax+700,y,f"{e['latencyMs']:,} ms" if e['latencyMs'] is not None else '—',12,TS)
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'+''.join(o)+'</svg>'
open('diagrams/control-room.svg','w').write(svg)
import cairosvg; cairosvg.svg2png(bytestring=svg.encode(),write_to='screenshots/control-room.png',output_width=W*2//1.6 if False else W)
print('rendered')
