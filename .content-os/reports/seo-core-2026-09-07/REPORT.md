# greek-invest.com — полный аудит спроса и план вывода в топ

Срез: 7 сентября 2026. Рынок: Google, семь англоязычных стран покупателя.
Метод: SEO Standup. Режим аналитический: ни одной правки в коде и MDX не сделано.

**Источники.** Semrush (17 отчётов, базы us, uk, au, ca, il, de, ae),
XMLRiver (137 срезов топ-10 по UK, US, AU), Google Autocomplete (1 628 бесплатных
запросов), Search Console, Bing Webmaster, GA4, инвентаризация 133 MDX.

**Затраты.** Semrush ≈ 22 000 единиц (17 отчётов). XMLRiver 137 запросов = 3,43 руб.
Autocomplete бесплатно.

---

## 1. Ёмкость рынка

**112 410 показов в месяц** делового спроса по 715 измеренным парам «фраза × рынок».
Отсеяно 218 фраз на 91 020 показов, это **45 % сырого спроса**.

### По странам покупателя

| Рынок | Показов/мес | Доля | Фраз | Чем этот рынок отличается |
|---|---:|---:|---:|---|
| Великобритания | 56 800 | 50,5 % | 316 | Ищет дом на конкретном острове. Словарь «property for sale», «houses for sale» |
| США | 45 400 | 40,4 % | 329 | Ищет визу и переезд. Словарь «real estate», плюс весь кластер жизни |
| Канада | 3 210 | 2,9 % | 19 | Уменьшенная копия США |
| Австралия | 2 610 | 2,3 % | 20 | Уменьшенная копия Британии |
| ОАЭ | 2 300 | 2,0 % | 10 | **Только визы.** `greece residency by investment` 720 при CPC $3,12, недвижимости почти нет |
| Германия | 1 130 | 1,0 % | 12 | Англоязычный остаток, основной спрос идёт по-немецки |
| Израиль | 960 | 0,9 % | 9 | Мал в англоязычном срезе |

Британия и США дают 91 % рынка. Остальные пять вместе меньше, чем один Корфу.

### Два разных словаря, а не один рынок

Это главное, что сетка «паттерн × гео» не нашла и что вытащил discovery:

| Формулировка | UK | US |
|---|---:|---:|
| `property for sale in crete greece` | 1 600 | 170 |
| `real estate crete greece` | не в топе | 390 |
| `houses for sale in greece` | 1 300 | 2 400 |
| `greece real estate` | 110 | 1 000 |

Британец говорит **property for sale**, американец говорит **real estate**.
Одна страница, оптимизированная под один из словарей, теряет второй рынок.

### По уровню географии

| Уровень | UK | доля | US | доля |
|---|---:|---:|---:|---:|
| Страна («greece») | 28 160 | 49,6 % | 32 280 | 71,1 % |
| Остров или регион | 27 430 | 48,3 % | 9 310 | 20,5 % |
| Город (Афины, Салоники) | 580 | 1,0 % | 2 910 | 6,4 % |
| Район или посёлок | 630 | 1,1 % | 900 | 2,0 % |

Проверка страны отдельно от региона дала иной ответ, чем на тайском рынке.
У британцев страна и остров равны, у американцев страна забирает 71 %.
Район мёртв на обоих рынках: 1,1 % и 2,0 %.

### По кластерам намерения (UK + US, 102 200)

| Кластер | Показов/мес | Доля | Фраз | Топ-фразы |
|---|---:|---:|---:|---|
| property | 75 700 | 74,1 % | 409 | property sales corfu greece 2 900 · houses for sale in greece 2 400 · homes for sale in greece 2 400 |
| visa | 15 250 | 14,9 % | 109 | greece golden visa 2 900 · golden visa greece 1 000 · greek golden visa 880 |
| life | 7 990 | 7,8 % | 73 | cost of living in greece 1 000 · living in greece 720 · moving to greece 720 |
| **news** | 1 460 | 1,4 % | 4 | greece real estate news today 720 · greece real estate news 590 |
| investment | 850 | 0,8 % | 23 | invest in greece real estate 260 · greece property investment 140 |
| legal | 560 | 0,5 % | 11 | pitfalls of buying property in greece 90 · real estate agents in greece 90 |
| money | 320 | 0,3 % | 15 | real estate tax greece 90 · greece non dom tax regime 30 |
| choice | 70 | 0,1 % | 1 | cheapest island in greece to buy property 70 |

Четыре нижних кластера вместе весят **1 800 показов, это 1,8 % рынка.**
На них построены 94 гайда сайта.

Кластер `news` появился только после discovery: `greece real estate news today` 720,
`greece real estate news` 590, плюс визовые новости 1 220. Живой новостной спрос
на 2 680 показов в месяц, у сайта под него одна страница.

