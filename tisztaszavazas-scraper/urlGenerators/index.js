import pad from "../utils/pad"

const getPaddedNumber = (value, paramName) => {
  switch (paramName) {
    case 'megyeKod':
    case 'megyeKod2':
      return pad(value, 2)

    case 'telepulesKod':
    case 'telepulesKod2':
      return pad(value, 3)

    default:
      return value
  }
}

const getParamColIndex = valasztasAzonosito => {
  switch(valasztasAzonosito) {
    case 'onk2019': return 0
    case 'ogy2018': return 1
    case 'idbo620': return 2
    default: return 0
  }
}

const getPreId = (preIdStart, valasztasAzonosito) => {
  const paramColIndex = getParamColIndex(valasztasAzonosito)
  return `${preIdStart[paramColIndex]}_WAR_nvinvrportlet`
}

const getParamsString = valasztasAzonosito => ({
  path,
  preIdStart,
  prefixedParams,
  ppParams
}) => {
  const baseUrl = `https://www.valasztas.hu/`

  const paramColIndex = getParamColIndex(valasztasAzonosito)
  const preId = getPreId(preIdStart, valasztasAzonosito)

  const prefixedParamsString = (
    Object.entries(prefixedParams).reduce((acc = '', [key, value]) => {
      if (typeof value[paramColIndex] === 'undefined') return acc;
      return `${acc}${acc ? '&' : ''}_${preId}_${key}=${getPaddedNumber(value[paramColIndex], key)}`
    }, '')
  )

  const ppString = 'p_p'

  const ppParamsString = (
    Object.entries({ ...ppParams }).reduce((acc = '', [key, value]) => {
      if (typeof value[paramColIndex] === 'undefined') return acc;
      return `${acc}${acc ? '&' : ''}${ppString}_${key}=${value[paramColIndex]}`
    }, '')	
  )

  return `${baseUrl}${path[paramColIndex]}?${ppString}_id=${preId}&${ppParamsString}&${prefixedParamsString}`
}


export const getSzavazokorUrl = ({
  megyeKod,
  telepulesKod,
  szavkorSorszam,
  valasztasAzonosito = 'onk2019'
}) => (
  getParamsString(valasztasAzonosito)({
    // 									|          onk2019            |          ogy2018          |        idbo620       |
    path: 							[ `szavazokorok_onk2019`,     'szavazokori-eredmenyek',   'orszaggyulesi-valasztasok1/borsod-abauj-zemplen-6.-oevk-20201011', ],
    preIdStart: 				[ 'onkszavazokorieredmenyek', 'ogyszavazokorieredmenyek', 'iogyszavazokorieredmenyek' ],
    ppParams: {
      lifecycle:				[ 1,                          1,                          1,                     ],
      state: 		 				[ 'maximized',                'maximized',                'maximized'            ],
      mode: 		 				[ 'view',                     'view',                     'view'                 ],
    },
    prefixedParams: {
      megyeKod:					[ megyeKod,                   megyeKod,                   megyeKod,              ],
      telepulesKod:			[ telepulesKod,               telepulesKod,               telepulesKod,          ],
      szavkorSorszam:		[ szavkorSorszam,             szavkorSorszam,             szavkorSorszam,        ],	
      vlId:							[ 294,                        244,                        321,                   ],
      vltId:						[ 687,                        556,                        836,                   ],
      tabId: 						[ 'tab2',                     'tab2',                     'tab2'                 ],
    }
  })
)

const pPostogy2018 = '#_szavazokorok_WAR_nvinvrportlet_paginator1';
const pPostidbo620 = '#_iogyszavazokorok_WAR_nvinvrportlet_paginator';

export const getSzavazokorListUrl = ({
  page,
  megyeKod,
  oevkKod,
  valasztasAzonosito = 'onk2019'
}) => (
  getParamsString(valasztasAzonosito)({
    // 									|        onk2019          |         ogy2018         |      idbo620       |
    path:               [ `szavazokorok_onk2019`, 'szavazokori-eredmenyek', 'orszaggyulesi-valasztasok1/borsod-abauj-zemplen-6.-oevk-20201011' ],
    preIdStart:         [ 'onkszavazokorok',      'szavazokorok',           'iogyszavazokorok'   ],
    ppParams: {
      lifecycle: 				[ 1,                      0,                          1                  ],
      state: 						[ 'maximized',            'normal',                  'maximized'         ],
      mode: 						[ 'view',                 'view',                    'view'              ],
      col_id: 					[ 'column-2',             'column-2',                'column-3'          ],
      col_count: 				[ 1,                      2,                          5                  ],
      col_pos:          [ undefined,              1,                          1                  ],
    },
    prefixedParams: {
      delta: 						[ 20,                     20,                         20,                      ],
      vlId:							[ 294,                    244,                        321,                     ],
      vltId:						[ 687,                    556,                        836,                     ],
      keywords: 				[ '',                     '',                         '',                      ],
      megyeKod2: 				[ megyeKod,               megyeKod,                   '05',                    ],
      advancedSearch: 	[ 'false',                'false',                    'false',                 ],
      andOperator: 			[ 'true',                 'true',                     'true',                  ],
      searchSortType: 	[ 'asc',                  'asc',                      'asc',                   ],
      searchSortColumn: [ 'SZAVAZOKOR_CIME',      'SZAVAZOKOR_CIME',          'SZAVAZOKOR_CIME',       ],
      oevkKod:          [ undefined,              oevkKod,                    undefined,               ],
      resetCur: 				[ false,                  false,                      false,                   ],
      wardClean:        [ undefined,              false,                      undefined,               ],
      wardSettlement:   [ undefined,              false,                      undefined,               ],
      valasztasIntegralt:[undefined,              false,                      undefined,               ],
      cur: 							[ page,                   `${page}${pPostogy2018}`,   `${page}${pPostidbo620}`,],
    }
  })
)

