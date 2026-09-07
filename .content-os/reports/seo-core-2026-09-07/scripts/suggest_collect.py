# -*- coding: utf-8 -*-
"""Бесплатный discovery: Google Autocomplete по сидам x алфавит x вопросные модификаторы.
Компенсирует блок Semrush phrase_fullsearch, который не запустился (units = 0).
Пишет data/suggests.json. Стоимость: 0.
"""
import json, time, string, urllib.parse, urllib.request, sys, itertools

def sug(q, gl="uk"):
    u = "https://suggestqueries.google.com/complete/search?" + urllib.parse.urlencode(
        {"client":"firefox","hl":"en","gl":gl,"q":q})
    try:
        with urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=20) as r:
            return json.loads(r.read().decode("utf-8","replace"))[1]
    except Exception:
        return []

SEEDS = ["property for sale in greece","buying property in greece","greece golden visa",
         "moving to greece","living in greece","retire in greece","greek islands property",
         "buy house in greece","greece property tax","crete property","corfu property",
         "greece visa","greece residency","cost of living in greece","greece real estate",
         "invest in greece","greece rental","greece citizenship","athens property",
         "greece for expats","house in greece","greece mortgage"]
MODS = [""] + [" "+c for c in string.ascii_lowercase] + \
       [" how"," what"," can"," is"," best"," cheap"," near"," without"," vs"," for"]

if __name__=="__main__":
    seen={}; n=0
    for s in SEEDS:
        for m in MODS:
            for gl in ("uk","us"):
                for r in sug(s+m, gl):
                    r=r.lower().strip()
                    seen.setdefault(r,set()).add(gl)
                n+=1
            time.sleep(0.05)
        print(f"{s:35s} → total unique {len(seen)}", flush=True)
    out=[{"query":k,"markets":sorted(v)} for k,v in sorted(seen.items())]
    json.dump(out, open("data/suggests.json","w"), ensure_ascii=False, indent=1)
    print(f"\nrequests: {n} (free)  unique suggests: {len(out)}")