### Отсев: 35 % сырого спроса, и почти всё это отпускная аренда

| Причина | Фраз | Объём |
|---|---:|---:|
| **villa_holiday** — словарь «villa» без покупки | 72 | **50 360** |
| **resort_placename** — «посёлок + регион + greece» | 48 | **30 580** |
| rental_not_buy — аренда без покупки | 10 | 3 350 |
| named_resort — имя конкретного отеля | 7 | 2 970 |
| off_topic — есть Greece, но не про покупку и не про переезд | 45 | 2 550 |
| no_anchor — нет якоря Греции | 10 | 290 |
| greece_ny — город Greece в штате Нью-Йорк | 5 | 280 |
| homonym — Paros, Kos, Hydra без якоря | 6 | 210 |
| celebrity — Джокович, Том Хэнкс | 6 | 190 |
| viral_news — Антикитира «платят за переезд» | 7 | 190 |
| ancient — античная Греция, школьная программа | 2 | 50 |

Главный отсев проверен выдачей, а не догадкой. `villas in greece` весит 8 100,
`greece villas` 1 900, `villa in greece` 1 900, `villas with pool greece` 1 900.
Снимок топ-8 по каждому (`data/serp-ambiguous.json`) показал TUI, James Villas,
Airbnb, Booking, Simpson Travel, CV Villas, Oliver's Travels. Это аренда виллы
на отпуск. Покупательская выдача появляется только с явным токеном покупки:
`villas for sale in greece` 480 держат rightmove, Savills, Zoopla, Hamptons.

**Вторая крупная ловушка — курортные топонимы.** Форма «посёлок + регион + greece»
даёт большие числа: `elounda lasithi greece` 3 600, `parga epirus greece` 3 600,
`lassi kefalonia greece` 2 900, `skala kefalonia greece` 2 400, `pefkos rhodes greece`
1 900. Вместе 30 580 показов по 48 фразам. Первый сигнал, что это не наш спрос, —
цена клика: 1,0–1,9 EUR, то есть ценник отпускного кластера, тогда как у покупки
0,12–0,55. Снимок выдачи по семи из них (`data/serp-placenames.json`) подтвердил:
топ-8 держат Wikipedia, TripAdvisor, TUI, Jet2, greeka и тревел-блоги.
`aplaceinthesun` ловит перелив на 4 и 8 месте всего в двух выдачах из семи.
Страниц под уровень посёлка в плане поэтому нет.

Отдельно про ловушки, которых не было в русском исследовании: **Greece — это
ещё и город в штате Нью-Йорк** (`greece ny real estate` 70, `assisted living in
greece ny` 50), и **Антикитира**, где государство платит за переезд, дала
семь вирусных запросов, которые выглядят как наш спрос, но приходят не от покупателей.

Полные списки: `data/core-classified.csv` (715 фраз) и `data/rejected.csv` (170 фраз).

---

## 2. Наша доля

За 90 дней (17.06 – 04.09.2026): 5 406 показов, ~37 кликов, 186 сессий
из органики, **0 ключевых событий в GA4**.

| Кластер | Ёмкость | Наши показы | Доля | Клики | Ср. позиция | Вердикт |
|---|---:|---:|---:|---:|---:|---|
| property | 81 950 | 34 | **0,04 %** | 0 | 74,5 | практически не ловим |
| visa | 18 630 | 284 | 1,52 % | 0 | 75,9 | показы без кликов |
| life | 8 570 | 0 | 0 % | 0 | — | не ловим |
| news | 1 460 | 0 | 0 % | 0 | — | не ловим |
| investment | 850 | 150 | 17,7 % | 0 | 12,8 | показы без кликов |
| legal | 560 | 119 | 21,3 % | 0 | 50,4 | показы без кликов |
| money | 320 | 31 | 9,7 % | 0 | 11,1 | показы без кликов |
| choice | 70 | 0 | 0 % | 0 | — | не ловим |

Сайт держит пятую часть юридического кластера, который стоит 560 показов,
и четыре сотых процента кластера покупки, который стоит 81 950.

### Половина показов Google не человеческая

| Страна, устройство | Показы | Клики | Позиция | Окно |
|---|---:|---:|---:|---|
| Нидерланды, десктоп | 2 004 | 0 | 4,7–5,6 | 27.06 – 17.07, потом обрыв в ноль |
| Германия, десктоп | 713 | 0 | 6,1 | весь период |
| **Вместе** | **2 706** | **0** | | **50 % всех показов сайта** |

Запросы в нидерландском срезе: «greece property purchase costs transfer tax
notary lawyer fees 2026», «global property guide greece rental yields athens
thessaloniki 2026». Восемь и более слов, маркер источника, ноль кликов,
стабильная позиция 5. Это рангтрекер или агентный ретрив, не покупатели.
Ищется такой паттерн в срезе country + device, а не в отдельном запросе.

