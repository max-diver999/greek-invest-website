# -*- coding: utf-8 -*-
"""Постраничный план greek-invest.com.
Действия: create / rewrite / merge_into / demote / keep.
Логика:
  - merge  = подтверждённая каннибализация (3+ страницы на один кластер спроса)
  - rewrite= страница есть, но нацелена на паттерн с нулевым спросом
  - demote = страница живая и кормит AI-ретрив, но инвестировать в неё больше нечего:
             убрать из основного графа ссылок, оставить в индексе
  - keep   = даёт клики или показы с человеческих запросов
Вход: data/page-plan-input (корпус), data/gsc-pages-90d.csv, data/core-classified.csv
"""
import csv, glob, os, re, collections, json

gsc={}
for r in csv.DictReader(open("data/gsc-pages-90d.csv"),delimiter=";"):
    gsc[r["page"].rstrip("/")+"/"]=(int(r["clicks"]),int(r["impressions"]),float(r["position"]))

SITE=os.path.join("..","..","..")
files=sorted(glob.glob(os.path.join(SITE,"src/content/*/*.mdx")))

# --- кластеры каннибализации: слаг → тема ---
TOPIC=[
 ("crete",      re.compile(r'crete|chania|heraklion|rethymno|elounda|agios-nikolaos')),
 ("athens",     re.compile(r'athens|glyfada|voula|vouliagmeni|kifissia|kallithea|piraeus|ellinikon|alimos|argyroupoli')),
 ("gv-tiers",   re.compile(r'golden-visa.*(250|350|400|450|800|tier|threshold|cheapest|budget)|tier-golden-visa')),
 ("gv-family",  re.compile(r'golden-visa.*(family|parents|dependent)')),
 ("gv-buyers",  re.compile(r'golden-visa-(us|uk|australian|canadian|french|german|indian|uae)-|israeli-buyers|turkish-buyers|brexit-uk-buyers')),
 ("gv-process", re.compile(r'golden-visa.*(timeline|application|renewal|processing|circular|mistakes)')),
 ("tax",        re.compile(r'enfia|transfer-tax|capital-gains|inheritance-tax|objective-value|vat|tax-changes|rental-income-tax|non-dom|pension-tax')),
 ("diligence",  re.compile(r'due-diligence|cadastre|engineer|notary|deed|power-of-attorney|scam|snagging|border-zone|permit')),
 ("cost",       re.compile(r'hidden-costs|cost-of-buying|closing-cost|lawyer-cost|price-index')),
 ("yield",      re.compile(r'yield|buy-to-let|rental|short-term-rental|good-investment|market-forecast|transactions')),
 ("islands",    re.compile(r'corfu|rhodes|mykonos|santorini|paros|antiparos|naxos|kefalonia|zakynthos|lefkada|kos|halkidiki|cyclades|peloponnese|nafplio|kalamata|navarino|thessaloniki')),
 ("howto",      re.compile(r'how-to-buy|buying-process|step-by-step|making-offer|remotely|off-plan|resale|foreigner')),
 ("life",       re.compile(r'living|cost-of-living|retire|moving|expat|school|healthcare|7-percent')),
]
def topic(slug):
    for n,rx in TOPIC:
        if rx.search(slug): return n
    return "other"

rows=[]
for p in files:
    coll=p.split(os.sep)[-2]; slug=os.path.basename(p)[:-4]
    url=f"/{coll}/{slug}/"
    c,i,pos=gsc.get(url,(0,0,0))
    rows.append({"url":url,"coll":coll,"slug":slug,"clicks":c,"imp":i,"pos":pos,"topic":topic(slug)})

cnt=collections.Counter(r["topic"] for r in rows)
# Каннибализация засчитывается только при ДОКАЗАННОМ пересечении:
# в теме 4+ страниц И минимум 2 из них реально показываются (>=10 показов).
# Иначе ноль показов объясняется возрастом сайта (11 недель), а не дублями.
shown=collections.Counter()
for r in rows:
    if r["imp"]>=10: shown[r["topic"]]+=1
CANNIBAL={t for t,n in cnt.items() if n>=4 and shown[t]>=2 and t!="other"}
# группа страниц по национальности покупателя: искусственное дробление,
# 10 страниц с 1-4 показами каждая — склеиваем независимо от порога показов
CANNIBAL.add("gv-buyers")

