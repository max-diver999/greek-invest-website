# -*- coding: utf-8 -*-
"""Ядро greek-invest: три фильтра + кластеризация по намерению + уровень гео.
v2 (7 сентября 2026, после добора Semrush на новом аккаунте).

Источники:
  data/semrush-volumes.csv            сетка паттерн x гео, us + uk
  data/semrush-fullsearch-uk.csv      discovery «greece property», uk
  data/semrush/fullsearch-*.csv       6 discovery-отчётов
  data/semrush/secondary-markets.csv  au, ca, il, de, ae

Фильтры, каждый со своей причиной отсева (см. data/rejected.csv):
  tourism        отпуск, отель, перелёт, экскурсия
  villa_holiday  словарь «villa» без покупки: аренда, holiday, hire, туроператоры
  named_resort   имя конкретного отеля или комплекса (Dana Villas, Porto Zante)
  rental_not_buy аренда без признака покупки
  greece_ny      город Greece в штате Нью-Йорк
  ancient        античная Греция, школьная программа
  celebrity      Джокович, Том Хэнкс и прочие
  viral_news     Антикитира «платят за переезд»
  no_anchor      нет якоря Греции
  homonym        Paros, Kos, Hydra и т.п. без якоря
  off_topic      есть Greece, но не про покупку, владение или переезд
"""
import csv, re, glob, collections, os, json

TOURISM = re.compile(r'\b(hotel|hotels|resort|resorts|weather|flight|flights|things to do|'
    r'nightlife|tour|tours|booking|restaurant|ferry|ferries|cruise|all inclusive|package|'
    r'airport|car hire|car rental|excursion|itinerary|vacation|travel|tourist|sightseeing|'
    r'where is|located|isle of|island of)\b')
# Правило проверено выдачей 07.09.2026 (data/serp-ambiguous.json):
# по «villas in greece», «greece villas», «villa in greece», «villas with pool greece»,
# «luxury villas greece» топ-8 держат TUI, James Villas, Airbnb, Booking, Simpson Travel,
# CV Villas, Oliver's Travels — это аренда на отпуск, не покупка.
# Покупательская выдача появляется только при явном токене покупки
# («villas for sale in greece»: rightmove, Savills, Zoopla, Hamptons).
VILLA = re.compile(r'\b(villa|villas)\b')
VILLA_BUY = re.compile(r'\b(for sale|to buy|buy|buying|purchase|price|prices|invest|'
    r'investment|sale|mortgage|own)\b')
NAMED_RESORT = re.compile(r'\b(dana villas?|porto zante|elounda gulf|daios cove|sentido|'
    r'port royal|villa mon repos|amanzoe|one and only|skouras|spitogatos)\b')
RENT = re.compile(r'\b(rent|rental|rentals|renting|to let|letting|airbnb|short term let)\b')
BUY  = re.compile(r'\b(buy|buying|sale|purchase|invest|investment|mortgage|own|ownership|'
    r'price|prices|cost|tax|taxes|deed|notary|freehold|golden visa|residency|citizenship|'
    r'residence|yield)\b')
# Курортные топонимы в форме «посёлок + регион + greece».
# Частота большая (elounda lasithi greece 3 600, parga epirus greece 3 600,
# lassi kefalonia greece 2 900), но CPC 1,0-1,9 EUR это ценник отпускного
# кластера, а не покупательского (у покупки 0,12-0,55). Проверено выдачей
# 07.09.2026 (data/serp-placenames.json): по семи запросам топ-8 держат
# Wikipedia, TripAdvisor, TUI, Jet2, greeka и тревел-блоги; aplaceinthesun
# ловит перелив на 4 и 8 месте всего в двух выдачах из семи.
RESORT_PLACE = re.compile(
    r'^(elounda|parga|lassi|skala|pefkos|faliraki|fiskardo|kefalos|kardamyli|naoussa|'
    r'laganas|kassiopi|lindos|oia|acharavi|troulos|sidari|rethymno|fira|argostoli|'
    r'kolymbia|kassandra|plaka|ornos|paleokastritsa|nidri|vasiliki|agios prokopios|'
    r'ermoupoli|kalamata|heraklion|sithonia|koukounaries|sivota|chania|agios nikolaos|'
    r'kardamena|nea moudania|costa navarino|voula|parikia|apollonia|anavyssos|loutraki|'
    r'chora|tsilivi|pelion)\s+\w+\s+greece$')

