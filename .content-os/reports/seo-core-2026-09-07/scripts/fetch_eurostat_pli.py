# -*- coding: utf-8 -*-
"""Индексы уровня цен Eurostat (EU27 = 100) по Греции.
Официальный источник для страницы cost-of-living: датасет prc_ppp_ind,
показатель PLI_EU27_2020. Всё, что попадёт на сайт, регистрируется в facts.json
с датой публикации Eurostat.
"""
import json, urllib.request, urllib.parse, sys

BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_ppp_ind"
CATS = {
 "A01":     "Household final consumption expenditure",
 "A010101": "Food and non-alcoholic beverages",
 "A010102": "Alcoholic beverages and tobacco",
 "A010104": "Housing, water, electricity, gas and other fuels",
 "A010107": "Transport",
 "A010111": "Restaurants and hotels",
}
def get(cat):
    q = urllib.parse.urlencode([("format","JSON"),("na_item","PLI_EU27_2020"),
        ("ppp_cat",cat),("geo","EL"),("lang","en")])
    with urllib.request.urlopen(f"{BASE}?{q}", timeout=60) as r:
        d = json.loads(r.read().decode())
    years = d["dimension"]["time"]["category"]["index"]
    inv = {v:k for k,v in years.items()}
    vals = {inv[int(i)]: v for i,v in d["value"].items() if int(i) in inv}
    return d.get("updated"), vals

out={}
for cat,label in CATS.items():
    try:
        upd, vals = get(cat)
        last = sorted(vals)[-1]
        out[cat] = {"label":label,"updated":upd,"latest_year":last,
                    "latest_value":vals[last],"series":vals}
        print(f"{label:52s} {last}: {vals[last]}  (EU27 = 100)")
    except Exception as e:
        print(f"{label:52s} ОШИБКА {e}")
json.dump(out, open("data/sources/eurostat-price-levels-greece.json","w"), indent=1)
print("\nсохранено: data/sources/eurostat-price-levels-greece.json")