# целевые страницы склейки
MERGE_TARGET={
 "crete":"/property-for-sale/crete/","athens":"/property-for-sale/athens/",
 "islands":"/property-for-sale/","gv-tiers":"/golden-visa/",
 "gv-buyers":"/golden-visa/who-can-apply/","gv-process":"/golden-visa/",
 "tax":"/guides/greece-property-taxes/","diligence":"/guides/buying-property-in-greece/",
 "cost":"/guides/cost-of-buying-property-in-greece/","yield":"/guides/greece-rental-yield-guide/",
 "howto":"/guides/buying-property-in-greece/","life":"/living-in-greece/",
}
# страницы, которые остаются владельцем темы (лучший показатель в своей теме)
best={}
for r in rows:
    t=r["topic"]
    if t not in best or (r["clicks"],r["imp"])>(best[t]["clicks"],best[t]["imp"]): best[t]=r

def decide(r):
    s,coll,i,c,t=r["slug"],r["coll"],r["imp"],r["clicks"],r["topic"]
    if coll in ("projects","developers"):
        return "demote","навигационный слой, спрос по именам проектов 10-20/мес"
    if coll=="news": return "keep","свежесть для AI-ретрива"
    if coll=="areas":
        return "rewrite",f'слаг {{city}}-property-investment = 0 запросов, перенацелить на "property for sale in X greece"'
    if coll=="compare":
        keep={"greece-vs-portugal-golden-visa-property","greece-vs-cyprus-golden-visa-property",
              "greece-vs-spain-golden-visa-ended","golden-visa-greece-vs-dubai-property-residency"}
        return ("keep","сравнение внутри visa-кластера, спрос подтверждён") if s in keep \
               else ("merge","/compare/golden-visa-country-comparison/")
    if t in CANNIBAL and best.get(t) is not r and (c==0 and i<50):
        return "merge",MERGE_TARGET.get(t,"/guides/")
    if c>0 or i>=50: return "keep","есть клики или живые показы"
    return "demote","0 кликов и <50 показов за 90 дней; оставить для AI-ретрива, вывести из основного графа ссылок"

for r in rows:
    a,why=decide(r); r["action"]=a; r["note"]=why

NEW=json.load(open("data/publication-order.csv".replace(".csv",".json"))) if False else [
  {"url":r["url"],"demand":int(r["demand"]),"wave":int(r["wave"])}
  for r in csv.DictReader(open("data/publication-order.csv"),delimiter=";")]
with open("data/page-plan.csv","w",newline="") as f:
    w=csv.DictWriter(f,delimiter=";",fieldnames=["url","coll","slug","topic","clicks","imp","pos","action","note"])
    w.writeheader(); [w.writerow(r) for r in rows]

print(f"MDX в корпусе: {len(rows)}")
print("\n=== ТЕМЫ С КАННИБАЛИЗАЦИЕЙ (4+ страницы на один кластер) ===")
for t in sorted(CANNIBAL,key=lambda x:-cnt[x]):
    print(f'  {t:11s} {cnt[t]:3d} страниц | владелец: {best[t]["url"]} (кликов {best[t]["clicks"]}, показов {best[t]["imp"]})')
print("\n=== ДЕЙСТВИЯ ===")
for k,v in collections.Counter(r["action"] for r in rows).most_common(): print(f"  {k:8s} {v:3d}")
print("\n=== ПО КОЛЛЕКЦИЯМ ===")
m=collections.defaultdict(collections.Counter)
for r in rows: m[r["coll"]][r["action"]]+=1
for k in sorted(m): print(f'  {k:11s} '+"  ".join(f"{a}:{n}" for a,n in sorted(m[k].items())))
print(f"\n=== НОВЫЕ/ПЕРЕПИСАННЫЕ ЦЕЛЕВЫЕ: {len(NEW)} страниц, спрос {sum(x['demand'] for x in NEW):,}/мес ===")
w=collections.Counter(); d=collections.Counter()
for x in NEW: w[x["wave"]]+=1; d[x["wave"]]+=x["demand"]
for k in sorted(w): print(f"  волна {k}: {w[k]} страниц, {d[k]:,}/мес")
# /golden-visa/ уже существует как страница Astro, в корпусе MDX её нет,
# поэтому в целевом списке она числится как новая. Для плана это rewrite.
EXISTING_TARGETS = {"/golden-visa/"}
create  = sum(1 for x in NEW if x["url"] not in EXISTING_TARGETS)
rewrite = sum(1 for r in rows if r["action"]=="rewrite") + len(EXISTING_TARGETS)
print(f"\nИТОГО план: create {create} | rewrite {rewrite} | "
      f"merge {sum(1 for r in rows if r['action']=='merge')} | "
      f"demote {sum(1 for r in rows if r['action']=='demote')} | "
      f"keep {sum(1 for r in rows if r['action']=='keep')}")
print(f"  (из {len(NEW)} целевых страниц одна, /golden-visa/, уже существует)")