export const getPolygonUrl = ({
  telepulesKod,
  megyeKod,
  szavkorSorszam,
  valasztasAzonosito = 'onk2019'
}) => (
  getParamsString(valasztasAzonosito)({
    // 									|            onk2019             |             ogy2018            |             idbo620
    path:               [ `szavazokorok_onk2019`,         'szavazokori-eredmenyek',        'orszaggyulesi-valasztasok1/borsod-abauj-zemplen-6.-oevk-20201011', ],
    preIdStart:         [ 'onkszavazokorieredmenyek',     'ogyszavazokorieredmenyek',      'iogyszavazokorieredmenyek',    ],
    ppParams: {
      lifecycle:        [ 2,                              2,                               2,                               ],
      state:            [ 'maximized',                    'maximized',                     'maximized',                     ],
      mode:             [ 'view',                         'view',                          'view',                          ],
      resource_id:      [ 'resourceIdGetElectionMapData', 'resourceIdGetElectionMapData',  'resourceIdGetElectionMapData',  ],
      cacheability:     [ 'cacheLevelPage',               'cacheLevelPage',                'cacheLevelPage',                ],
    },
    prefixedParams: {
      telepulesKod:     [ telepulesKod,                   telepulesKod,                    telepulesKod,                    ],
      megyeKod:         [ megyeKod,                       megyeKod,                        megyeKod,                        ],
      vlId:							[ 294,                            244,                             321,                             ],
      vltId:						[ 687,                            556,                             836,                             ],	
      szavkorSorszam:   [ szavkorSorszam,                 szavkorSorszam,                  szavkorSorszam                   ],
      tabId:            [ 'tab2',                         'tab2',                          undefined                        ],
    }
  })
)

export const getUtcaKeresoUrl = ({
  telepulesKod,
  megyeKod,
  keywords,
  valasztasAzonosito = 'onk2019'
}) => (
  getParamsString(valasztasAzonosito)({
    // 									| onk2019 |        
    path:               [ `szavazohelyiseg-kereso_onk_2019` ],
    preIdStart:         [ 'wardsearch' ],
    ppParams: {
      lifecycle:        [ 2 ],
      state:            [ 'normal' ],
      mode:             [ 'view' ],
      resource_id:      [ 'resourceIdGetUtcaKozterulet' ],
      cacheability:     [ 'cacheLevelPage' ],
      col_id:           [ 'column-2' ],
      col_count:        [ 1 ]
    },
    prefixedParams:{
      vlId:							[ 294 ],
      vltId:						[ 687 ],	
      telepulesKod:     [ telepulesKod ],
      megyeKod:         [ megyeKod ],
      keywords:         [ keywords ]  // Bástya utca
    }
  })
)

export const getHazszamKeresoUrl = ({
  telepulesKod,
  megyeKod,
  kozterNev, // Bástya
  kozterJelleg, // utca
  keywords, // 1, 2 ...
  valasztasAzonosito = 'onk2019'
}) => (
  getParamsString(valasztasAzonosito)({
    // 									| onk2019 |        
    path:               [ `szavazohelyiseg-kereso_onk_2019` ],
    preIdStart:         [ 'wardsearch' ],
    ppParams: {
      lifecycle:        [ 2 ],
      state:            [ 'normal' ],
      mode:             [ 'view' ],
      resource_id:      [ 'resourceIdGetHazszam' ],
      cacheability:     [ 'cacheLevelPage' ],
      col_id:           [ 'column-2' ],
      col_count:        [ 1 ]
    },
    prefixedParams: {
      vlId:							[ 294 ],
      vltId:						[ 687 ],	
      telepulesKod:     [ telepulesKod ],
      megyeKod:         [ megyeKod ],
      kozterNev:        [ kozterNev ],
      kozterJelleg:     [ kozterJelleg ],
      keywords:         [ keywords ]
    }
  })
)

export const getPreIdByContext = ({
  valasztasAzonosito = 'onk2019',
  context = 'szavazokorUrl'
}) => {
  const preIdStart = {
    // 									|          onk2019          |           ogy2018         |            idbo620         |
    szavazokorUrl:      [ 'onkszavazokorieredmenyek', 'ogyszavazokorieredmenyek', 'iogyszavazokorieredmenyek',]
  }
  return getPreId(preIdStart[context], valasztasAzonosito)
}