### Bing: тот же перекос, но там сайту платят кликами

| Слой | Запросов | Показы | Клики | CTR |
|---|---:|---:|---:|---:|
| Один агентный запрос про закон 5100/2024 | 1 | 3 872 | 0 | 0 % |
| Виджетные артефакты Bing | 34 | 620 | 1 | 0,2 % |
| **Человеческие запросы** | 504 | 1 418 | **67** | **4,7 %** |

CTR человеческого слоя в Bing 4,7 % против 0,7 % в Google. Формулировки
разговорные: «buying property in greece as a non eu resident in military
sensitive area what do you need», «400k euro residencey in crete isnthis.ok.or
is it 800k». Живые люди, и сайт отвечает им лучше, чем Google готов показывать.

---

## 3. Техническая блокировка, которую надо снять до всего остального

Search Console по свойству `sc-domain:greek-invest.com`:

| Поле | Значение |
|---|---|
| Sitemap | `https://greek-invest.com/sitemap-index.xml` |
| Последняя отправка | 22 августа 2026 |
| Статус | `isPending: true` |
| **Последняя загрузка Google** | **23 июля 2026** |
| Ошибки, предупреждения | 0, 0 |

Google не перечитывал карту сайта **46 дней**, и заявка от 22 августа до сих пор
висит необработанной. Все страницы, опубликованные после 23 июля, Google из карты
не видел. Это прямо объясняет, почему из 157 URL показы за 90 дней были только
у 51, и меняет трактовку остальных 106: значительная их часть не «плохо написана»,
а просто не дошла до индекса.

Независимое подтверждение того же: **Semrush по базе uk отдаёт по домену
`NOTHING FOUND`** — сайт не ранжируется ни по одной фразе в топ-100. По базе us
находится ровно три фразы, все на позициях 10, 45, 74 и 91, с нулевым трафиком:

| Запрос | Позиция | Объём | Страница |
|---|---:|---:|---|
| aade afm required to open bank account greece | 10 | 90 | /guides/greece-golden-visa-bank-account-afm/ |
| greece bank account opening afm required non resident | 74 | 70 | /guides/greece-golden-visa-bank-account-afm/ |
| long term visa for greece | 91 | 40 | /guides/how-long-can-you-stay-greece-golden-visa/ |

Измерить точное число страниц в индексе через `site:` не вышло: XMLRiver отдаёт
по этому оператору обрезанное `found = 100` для любого запроса, включая заведомо
маленькие разделы. Число индексированных страниц надо смотреть глазами
в отчёте «Страницы» Search Console, у меня к нему нет API-доступа.

**Что это значит для плана.** Появляется волна 0, чисто техническая, до любого
контента: переотправить sitemap, проверить, почему заявка висит в pending,
и снять отчёт «Страницы» в GSC. Публиковать волну 1 в карту, которую Google
не читает полтора месяца, бессмысленно.

---

## 4. Бенчмарк: как это делается 14 страницами

`getgoldenvisa.com`, база us, отфильтровано по слову greece. Это контентный
сайт без листинга, то есть ровно та модель, в которой работает greek-invest.

| Запрос | Объём | Позиция | Их URL |
|---|---:|---:|---|
| greece golden visa program | 720 | 2 | /ultimate-guide-to-greece-golden-visa |
| greece golden visa | 2 400 | 3 | /ultimate-guide-to-greece-golden-visa |
| greece citizenship by investment | 480 | 2 | /ultimate-guide-to-greece-golden-visa |
| greece digital nomad visa | 590 | 3 | /greece-digital-nomad-visa |
| moving to greece | 1 000 | 7 | /moving-to-greece |
| greece cost of living | 390 | 3 | /cost-of-living-in-greece |
| greece living expenses | 590 | 5 | /cost-of-living-in-greece |
| buying property in greece | 390 | 5 | /buying-property-in-greece |
| greece golden visa requirements 2026 | 110 | **1** | /ultimate-guide-to-greece-golden-visa |
| greece golden visa cost | 90 | **1** | /ultimate-guide-to-greece-golden-visa |
| greece golden visa news october 2025 | 70 | **1** | /ultimate-guide-to-greece-golden-visa |

**Одна страница `/ultimate-guide-to-greece-golden-visa` собирает больше двадцати
запросов, включая три первых места.** Весь их греческий раздел это примерно
14 URL: golden visa, digital nomad, retirement, moving, cost of living, living,
buying property, property taxes, passport, americans, latest changes,
vs portugal, vs spain, lgbt expats.

У greek-invest 133 страницы на ту же территорию, и ноль кликов.
Разница не в объёме написанного, а в том, что у них один документ на кластер,
а у нас сорок фрагментов, которые делят между собой сигнал.

