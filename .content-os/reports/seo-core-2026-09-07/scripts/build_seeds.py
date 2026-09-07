# -*- coding: utf-8 -*-
"""Greek Invest — построение сидов для Semrush phrase_these.
Сетка: паттерн x гео x процесс x виза x жизнь x инвестиции x сравнения x проекты.
Выход: data/seeds_batches.json — батчи по 100 фраз (лимит phrase_these).
"""
import json, os, itertools

GEO_T1 = ["greece","crete","corfu","rhodes","mykonos","santorini","paros","naxos",
          "kefalonia","zakynthos","lefkada","kos","halkidiki","peloponnese",
          "thessaloniki","athens"]
GEO_T2 = ["milos","syros","tinos","antiparos","ithaca","skiathos","samos","chios",
          "lesvos","karpathos","symi","patmos","aegina","hydra","spetses","poros",
          "kythira","evia","pelion","epirus","cyclades","dodecanese",
          "ionian islands","sporades","athens riviera","skopelos","alonissos",
          "sifnos","serifos","folegandros","kythnos","kea","andros","amorgos"]
DISTRICTS = ["glyfada","voula","vouliagmeni","kifissia","piraeus","kolonaki",
             "kallithea","ellinikon","alimos","palaio faliro","marousi","varkiza",
             "lagonisi","anavyssos","elounda","chania","heraklion","agios nikolaos",
             "rethymno","kalamata","costa navarino","porto heli","nafplio","parga",
             "sivota","voulagmeni","nea makri","rafina","porto rafti","loutraki"]

# --- коммерческие паттерны ---
def commercial(geo, greece_anchor=True):
    g = geo
    suffix = "" if g == "greece" else " greece"
    out = [
        f"property for sale in {g}" + ("" if g=="greece" else suffix),
        f"{g} property investment",
        f"{g} real estate",
        f"houses for sale in {g}" + ("" if g=="greece" else suffix),
    ]
    return out

COUNTRY = [
 "property for sale in greece","greece property for sale","houses for sale in greece",
 "villas for sale in greece","apartments for sale in greece","greece real estate",
 "greek property","buy property in greece","greece property investment",
 "property in greece","greek islands property for sale","real estate greece",
 "property for sale greece","cheap property for sale in greece","greek property for sale",
 "homes for sale in greece","buying property in greece","greece property prices",
 "invest in greece property","greece property market","greek real estate",
 "seafront property for sale greece","beachfront property greece for sale",
 "greek island house for sale","property greece","greece houses for sale",
 "buy house in greece","greece villa for sale","land for sale in greece",
 "greece property investment 2026",
]

PROCESS = [
 "how to buy property in greece","buying property in greece as a foreigner",
 "can foreigners buy property in greece","buying a house in greece as a foreigner",
 "greece property purchase process","greece property buying process",
 "cost of buying property in greece","greece property transfer tax",
 "greece property taxes","enfia tax greece","enfia","greece property tax for foreigners",
 "greek property lawyer","lawyer for buying property in greece","greece notary fees property",
 "afm number greece","greece tax number for foreigners","greek bank account for foreigners",
 "greece property title deed check","greece land registry","greece cadastre",
 "power of attorney greece property","due diligence buying property greece",
 "greece property scams","greece capital gains tax property",
 "greece inheritance tax property","mortgage in greece for foreigners",
 "greece mortgage non resident","transferring money to greece for property",
 "greece property survey engineer","greece building permit check",
 "greece off plan property","greece new build vat","greece resale property",
 "greece property maintenance costs","greece property insurance",
 "hidden costs buying property in greece","greece property closing costs",
 "greece real estate agent fees",
]

VISA = [
 "greece golden visa","golden visa greece","greek golden visa","greece golden visa 2026",
 "greece golden visa requirements","greece golden visa cost","greece golden visa property",
 "greece residency by investment","greece golden visa 800000","greece golden visa 400000",
 "greece golden visa 250000","greece golden visa application","greece golden visa processing time",
 "greece golden visa family","greece golden visa renewal","greece golden visa citizenship",
 "greece permanent residency","greece residence permit for foreigners",
 "greece digital nomad visa","greece retirement visa","greece financially independent person visa",
 "greece fip visa","greece visa for us citizens","greece long stay visa",
 "greece citizenship by investment","greece citizenship requirements",
 "golden visa greece vs portugal","golden visa greece vs spain",
 "cheapest golden visa in europe","best golden visa europe",
]

LIFE = [
 "living in greece","moving to greece","retire in greece","retiring in greece as an expat",
 "cost of living in greece","cost of living in athens","cost of living in crete",
 "expat life in greece","international schools in athens","international schools greece",
 "healthcare in greece for expats","greece healthcare system for foreigners",
 "greece non dom tax regime","greece 7 percent pension tax","greece tax residency",
 "best places to live in greece","best greek island to live on",
 "moving to crete from uk","living in crete as an expat","living in athens as an expat",
 "greece vs portugal to live","is greece a good place to retire",
 "greece pensioner tax","working remotely from greece",
]

INVEST = [
 "rental yield greece","greece rental yields","athens rental yield",
 "airbnb greece","short term rental greece rules","greece short term rental license",
 "buy to let greece","greece rental income tax","greece rental income tax for non residents",
 "is greece property a good investment","greece property market forecast",
 "greece house prices","greece property price index","greece property market 2026",
 "best places to invest in greece property","greece real estate investment",
 "greece holiday home investment","return on investment greece property",
]

COMPARE = [
 "greece vs portugal property","greece vs spain property investment",
 "greece vs cyprus property","greece vs italy property","greece vs turkey property",
 "greece or portugal golden visa","cyprus vs greece golden visa",
 "greece vs croatia property","best country to buy property in europe",
 "cheapest country to buy property in europe",
]

PROJECTS = [
 "3s athens","ela antiparos","ela tinos","ela suites kastella","lotus voula",
 "artis 9 living","the grandline athens","evripidou piraeus","argyroupoli athens",
 "adonis group greece","greca developments","secland development","solena greece",
 "ellinikon project athens","the ellinikon riviera tower","costa navarino residences",
 "one and only kea island","amanzoe porto heli",
]

def build():
    seeds = []
    seeds += COUNTRY
    for g in GEO_T1[1:]:
        seeds += commercial(g)
    for g in GEO_T2:
        seeds += [f"property for sale in {g} greece", f"{g} property investment"]
    for g in DISTRICTS:
        seeds += [f"property for sale in {g} greece", f"{g} property investment"]
    seeds += PROCESS + VISA + LIFE + INVEST + COMPARE + PROJECTS
    # дедуп с сохранением порядка
    seen=set(); out=[]
    for s in seeds:
        s=" ".join(s.split()).lower()
        if s not in seen:
            seen.add(s); out.append(s)
    return out

if __name__=="__main__":
    seeds=build()
    batches=[seeds[i:i+100] for i in range(0,len(seeds),100)]
    os.makedirs("data",exist_ok=True)
    json.dump({"total":len(seeds),"batches":batches},open("data/seeds_batches.json","w"),ensure_ascii=False,indent=1)
    print("seeds:",len(seeds),"batches:",len(batches))
    for i,b in enumerate(batches): print(f"--- batch {i+1}: {len(b)}")
