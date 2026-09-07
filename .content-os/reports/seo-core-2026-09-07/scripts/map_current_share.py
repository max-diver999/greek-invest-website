# -*- coding: utf-8 -*-
"""Классифицирует реальные запросы GSC тем же классификатором, что и ядро,
и считает нашу долю по кластерам. Плюс детектор нечеловеческого трафика.
"""
import csv, re, collections, sys
sys.path.insert(0,"scripts")
from classify_core import cluster, geo_level, filters, clean

rows=[]
with open("data/gsc-queries-90d.csv") as f:
    for r in csv.DictReader(f,delimiter=";"):
        q=clean(r["query"])
        rows.append({"q":q,"imp":int(r["impressions"]),"clicks":int(r["clicks"]),
                     "pos":float(r["position"]),"cluster":cluster(q),"geo":geo_level(q)})

# детектор нечеловеческих запросов: 8+ слов + маркеры источника/официальности
BOT=re.compile(r'\b(official|global property guide|aade|2026 official|micro-market analysis)\b')
def bot(r): return len(r["q"].split())>=8 or bool(BOT.search(r["q"]))
b=[r for r in rows if bot(r)]; h=[r for r in rows if not bot(r)]
print(f"GSC видимых запросов: {len(rows)} | показов {sum(r['imp'] for r in rows)} | кликов {sum(r['clicks'] for r in rows)}")
print(f"  машинно-выглядящие: {len(b)} запросов, {sum(r['imp'] for r in b)} показов, {sum(r['clicks'] for r in b)} кликов")
print(f"  человеко-выглядящие: {len(h)} запросов, {sum(r['imp'] for r in h)} показов, {sum(r['clicks'] for r in h)} кликов")

print("\n=== ЧТО ЛОВИМ, ПО КЛАСТЕРАМ (видимая часть GSC) ===")
g=collections.Counter(); gn=collections.Counter(); gc=collections.Counter(); gp=collections.defaultdict(list)
for r in rows:
    g[r["cluster"]]+=r["imp"]; gn[r["cluster"]]+=1; gc[r["cluster"]]+=r["clicks"]; gp[r["cluster"]].append(r["pos"])
# ёмкость рынка по кластерам (UK+US), из ядра
cap=collections.Counter()
with open("data/core-classified.csv") as f:
    for r in csv.DictReader(f,delimiter=";"): cap[r["cluster"]]+=int(r["vol"])
print(f'{"кластер":12s} {"ёмкость, все рынки":>14s} {"наши показы":>12s} {"доля":>7s} {"клики":>6s} {"ср.поз":>7s}  вердикт')
for k in sorted(set(list(cap)+list(g)), key=lambda x:-cap[x]):
    imp=g[k]; c=cap[k]; share=f"{100*imp/c:.2f}%" if c else "-"
    pos=sum(gp[k])/len(gp[k]) if gp[k] else 0
    if c and imp==0: v="НЕ ЛОВИМ"
    elif imp and gc[k]==0: v="показы без кликов"
    elif c and 100*imp/c<1: v="ловим меньше 1%"
    else: v="работает частично"
    print(f'{k:12s} {c:14,} {imp:12d} {share:>7s} {gc[k]:6d} {pos:7.1f}  {v}')