### Насколько плотно порталы держат голову

`rightmove.co.uk`, база uk, фильтр по слову greece. Одна страница
`/overseas-property/in-Greece.html` стоит **на первом месте** по `property for
sale in greece`, `houses for sale in greece`, `greece property for sale`,
`buy property in greece`, `buying property in greece`, `buy greece house` (1 900),
`property to buy in greece`, `homes for sale in greece` и ещё десятку формулировок.
Островные подстраницы `/overseas-property-for-sale/Crete.html`, `/Corfu.html`,
`/Cephalonia.html`, `/Zante.html`, `/Rhodes.html`, `/Mykonos.html` держат первое
место по своим островам. `aplaceinthesun.com` стоит вторым-третьим по тем же
запросам со структурой `/property/greece/{регион}/{остров}`.

Три вывода из этого:

1. **Голова заперта не «примерно», а плотно.** По большинству головных фраз
   позиции 1 и 2 заняты двумя порталами с живым листингом. Контентная страница
   туда не входит.
2. **Но замок не сплошной.** По `property sales corfu greece` (2 900, самый
   крупный островной запрос) rightmove только третий, aplaceinthesun пятый.
   Первые две позиции держит кто-то другой, то есть вход есть.
3. **Порталы сами выигрывают редакционными страницами там, где листинг
   не помогает.** У rightmove по запросу `alan and amanda greece` (1 300)
   первое место занимает статья `/news/articles/dream-properties/…`, а не листинг.
   У aplaceinthesun первое место по `cheap property in greece` держит
   отдельная страница `/property/greece/cheap-properties`, а по
   `cheap houses for sale in greece near beach` — `/property/greece`.
   Это подтверждает, что бюджетный сегмент берётся страницей, а не инвентарём.

Второй бенчмарк, `greekexclusiveproperties.com` (uk), показывает, чем берётся
кластер покупки: `/property-city/{остров}/` плюс фасеты `/property-feature/
swimming-pool/` и `/property-feature/direct-sea-access/`. Фасет по признаку
объекта берёт первое место по `greece property for sale by the beach`
и второе по `villas for sale in greece with private pool`.

---

## 5. Иерархия: было и стало

### Было — 157 URL

```
/
├─ /golden-visa/            хаб
├─ /guides/       94 MDX    право и налоги = 1,8 % рынка
├─ /areas/        12 MDX    /areas/{city}-property-investment/ = 0 запросов
├─ /compare/      13 MDX
├─ /projects/      9 MDX
├─ /developers/    4 MDX
├─ /news/          1 MDX
├─ /tools/         3
└─ /invest-athens-property/, /invest-crete-property/, /tier-golden-visa-400k/
```

Ветки под кластер property (74 % рынка) нет ни одной.
Ветки под кластер life (7,8 %) нет ни одной. Кластер news обслуживает одна страница.

### Стало — 25 целевых страниц, покрывающих все 112 410

```
/
├─ /property-for-sale/              36 760   хаб, оба словаря на одной странице
│  ├─ /corfu/                       10 450
│  ├─ /crete/                       10 150
│  ├─ /cyclades/                     4 620   Парос, Наксос, Санторини, Миконос
│  ├─ /athens/                       2 740
│  ├─ /kefalonia/                    2 760
│  ├─ /zakynthos/                    2 150
│  ├─ /rhodes/                       2 070   + Линдос, Сими, Кос
│  ├─ /lefkada/                      1 990   + Паксос, Итака
│  ├─ /skiathos/                     1 850   + Скопелос
│  ├─ /cheap/                        1 820   до 100 000 евро
│  ├─ /peloponnese/                  1 210
│  ├─ /halkidiki/                      850   + Салоники, Тасос
│  └─ /greek-islands/                  770   сравнение островов
├─ /golden-visa/                    15 230
│  └─ /news/                         1 220
├─ /visas/                             670   отложено, выдачу держат гос. сайты
│  ├─ /retirement/                   1 460
│  └─ /digital-nomad/                  800
├─ /living-in-greece/                2 750
│  ├─ /cost-of-living/               3 090
│  └─ /moving/                       1 940
├─ /property-news/                   1 870
├─ /guides/buying-property-in-greece/          2 830
├─ /guides/cost-of-buying-property-in-greece/    360
├─ /guides/  остальные 92            справочный слой для AI-ретрива,
│                                    выведен из основного графа ссылок
└─ /projects/, /developers/, /tools/, /compare/ (4 из 13)
```

---

## 6. Постраничный план

### Волна 0 — до любого контента