GREECE_NY = re.compile(r'\bgreece ny\b|\bgreece,? new york\b|greece ny\b')
ANCIENT   = re.compile(r'\bancient greece\b')
CELEB     = re.compile(r'\b(tom hanks|djokovic|kimberly guilfoyle|giannis|amanda and alan|novak)\b')
VIRAL     = re.compile(r'antikythera|get(ting)? paid to move|pays? you to move|pay to move|'
    r'move to greece for free|greece pays')

GREECE_ANCHOR = re.compile(r'\b(greece|greek|hellenic|athens|thessaloniki|crete|corfu|rhodes|'
    r'mykonos|santorini|paros|naxos|kefalonia|cephalonia|zakynthos|zante|lefkada|kos|halkidiki|'
    r'peloponnese|cyclades|dodecanese|ionian|sporades|skiathos|skopelos|milos|syros|tinos|'
    r'antiparos|ithaca|samos|chios|lesvos|karpathos|symi|patmos|aegina|hydra|spetses|poros|'
    r'kythira|evia|pelion|epirus|paxos|thassos|ikaria|sifnos|serifos|folegandros|kythnos|'
    r'andros|amorgos|glyfada|voula|vouliagmeni|kifissia|piraeus|kolonaki|kallithea|ellinikon|'
    r'alimos|marousi|varkiza|lagonisi|anavyssos|elounda|chania|heraklion|rethymno|kalamata|'
    r'navarino|porto heli|nafplio|parga|sivota|lindos|enfia|afm|loutraki|rafina|laganas|skala)\b')
HOMONYM = re.compile(r'\b(paros|kos|hydra|poros|milos|andros|symi|kea|ios|evia|patmos|skala)\b')

CLUSTERS = [
 ("visa",       re.compile(r'\b(golden visa|residency|residence by|residence permit|citizenship|'
                           r'passport|digital nomad|nomad visa|retirement visa|fip visa|'
                           r'financially independent|investor visa|visa|immigration|'
                           r'permanent residency|naturalis)')),
 ("news",       re.compile(r'\b(news|latest|update|changes|expansion|applications drop|'
                           r'applications decline|backlog|new rules|forecast|market news)\b')),
 ("money",      re.compile(r'\b(tax|taxes|enfia|vat|capital gains|inheritance|mortgage|loan|'
                           r'transfer money|non dom|pension tax|fee|fees|notary|stamp)\b')),
 ("legal",      re.compile(r'\b(lawyer|lawyers|solicitor|attorney|legal|due diligence|title deed|'
                           r'deed|cadastre|land registry|power of attorney|poa|scam|scams|'
                           r'pitfall|pitfalls|contract|survey|engineer|border zone|agent|agents|'
                           r'agency|agencies)\b')),
 ("life",       re.compile(r'\b(living|live|moving|move|relocat|retire|retiring|retirement|'
                           r'cost of living|living cost|living expenses|life cost|expat|expats|'
                           r'school|schools|healthcare|health insurance|best place|best places|'
                           r'working remotely|lgbt|pros and cons|bad things|disadvantages|'
                           r'advantages|standard of living)\b')),
 ("investment", re.compile(r'\b(yield|yields|roi|return|rental income|buy to let|investment|'
                           r'invest|investing|price index|house prices|good investment|'
                           r'market)\b')),
 ("choice",     re.compile(r'\b(vs|versus|compare|comparison|better|best country|cheapest country|'
                           r'which island|cheapest island|best island|cheapest golden visa|'
                           r'best golden visa)\b')),
 ("property",   re.compile(r'\b(for sale|to buy|buy|buying|purchase|property|properties|house|'
                           r'houses|home|homes|villa|villas|apartment|apartments|land|'
                           r'real estate|price|prices)\b')),
]

