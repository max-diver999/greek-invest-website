# -*- coding: utf-8 -*-
"""Раскладывает измеренный спрос по целевым страницам новой архитектуры.
Каждая фраза из core-classified.csv назначается ровно одной странице,
поэтому суммы не задваиваются. Выход: data/page-demand.csv
"""
import csv, re, collections, json

# (url, заголовок, тип, правило). Порядок важен: первое совпадение выигрывает.
PAGES = [
 ("/golden-visa/news/","Greece Golden Visa News: Every Rule Change in 2026","news",
  re.compile(r'golden visa.*(news|changes|latest|expansion|drop|decline|backlog|new rules)')),
 ("/golden-visa/","Greece Golden Visa 2026: €250k, €400k and €800k Tiers Explained","hub",
  re.compile(r'golden visa|residency by investment|residence by investment|citizenship by investment|investor visa|golden.*visa')),
 ("/visas/digital-nomad/","Greece Digital Nomad Visa 2026: Income Rules, Tax and How to Apply","guide",
  re.compile(r'digital nomad|nomad visa')),
 ("/visas/retirement/","Greece Retirement Visa 2026: FIP Route, Income Proof and 7% Pension Tax","guide",
  re.compile(r'retirement visa|fip visa|financially independent|retire in greece|retiring in greece|good place to retire')),
 ("/visas/","Greece Visas for Non-EU Buyers: Every Route to Residency","hub",
  re.compile(r'\bvisa\b|permanent residency|residence permit|greece passport|passport of greece|citizenship')),
 ("/living-in-greece/cost-of-living/","Cost of Living in Greece 2026: Real Monthly Budgets by City","guide",
  re.compile(r'cost of living|living cost|living expenses|life cost|cost to live|expensive to live|cost.*live in greece')),
 ("/living-in-greece/moving/","Moving to Greece in 2026: Visas, Costs and the First 90 Days","guide",
  re.compile(r'\bmov(e|ing)\b|relocat')),
 ("/living-in-greece/","Living in Greece as a Foreigner: What the Guides Leave Out","hub",
  re.compile(r'living in|live in|expat|standard of living|pros and cons|bad things|disadvantages|advantages|lgbt|healthcare|school')),
 ("/property-news/","Greece Property Market News: Prices, Transactions and Policy","news",
  re.compile(r'real estate news|property news|market news|market analysis|price index|market forecast|house prices|property prices|prices of houses|average house price|property market')),
 ("/property-for-sale/corfu/","Property for Sale in Corfu, Greece: Houses, Villas and Land","catalog",
  re.compile(r'\bcorfu\b')),
 ("/property-for-sale/crete/","Property for Sale in Crete, Greece: Houses and Villas from €60,000","catalog",
  re.compile(r'\bcrete\b|chania|heraklion|rethymno|elounda|agios nikolaos')),
 ("/property-for-sale/kefalonia/","Property for Sale in Kefalonia, Greece: Houses and Villas","catalog",
  re.compile(r'kefalonia|cephalonia|skala')),
 ("/property-for-sale/zakynthos/","Property for Sale in Zakynthos (Zante), Greece: Houses and Villas","catalog",
  re.compile(r'zakynthos|zante|laganas')),
 ("/property-for-sale/skiathos/","Property for Sale in Skiathos, Greece: Sporades Houses and Villas","catalog",
  re.compile(r'skiathos|skopelos|alonissos')),
 ("/property-for-sale/rhodes/","Property for Sale in Rhodes, Greece: Island Houses and Villas","catalog",
  re.compile(r'\brhodes\b|lindos|symi|karpathos|\bkos\b|dodecanese|patmos')),
 ("/property-for-sale/lefkada/","Property for Sale in Lefkada and Paxos, Greece: Ionian Houses","catalog",
  re.compile(r'lefkada|paxos|ithaca|ionian|parga|sivota')),
 ("/property-for-sale/cyclades/","Property for Sale in the Cyclades: Paros, Naxos, Santorini, Mykonos","catalog",
  re.compile(r'paros|naxos|santorini|mykonos|milos|syros|tinos|antiparos|sifnos|serifos|folegandros|kythnos|andros|amorgos|cyclades')),
 ("/property-for-sale/peloponnese/","Property for Sale in the Peloponnese, Greece: Houses and Land","catalog",
  re.compile(r'peloponnese|kalamata|navarino|porto heli|nafplio|loutraki')),
 ("/property-for-sale/halkidiki/","Property for Sale in Halkidiki and Northern Greece","catalog",
  re.compile(r'halkidiki|thessaloniki|thassos|pelion|epirus|evia|solun')),
 ("/property-for-sale/athens/","Property for Sale in Athens, Greece: Apartments and Riviera Homes","catalog",
  re.compile(r'athens|glyfada|voula|vouliagmeni|kifissia|piraeus|kolonaki|kallithea|ellinikon|alimos|marousi|varkiza|lagonisi|anavyssos|palaio faliro|porto rafti|rafina|nea makri')),
 ("/property-for-sale/greek-islands/","Property for Sale on the Greek Islands: Every Island Compared","hub",
  re.compile(r'greek island|greece island|islands')),
 ("/property-for-sale/cheap/","Cheap Property for Sale in Greece: Homes Under €100,000","catalog",
  re.compile(r'cheap|under 50k|under 100k|budget|1 euro|abandoned|bargain')),
 ("/guides/buying-property-in-greece/","Buying Property in Greece as a Foreigner: The 2026 Process","guide",
  re.compile(r'how to buy|buying property|buying a house|buying a property|can foreigners|as a foreigner|purchase process|buying process|buying real estate|pitfall|scam|from uk|lawyer|solicitor|agent|agency|agencies|due diligence|deed|cadastre|land registry|power of attorney|notary')),
 ("/guides/cost-of-buying-property-in-greece/","What It Costs to Buy Property in Greece: Every Fee in 2026","guide",
  re.compile(r'cost of buying|hidden cost|closing cost|fees|transfer tax|\btax\b|taxes|enfia|vat|capital gains|inheritance|mortgage|loan')),
 ("/property-for-sale/","Property for Sale in Greece: Houses, Villas and Land","hub",
  re.compile(r'.')),   # всё остальное коммерческое
]