| Задача | Почему |
|---|---|
| Переотправить sitemap и разобраться, почему заявка от 22.08 висит в pending | Google не читал карту 46 дней |
| Снять отчёт «Страницы» в Search Console глазами | Понять, сколько из 157 URL в индексе, а сколько просто не дошли |
| Проверить внутренние ссылки на страницы без показов | Возраст 11 недель плюс мало входящих ссылок объясняет часть нулей лучше, чем качество текста |

Без этого волна 1 уходит в карту, которую поисковик не перечитывает.

### Действия по страницам

| Действие | Страниц | Что это значит |
|---|---:|---|
| **create** | 25 | новые страницы под подтверждённый спрос, плюс 1 оппортунистическая |
| **rewrite** | 12 + 1 | все `/areas/` плюс существующий `/golden-visa/` |
| **merge** | 52 | доказанная каннибализация: 4+ страниц на тему и минимум две реально показываются |
| **demote** | 43 | оставить в индексе для AI-ретрива, вывести из основного графа ссылок |
| **keep** | 26 | даёт клики или живые показы |

### По коллекциям

| Коллекция | create | rewrite | merge | demote | keep |
|---|---:|---:|---:|---:|---:|
| property-for-sale (новая) | 14 | — | — | — | — |
| living-in-greece (новая) | 3 | — | — | — | — |
| visas (новая) | 3 | — | — | — | — |
| property-news (новая) | 1 | — | — | — | — |
| guides | 2 | — | 43 | 30 | 21 |
| golden-visa | 1 | 1 | — | — | — |
| areas | — | 12 | — | — | — |
| compare | — | — | 9 | — | 4 |
| projects | — | — | — | 9 | — |
| developers | — | — | — | 4 | — |
| news | — | — | — | — | 1 |

### Темы с доказанной каннибализацией

| Тема | Страниц | Владелец темы | Его результат |
|---|---:|---|---|
| athens | 15 | /areas/voula-property-investment/ | 1 клик, 38 показов |
| islands | 13 | /areas/costa-navarino-property-investment/ | 3 клика, 207 показов |
| tax | 11 | /guides/enfia-property-tax-greece/ | 3 клика, 790 показов |
| gv-buyers | 10 | /guides/israeli-buyers-greece-property/ | 1 клик, 23 показа |
| diligence | 9 | /guides/power-of-attorney-property-greece/ | 1 клик, 112 показов |
| howto | 8 | /guides/how-to-buy-property-greece-step-by-step/ | 0 кликов, 148 показов |
| yield | 7 | /guides/greece-property-market-transactions-2025/ | 1 клик, 79 показов |
| crete | 6 | /areas/elounda-property-investment/ | 1 клик, 30 показов |
| cost | 4 | /guides/greece-golden-visa-lawyer-cost/ | 1 клик, 289 показов |

Пятнадцать страниц про Афины делят между собой 38 показов лучшей из них.
Критерий склейки намеренно ужесточён: на сайте возрастом 11 недель ноль показов
чаще означает «ещё не проиндексировано», а не «дубль», поэтому merge требует,
чтобы в теме уже показывались минимум две страницы.

Построчно: `data/page-plan.csv` и `data/plan-by-action.txt`.

---

## 7. Новые страницы в порядке написания

Порядок задаёт **выигрываемость выдачи, а не объём**. Сначала кластеры,
где порталов нет вообще, потом слабые островные выдачи, и только потом
портально запертая голова, где без листинга первую страницу не взять.

### Волна 1 — выдачи без порталов · 6 страниц · 28 600/мес

| # | URL | Заголовок | Спрос | Кто в топ-10 |
|---|---|---|---:|---|
| 1 | `/golden-visa/` | Greece Golden Visa 2026: €250k, €400k and €800k Tiers Explained | 15 230 | advisory + gov, порталов нет |
| 2 | `/living-in-greece/cost-of-living/` | Cost of Living in Greece 2026: Real Monthly Budgets by City | 3 090 | numbeo, internationalliving, wise, 3 из 9 форумы |
| 3 | `/guides/buying-property-in-greece/` | Buying Property in Greece as a Foreigner: The 2026 Process | 2 830 | форумы и advisory |
| 4 | `/property-for-sale/kefalonia/` | Property for Sale in Kefalonia, Greece: Houses and Villas | 2 760 | четыре крошечных локальных агентства |
| 5 | `/living-in-greece/` | Living in Greece as a Foreigner: What the Guides Leave Out | 2 750 | форумы и advisory |
| 6 | `/living-in-greece/moving/` | Moving to Greece in 2026: Visas, Costs and the First 90 Days | 1 940 | reddit, facebook, youtube |

### Волна 2 — остальные открытые · 8 страниц · 14 580/мес (из них 5 200 без коммерческого намерения)