ISL = (r'crete|corfu|rhodes|mykonos|santorini|paros|naxos|kefalonia|cephalonia|zakynthos|zante|'
       r'lefkada|kos|halkidiki|peloponnese|cyclades|dodecanese|ionian|sporades|skiathos|skopelos|'
       r'milos|syros|tinos|antiparos|ithaca|samos|chios|lesvos|karpathos|symi|patmos|aegina|'
       r'hydra|spetses|poros|kythira|evia|pelion|epirus|paxos|thassos|ikaria|sifnos|serifos|'
       r'folegandros|kythnos|andros|amorgos|greek island|greek islands')
DIS = (r'glyfada|voula|vouliagmeni|kifissia|piraeus|kolonaki|kallithea|ellinikon|alimos|marousi|'
       r'varkiza|lagonisi|anavyssos|elounda|chania|heraklion|rethymno|kalamata|navarino|'
       r'porto heli|nafplio|parga|sivota|lindos|loutraki|rafina|palaio faliro|porto rafti|'
       r'laganas|skala')

def clean(s): return " ".join(s.lower().split())

def filters(q):
    if RESORT_PLACE.search(q):                  return False,"resort_placename"
    if GREECE_NY.search(q):                     return False,"greece_ny"
    if ANCIENT.search(q):                       return False,"ancient"
    if CELEB.search(q):                         return False,"celebrity"
    if VIRAL.search(q):                         return False,"viral_news"
    if NAMED_RESORT.search(q):                  return False,"named_resort"
    if VILLA.search(q) and not VILLA_BUY.search(q): return False,"villa_holiday"
    if TOURISM.search(q):                       return False,"tourism"
    if RENT.search(q) and not BUY.search(q):    return False,"rental_not_buy"
    if not GREECE_ANCHOR.search(q):             return False,"no_anchor"
    if HOMONYM.search(q) and not re.search(r'greece|greek',q): return False,"homonym"
    if not BUY.search(q) and not re.search(
        r'\b(living|moving|relocat|retire|expat|school|healthcare|cost of living|property|'
        r'real estate|house|houses|home|homes|villa|villas|apartment|land|news|lawyer|'
        r'agent|agency|visa|visas|passport|nomad|immigration|permit)\b', q):
                                                return False,"off_topic"
    return True,""

def cluster(q):
    for n,rx in CLUSTERS:
        if rx.search(q): return n
    return "other"

def geo_level(q):
    if re.search(DIS,q): return "district"
    if re.search(ISL,q): return "island_region"
    if re.search(r'\bathens|thessaloniki\b',q): return "city"
    return "country"

def load():
    rows=[]
    def add(path, db=None, delim=";"):
        with open(path) as f:
            for r in csv.DictReader(f, delimiter=delim):
                d = db or r.get("database","uk")
                if d.startswith("other"): continue
                rows.append({"q":clean(r["keyword"]),"vol":int(float(r["volume"] or 0)),
                             "cpc":float(r["cpc"] or 0),"db":d,"src":os.path.basename(path)})
    add("data/semrush-volumes.csv")
    add("data/semrush-fullsearch-uk.csv","uk")
    for p in sorted(glob.glob("data/semrush/fullsearch-*.csv")):
        add(p, "us" if "-us-" in p else "uk")
    add("data/semrush/placenames-uk.csv","uk")
    with open("data/semrush/secondary-markets.csv") as f:
        for r in csv.DictReader(f, delimiter=";"):
            if r["keyword"].startswith("other"): continue
            rows.append({"q":clean(r["keyword"]),"vol":int(r["volume"]),
                         "cpc":float(r["cpc"] or 0),"db":r["database"],"src":"secondary"})
    return rows