rows=[r for r in csv.DictReader(open("data/core-classified.csv"),delimiter=";")]
agg=collections.defaultdict(lambda: {"vol":0,"n":0,"top":[],"uk":0,"us":0})
unassigned=[]
for r in rows:
    q=r["q"]; v=int(r["vol"])
    for url,title,typ,rx in PAGES:
        if rx.search(q):
            a=agg[(url,title,typ)]
            a["vol"]+=v; a["n"]+=1; a["top"].append((v,q))
            if r["db"]=="uk": a["uk"]+=v
            if r["db"]=="us": a["us"]+=v
            break
    else: unassigned.append(r)

out=[]
for (url,title,typ),a in agg.items():
    a["top"].sort(reverse=True)
    out.append({"url":url,"title":title,"type":typ,"demand":a["vol"],"phrases":a["n"],
                "uk":a["uk"],"us":a["us"],
                "top":" · ".join(f"{q} ({v})" for v,q in a["top"][:4])})
out.sort(key=lambda x:-x["demand"])
with open("data/page-demand.csv","w",newline="") as f:
    w=csv.DictWriter(f,delimiter=";",fieldnames=["url","title","type","demand","phrases","uk","us","top"])
    w.writeheader(); [w.writerow(x) for x in out]

print(f'{"URL":42s} {"тип":8s} {"спрос":>7s} {"UK":>6s} {"US":>6s} фраз')
print("-"*95)
for x in out:
    print(f'{x["url"]:42s} {x["type"]:8s} {x["demand"]:7,} {x["uk"]:6,} {x["us"]:6,} {x["phrases"]:4d}')
print("-"*95)
print(f'{"ИТОГО":42s} {"":8s} {sum(x["demand"] for x in out):7,}  страниц {len(out)}')
print(f'\nне назначено: {len(unassigned)} фраз')
json.dump(out,open("data/new-pages.json","w"),ensure_ascii=False,indent=1)