| # | URL | Заголовок | Спрос | Кто в топ-10 |
|---|---|---|---:|---|
| 7 | `/property-news/` | Greece Property Market News: Prices, Transactions and Policy | 1 870 | ekathimerini, globalpropertyguide |
| 8 | `/property-for-sale/skiathos/` | Property for Sale in Skiathos, Greece: Sporades Houses and Villas | 1 850 | один одностраничник на первом месте |
| 9 | `/property-for-sale/cheap/` | Cheap Property for Sale in Greece: Homes Under €100,000 | 1 820 | holprop, makoo, facebook, youtube |
| 10 | `/visas/retirement/` | Greece Retirement Visa 2026: FIP Route, Income Proof and 7% Pension Tax | 1 460 | advisory + форумы |
| 11 | `/golden-visa/news/` | Greece Golden Visa News: Every Rule Change in 2026 | 1 220 | getgoldenvisa одной страницей |
| 12 | `/visas/digital-nomad/` | Greece Digital Nomad Visa 2026: Income Rules, Tax and How to Apply | 800 | advisory + gov |
| 13 | `/guides/cost-of-buying-property-in-greece/` | What It Costs to Buy Property in Greece: Every Fee in 2026 | 360 | advisory, порталов нет |
| 14 | `/guides/amanda-and-alan-greek-job-real-costs/` | Amanda and Alan's Greek Job: What Renovating in Greece Actually Costs | 5 200 | rightmove первым, но статьёй, не листингом |

Четырнадцатая страница стоит отдельно, и я помечаю её честно. Кластер британского
телешоу: `amanda and alan's greek job` 2 400, `alan and amanda greece` 1 300,
`amanda and alan greek job` 1 300, вместе около 5 200. Сложность 36–39, цена клика
**ноль**: рекламодателей там нет, коммерческого намерения в запросе нет тоже.
Это верх воронки, а не лид. Брать стоит по трём причинам: rightmove держит там
первое место обычной редакционной статьёй, то есть выдача берётся контентом;
объём сопоставим со всей волной 2; и это единственный вход, где британский зритель
сам приходит с мыслью «а сколько на самом деле стоит дом в Греции». Риск тоже
называю: спрос привязан к эфиру и просядет между сезонами.

### Волна 3 — смешанные выдачи · 8 страниц · 16 400/мес

| # | URL | Заголовок | Спрос |
|---|---|---|---:|
| 14 | `/property-for-sale/cyclades/` | Property for Sale in the Cyclades: Paros, Naxos, Santorini, Mykonos | 4 620 |
| 15 | `/property-for-sale/athens/` | Property for Sale in Athens, Greece: Apartments and Riviera Homes | 2 740 |
| 16 | `/property-for-sale/zakynthos/` | Property for Sale in Zakynthos (Zante), Greece: Houses and Villas | 2 150 |
| 17 | `/property-for-sale/rhodes/` | Property for Sale in Rhodes, Greece: Island Houses and Villas | 2 070 |
| 18 | `/property-for-sale/lefkada/` | Property for Sale in Lefkada and Paxos, Greece: Ionian Houses | 1 990 |
| 19 | `/property-for-sale/peloponnese/` | Property for Sale in the Peloponnese, Greece: Houses and Land | 1 210 |
| 20 | `/property-for-sale/halkidiki/` | Property for Sale in Halkidiki and Northern Greece | 850 |
| 21 | `/property-for-sale/greek-islands/` | Property for Sale on the Greek Islands: Every Island Compared | 770 |

### Волна 4 — портально запертая голова · 3 страницы · 57 360/мес

| # | URL | Заголовок | Спрос |
|---|---|---|---:|
| 22 | `/property-for-sale/` | Property for Sale in Greece: Houses, Villas and Land | 36 760 |
| 23 | `/property-for-sale/corfu/` | Property for Sale in Corfu, Greece: Houses, Villas and Land | 10 450 |
| 24 | `/property-for-sale/crete/` | Property for Sale in Crete, Greece: Houses and Villas from €60,000 | 10 150 |

Половина всей ёмкости лежит в этих трёх страницах, и они идут последними
сознательно: без листинга и без набранного авторитета вход в топ-10 к rightmove
и Savills невозможен, а с авторитетом, набранным на волнах 1 и 2, шанс появляется.

### Отложено

`/visas/` — 670 показов, выдачу держат mfa.gr, travel.state.gov и gov.uk,
занимая 4–5 мест из 10. Государственная ловушка, обходить нечем.

Машинный порядок с полными данными: `data/publication-order.csv`.

---

## 8. ТЗ из выдачи

Снято 120 срезов Google по UK, US и AU. **greek-invest.com не найден
ни в одном из 90 приоритетных срезов.** AI Overview присутствует в 77 % выдач.

### Что общего у победителей кластера покупки

1. **Число объектов прямо в title.** «Buy property in Greece: 13,878 Greek houses
   and…», «Ktimatoemporiki: 21000+ Properties for Sale in Greece»,
   «6,027 Cheap Houses for Sale in Greece», «128 Villas for sale in Greece».
