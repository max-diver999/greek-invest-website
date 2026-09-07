# -*- coding: utf-8 -*-
"""Волны публикации. Порядок задаёт не объём, а выигрываемость выдачи:
сначала кластеры, где порталов нет вообще, потом слабые островные выдачи,
и только потом портально запертая голова. Источник оценки — data/serp.json
и data/serp-ambiguous.json (110 срезов Google по UK, US, AU).
"""
import csv, json, collections

# кто держит топ-10 целевого запроса → насколько реально войти контентом
WINNABILITY = {
 "/golden-visa/":            ("open",  "advisory + gov, порталов нет: henley, getgoldenvisa, immigrantinvest, migration.gov.gr"),
 "/golden-visa/news/":       ("open",  "getgoldenvisa держит один страницей; медиа и advisory, порталов нет"),
 "/visas/retirement/":       ("open",  "advisory + форумы, порталов нет"),
 "/visas/digital-nomad/":    ("open",  "advisory + gov, порталов нет"),
 "/visas/":                  ("trap",  "gov-сайты держат 4-5 из 10: mfa.gr, travel.state.gov, gov.uk"),
 "/living-in-greece/cost-of-living/": ("open","numbeo, internationalliving, wise + 3 из 9 форумы и YouTube"),
 "/living-in-greece/moving/":("open",  "reddit, facebook, youtube держат 3 из 9; gov.uk первый"),
 "/living-in-greece/":       ("open",  "форумы и advisory, порталов нет"),
 "/property-news/":          ("open",  "ekathimerini, globalpropertyguide, локальные агентства; портального замка нет"),
 "/property-for-sale/kefalonia/": ("open","четыре крошечных локальных агентства в топе"),
 "/property-for-sale/skiathos/": ("open","один сайт-одностраничник на первом месте, facebook на шестом"),
 "/property-for-sale/cheap/":("open",  "holprop, makoo, facebook, youtube; редакционного ответа нет"),
 "/property-for-sale/zakynthos/": ("mixed","порталы + greekexclusiveproperties"),
 "/property-for-sale/lefkada/": ("mixed","порталы + greekexclusiveproperties на 2 месте"),
 "/property-for-sale/rhodes/": ("mixed","rightmove, spitogatos, facebook, engelvoelkers"),
 "/property-for-sale/cyclades/": ("mixed","порталы + локальные санторинские сайты"),
 "/property-for-sale/peloponnese/": ("mixed","порталы, слабая конкуренция"),
 "/property-for-sale/halkidiki/": ("mixed","порталы, слабая конкуренция"),
 "/property-for-sale/greek-islands/": ("mixed","greekexclusiveproperties на 2 месте, rightmove на 1"),
 "/property-for-sale/athens/": ("mixed","порталы + греческие агентства"),
 "/property-for-sale/corfu/":("locked","rightmove, aplaceinthesun, zoopla, spitogatos + локальные"),
 "/property-for-sale/crete/":("locked","rightmove, aplaceinthesun, spitogatos + критские агентства"),
 "/property-for-sale/":      ("locked","rightmove, aplaceinthesun, spitogatos, zoopla, savills, green-acres"),
 "/guides/buying-property-in-greece/": ("open","форумы и advisory; getgoldenvisa на 5 месте с одной страницей"),
 "/guides/cost-of-buying-property-in-greece/": ("open","advisory, порталов нет"),
}
WAVE_OF = {"open":1, "mixed":3, "locked":4, "trap":9}

pages=json.load(open("data/new-pages.json"))

# Оппортунистическая страница вне ядра: кластер британского телешоу.
# В ёмкость рынка НЕ входит (CPC 0, коммерческого намерения нет), но
# rightmove держит там первое место редакционной статьёй, значит выдача
# берётся контентом. Риск: спрос привязан к эфиру сезона.
pages.append({
  "url":"/guides/amanda-and-alan-greek-job-real-costs/",
  "title":"Amanda and Alan's Greek Job: What Renovating in Greece Actually Costs",
  "type":"guide","demand":5200,"uk":5200,"us":0,"phrases":6,
  "top":"amanda and alan's greek job (2400) · alan and amanda greece (1300) · amanda and alan greek job (1300)"})
WINNABILITY["/guides/amanda-and-alan-greek-job-real-costs/"]=(
  "open","rightmove первым, но статьёй /news/articles/, а не листингом; CPC 0, верх воронки")
for p in pages:
    w,why = WINNABILITY.get(p["url"],("mixed",""))
    p["winnability"]=w; p["serp"]=why; p["wave"]=WAVE_OF[w]

# волна 1 = открытые выдачи, но не больше 6 страниц: остаток открытых уходит во 2
# Оппортунистическая страница не борется за место в первой волне:
# объём у неё есть, но коммерческого намерения нет, поэтому она фиксируется во вторую.
PINNED_WAVE2 = {"/guides/amanda-and-alan-greek-job-real-costs/"}
opens=sorted([p for p in pages if p["wave"]==1 and p["url"] not in PINNED_WAVE2],
             key=lambda x:-x["demand"])
for i,p in enumerate(opens): p["wave"]= 1 if i<6 else 2
for p in pages:
    if p["url"] in PINNED_WAVE2: p["wave"]=2
order={1:0,2:1,3:2,4:3,9:4}
pages.sort(key=lambda p:(order[p["wave"]],-p["demand"]))

with open("data/publication-order.csv","w",newline="") as f:
    w=csv.DictWriter(f,delimiter=";",fieldnames=["wave","url","title","type","demand","uk","us","phrases","winnability","serp","top"])
    w.writeheader(); [w.writerow(p) for p in pages]

names={1:"Волна 1 — выдачи без порталов",2:"Волна 2 — остальные открытые",
       3:"Волна 3 — смешанные выдачи",4:"Волна 4 — портально запертая голова",
       9:"Отложено — ловушка выдачи"}
n=0
for wv in (1,2,3,4,9):
    grp=[p for p in pages if p["wave"]==wv]
    if not grp: continue
    print(f'\n### {names[wv]} · {len(grp)} страниц · спрос {sum(p["demand"] for p in grp):,}/мес')
    for p in grp:
        n+=1
        print(f'{n:2d}. {p["url"]}')
        print(f'    {p["title"]}')
        print(f'    спрос {p["demand"]:,}/мес (UK {p["uk"]:,} · US {p["us"]:,}) · {p["phrases"]} фраз · тип {p["type"]}')
        print(f'    выдача: {p["serp"]}')
