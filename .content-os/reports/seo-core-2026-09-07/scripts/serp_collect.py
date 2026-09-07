# -*- coding: utf-8 -*-
"""Снимает топ-10 Google по приоритетным запросам через XMLRiver.
Классифицирует, кто держит топ: portal / agency / travel / rental / media / gov / advisory.
Цена: 0,025 руб за запрос. Пишет data/serp.json.
"""
import os, sys, json, time, re, urllib.parse, urllib.request

USER = os.environ["XMLRIVER_USER"]; KEY = os.environ["XMLRIVER_KEY"]
COUNTRIES = {"uk": 2826, "us": 2840, "au": 2036}

PORTAL = ["rightmove","aplaceinthesun","idealista","kyero","greekpropertyexchange",
          "spitogatos","xe.gr","tranio","primelocation","zoopla","james-​edition",
          "jamesedition","propertyguides","greecepropertyfinder","realestate.com",
          "athensproperty","engelvoelkers","sothebysrealty","christiesrealestate",
          "greek-realestate","propertyinvestorstoday","greekhomes","plotandhouse",
          "properstar","greecerealestate","luxuryestate","greenacres"]
TRAVEL  = ["tripadvisor","booking.com","lonelyplanet","expedia","airbnb","rough guides",
           "roughguides","timeout","cntraveller","condenast","greeka","discovergreece",
           "visitgreece","thomascook","tui","jet2","skyscanner","kayak","trivago","holidu"]
MEDIA   = ["telegraph","theguardian","bbc","ft.com","forbes","cnn","nytimes","reuters",
           "bloomberg","dailymail","express.co.uk","thetimes","independent.co.uk",
           "investopedia","economist","kathimerini","ekathimerini","businessinsider"]
GOV     = [".gov",".gov.gr","migration.gov.gr","aade.gr","europa.eu","mfa.gr","enterprisegreece",
           "gov.uk","travel.state.gov","oecd.org"]
ADVISORY= ["henleyglobal","globalcitizensolutions","imidaily","goldenvisas","nomadcapitalist",
           "getgoldenvisa","astons","latitudeworld","laveosolutions","globalresidenceindex",
           "expatica","internationalliving","expatarrivals","numbeo","greecegoldenvisa",
           "elxis","goldenvisagreece","propertyinvestment","visa-","lawfirm","law-",
           "lawyer","legal","solicit","attorney"]
FORUM   = ["reddit","quora","facebook","youtube","tiktok","instagram","trustpilot","expatforum"]

def classify(url):
    u = url.lower()
    for name, bucket in (("gov",GOV),("travel",TRAVEL),("forum",FORUM),("media",MEDIA),
                         ("portal",PORTAL),("advisory",ADVISORY)):
        if any(t in u for t in bucket): return name
    return "other"

def fetch(query, country_id, retries=3):
    url = ("https://xmlriver.com/search/xml?"
           + urllib.parse.urlencode({"user":USER,"key":KEY,"query":query,
              "groupby":10,"country":country_id,"lr":"en","device":"desktop"}))
    for a in range(retries):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return r.read().decode("utf-8","replace")
        except Exception as e:
            if a == retries-1: return f"<error>{e}</error>"
            time.sleep(2)

def parse(xml):
    ai = bool(re.search(r"<ai><present>1</present>", xml))
    docs = []
    for m in re.finditer(r"<doc>(.*?)</doc>", xml, re.S):
        blk = m.group(1)
        u = re.search(r"<url>(.*?)</url>", blk)
        t = re.search(r"<title>(.*?)</title>", blk)
        if u: docs.append({"url":u.group(1), "title":(t.group(1) if t else ""),
                           "type":classify(u.group(1))})
    return ai, docs

if __name__ == "__main__":
    queries = [l.strip() for l in open(sys.argv[1]) if l.strip() and not l.startswith("#")]
    out, n = [], 0
    for q in queries:
        for cc, cid in COUNTRIES.items():
            ai, docs = parse(fetch(q, cid)); n += 1
            out.append({"query":q,"country":cc,"ai_overview":ai,"top":docs[:10]})
            print(f"[{n:3d}] {cc} {q[:50]:50s} ai={int(ai)} top={len(docs)}")
    json.dump(out, open("data/serp.json","w"), ensure_ascii=False, indent=1)
    print(f"\nrequests: {n}  cost: {n*0.025:.2f} RUB")