2. **Цена «от» в евро.** «Real Estate in Greece for Sale, Buy Property from 100000 €»,
   «From €45000 to €60000».
3. **Фильтруемый каталог, а не статья.** Даже редакционные страницы отдают
   выдачу с фильтрами по цене, острову и типу.
4. **Фасет по признаку объекта берёт первые места.** `greece property for sale
   by the beach` — первое место у `/property-feature/direct-sea-access/`.

Чего нет ни у одного портального победителя: разбора закона, налогов, сроков
и рисков внутри той же страницы. Это единственный зазор.

### Три группы кластеров

| Группа | Объём | Кто держит | Что делать |
|---|---:|---|---|
| **Заперто порталами** | ~57 000 | rightmove, aplaceinthesun, zoopla, spitogatos, savills, green-acres | Нужен листинг или витрина. Без них максимум вторая страница |
| **Открыто** | ~19 000 | форумы, YouTube, одностраничники, крошечные локальные агентства | Берётся качеством страницы. Волны 1 и 2 |
| **Наше по праву** | ~26 000 | advisory-фирмы и гос. сайты, портальных игроков нет | Здесь у сайта лучший корпус в холдинге, но ноль консолидации |

### Разбор по первым десяти страницам

| # | Целевая страница | Топ-10 (UK) | Что у них есть | Чего нет у нас |
|---|---|---|---|---|
| 1 | `/golden-visa/` | henleyglobal, savills.gr, wise, migration.gov.gr, greekcitizenship, getgoldenvisa, immigrantinvest, goldenvisa-greece, holbornpass | Пороги, сроки, таблица тиров, калькулятор, форма. Ни одного портала | Одной страницы-ответа нет: тема размазана по 40+ гайдам |
| 2 | `/living-in-greece/cost-of-living/` | numbeo, internationalliving, facebook, properstar, wise, pacificprime, youtube | Таблицы бюджетов, сравнение городов, калькулятор | Страницы нет вообще. Кластер 3 090 не ловится |
| 3 | `/guides/buying-property-in-greece/` | форумы, advisory, getgoldenvisa на 5 с одной страницей | Один документ на весь процесс | 43 фрагмента вместо одного документа |
| 4 | `/property-for-sale/kefalonia/` | rightmove, aplaceinthesun, zoopla, sothebys + kefalonianproperty, kefalonia-properties, kefalonia.property, propertieskefalonia | Только листинг | Слабейшая выдача среди островов с объёмом. Берётся качеством |
| 5 | `/living-in-greece/` | форумы, advisory, gov.uk | Личный опыт, минусы, реальные цифры | Страницы нет |
| 6 | `/living-in-greece/moving/` | gov.uk, reddit, taxesforexpats, wise, facebook, getgoldenvisa, youtube | Чеклист переезда, стоимость перевозки | Страницы нет. UK-подкластер «moving to greece from uk» 1 110 не ловится |
| 7 | `/property-news/` | ekathimerini, globalpropertyguide, grekodom, ellasestate, ktimatoemporiki | Регулярная лента, аналитика рынка | Одна новость за всё время. Кластер 1 870 не ловится |
| 8 | `/property-for-sale/skiathos/` | wp.skiathosproperty на 1, aplaceinthesun, spitogatos, facebook на 6 | Один одностраничник держит первое место | Страницы нет |
| 9 | `/property-for-sale/cheap/` | holprop, makoo, propertyunder50k, facebook, youtube, realgreece, briansgreekproperty | Списки объектов с ценами, видео-туры | Страницы нет. Редакционного ответа нет ни у кого |
| 10 | `/property-for-sale/corfu/` | rightmove, aplaceinthesun, zoopla, spitogatos + локальные | Листинг по деревням, цены за м² | Страницы нет. 10 450 показов, крупнейший остров |

---

## 9. Честный блок

**Чего рынок не даёт.**

Кластеры investment, legal, money и choice вместе весят 1 800 показов в месяц
на UK и US, это 1,8 % рынка. Сайт построен на них. Никакая переработка
этих страниц не даст трафика, потому что трафика там нет.

Район как уровень географии даёт 1,1 % у британцев и 2,0 % у американцев.
Шаблон `{city} property investment` вернул ноль на всех 70 проверенных гео.
Имена проектов: 10–20 показов на объект. Единственные имена с объёмом —
One&Only Kea 720 и Amanzoe Porto Heli 170 — это бронирование отелей.

**Сорок пять процентов сырого спроса вокруг Греции нам не принадлежит.**
50 360 показов это отпускная аренда виллы, ещё 30 580 — курортные топонимы
уровня посёлка. Оба отсева проверены выдачей, а не эвристикой. Самый крупный
запрос всего исследования, `villas in greece` 8 100, и второй по величине,
`elounda lasithi greece` 3 600, оба чужие.