if __name__=="__main__":
    rows=load()
    best={}
    for r in rows:
        k=(r["q"],r["db"])
        if k not in best or r["vol"]>best[k]["vol"]: best[k]=r
    rows=list(best.values())
    kept,rej=[],[]
    for r in rows:
        ok,why=filters(r["q"])
        r["cluster"]=cluster(r["q"]); r["geo"]=geo_level(r["q"])
        (kept if ok else rej).append(dict(r,reason=why))
    F=["q","vol","cpc","db","src","cluster","geo","reason"]
    for name,data in (("core-classified",kept),("rejected",rej)):
        with open(f"data/{name}.csv","w",newline="") as f:
            w=csv.DictWriter(f,delimiter=";",fieldnames=F); w.writeheader()
            [w.writerow(x) for x in sorted(data,key=lambda y:-y["vol"])]

    tot=lambda rs: sum(r["vol"] for r in rs)
    print(f"измерено уникальных пар (фраза, база): {len(rows)}")
    print(f"прошли фильтры: {len(kept)} на {tot(kept):,} показов/мес")
    print(f"отсеяно: {len(rej)} на {tot(rej):,} показов/мес "
          f"({100*tot(rej)/(tot(kept)+tot(rej)):.0f}% сырого спроса)")
    print("\n=== ОТСЕВ ПО ПРИЧИНАМ ===")
    c=collections.Counter(); v=collections.Counter()
    for r in rej: c[r["reason"]]+=1; v[r["reason"]]+=r["vol"]
    for k,_ in v.most_common(): print(f"  {k:16s} фраз {c[k]:4d}  объём {v[k]:7,}")
    print("\n=== ЁМКОСТЬ ПО СТРАНАМ ПОКУПАТЕЛЯ ===")
    dbn={"uk":"Великобритания","us":"США","ca":"Канада","au":"Австралия",
         "il":"Израиль","de":"Германия","ae":"ОАЭ"}
    g=collections.Counter(); gn=collections.Counter()
    for r in kept: g[r["db"]]+=r["vol"]; gn[r["db"]]+=1
    T=sum(g.values())
    for k,val in g.most_common():
        print(f"  {dbn.get(k,k):16s} {val:7,} ({100*val/T:4.1f}%)  фраз {gn[k]}")
    print(f"  {'ИТОГО':16s} {T:7,}")
    print("\n=== УРОВЕНЬ ГЕОГРАФИИ ===")
    for db in ("uk","us"):
        gg=collections.Counter(); gc=collections.Counter()
        for r in kept:
            if r["db"]==db: gg[r["geo"]]+=r["vol"]; gc[r["geo"]]+=1
        t=sum(gg.values()) or 1
        print(f"  -- {dbn[db]} ({t:,})")
        for k,val in gg.most_common(): print(f"     {k:14s} {val:7,} ({100*val/t:4.1f}%) фраз {gc[k]}")
    print("\n=== КЛАСТЕРЫ (uk + us) ===")
    gg=collections.Counter(); gc=collections.Counter()
    for r in kept:
        if r["db"] in ("uk","us"): gg[r["cluster"]]+=r["vol"]; gc[r["cluster"]]+=1
    t=sum(gg.values())
    for k,val in gg.most_common():
        top=sorted([r for r in kept if r["db"] in ("uk","us") and r["cluster"]==k],
                   key=lambda x:-x["vol"])[:5]
        print(f"  {k:11s} {val:7,} ({100*val/t:4.1f}%) фраз {gc[k]:3d}")
        print("     " + " · ".join(f'{r["q"]} {r["vol"]}' for r in top))
    json.dump({"total":T,"kept":len(kept),"rejected":len(rej),
               "rejected_volume":tot(rej)}, open("data/capacity.json","w"))