**Где просадка.**

Ноль ключевых событий в GA4 за 90 дней. Ноль кликов в Google по всем 56
видимым запросам. Отсутствие в 90 из 90 срезов выдачи. Половина показов
не человеческая. Позиции 50–90 по коммерческим формулировкам.
Semrush по базе uk не находит домен вообще, по базе us находит три фразы
на позициях 10–91 с нулевым трафиком.

**Часть нулей — не про тексты.** Google не перечитывал sitemap 46 дней,
заявка от 22 августа висит в pending. Страницы, опубликованные после 23 июля,
до карты не дошли. Прежде чем судить о качестве 106 страниц без показов,
надо снять отчёт «Страницы» в Search Console и увидеть, сколько из них
вообще в индексе. Я этого не сделал: API покрытия у меня нет, а `site:`
через XMLRiver отдаёт обрезанное `found = 100` и для домена, и для
заведомо маленьких разделов, то есть непригоден.

**Чего не обещаем.**

Топ-3 по `property for sale in greece` контентной страницей не берётся.
Там rightmove, zoopla, Savills и spitogatos с живыми листингами и счётчиками
объектов в заголовке. Пока у сайта нет витрины с реальным инвентарём,
реалистичный потолок по этому запросу — вторая страница. Именно поэтому
волна 4 идёт последней, а не первой.

Не обещаем и быстрого результата: сайту 11 недель, домен без истории,
входящих ссылок мало. Волна 1 начнёт показываться через 6–10 недель после
публикации, и первые клики придут из visa и life, а не из property.

**Чего не делать.**

Не закрывать 43 страницы из `demote`. Они не приносят кликов, но кормят
AI-ретрив, а он у этого сайта работает лучше обычного поиска: 67 кликов
из Bing по человеческим запросам при CTR 4,7 % против 37 кликов из Google
при 0,7 %. Вывести их из основного графа ссылок — да. Вывести из индекса — нет.

**Что осталось неизмеренным.**

Разрыв по ключам снят по четырём конкурентам: getgoldenvisa, greekexclusiveproperties,
rightmove, aplaceinthesun. Не сняты spitogatos и green-acres — греческие порталы,
чьё ядро устроено так же, как у rightmove, и новой картины дать не должно.

Не измерено число страниц в индексе (нужен доступ глазами к GSC).
Не измерены испанский, итальянский и турецкий англоязычные срезы, где Греция
конкурирует за того же покупателя. Не проверена сезонность: все объёмы это
срез на сентябрь 2026, а греческий рынок сезонный, и январь-март у запросов
про покупку обычно выше.

---

## 10. Артефакты

| Файл | Что внутри |
|---|---|
| `scripts/build_seeds.py` | 357 сидов: паттерн × 80 гео × процесс × визы × жизнь × проекты |
| `scripts/classify_core.py` | десять фильтров и кластеризация по намерению; правило по villa проверено выдачей |
| `scripts/serp_collect.py` | съём топ-10 через XMLRiver, классификация держателей выдачи |
| `scripts/suggest_collect.py` | бесплатный discovery, 1 628 запросов Autocomplete, 3 432 подсказки |
| `scripts/map_current_share.py` | GSC против ядра, детектор нечеловеческого трафика |
| `scripts/map_demand_to_pages.py` | раскладка спроса по целевым страницам без задвоения |
| `scripts/build_waves.py` | волны по выигрываемости выдачи |
| `scripts/page_plan.py` | план по существующим страницам с детектором каннибализации |
| `data/core-classified.csv` | 715 фраз делового спроса |
| `data/rejected.csv` | 170 отсеянных с причиной |
| `data/semrush/` | 14 файлов с сырыми выгрузками Semrush: discovery, вторичные рынки, конкуренты, топонимы |
| `data/serp-placenames.json` | 7 срезов по курортным топонимам, доказательство отсева |
| `data/page-demand.csv`, `data/publication-order.csv` | целевые страницы со спросом и волнами |
| `data/serp.json`, `serp-tz.json`, `serp-ambiguous.json` | 120 срезов выдачи |
| `data/suggests.json` | 3 432 подсказки Google |
| `data/bing-queries.json` | 539 запросов Bing, человеческие и агентные |
| `data/page-plan.csv`, `plan-by-action.txt` | построчный план по 133 страницам |

## 11. Topvisor

Проект не создан. Ядро готово в `data/core-classified.csv`, группы совпадают
с кластерами намерения. Загружать после согласования структуры: замер
«до и после» без утверждённой архитектуры измеряет не то.
Приоритет для загрузки — 715 фраз с регионами US 159, GB 737, CA 900.
