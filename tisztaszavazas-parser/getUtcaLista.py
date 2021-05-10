# coding=utf-8
#!/usr/bin/python3

import re
import logging


# https://regex101.com/r/vahPd7/8

# pylint: disable=locally-disabled, anomalous-backslash-in-string

regex = re.compile(
  "^"             # start of line
  # Get rid of whitespace before address
  "(?:"  			    # non-capturing group start
    "\s*"  		    # any white space between zero and unlimited times
  ")" 				    # non-capturing group end
  "?" 				    # zero or one times
  
  # Non capturing group for expressions which match the regex
  "(?:"  			    # non-capturing group start

    # Street name (named capturing group: kozteruletNev)
    "(?P<kozteruletNev>"           # named capturing group starts
      "[^\d]+"    # any non-digit character
    ")"           # capturing group ends

    # Optional house numbering for splitted streets. Otherwise only a street name is indicated.
    "(?:" 			  # non-capturing group start

      # OR group for HRSZ or number
      "(?:" 			  # non-capturing group start
        "(?P<from_hrsz>"   # named capturing group
          #hrsz_regex starts,
          "\d{4,}"          # number with at lease 4 digits

          # "alátörés"
          "(?:\/\d{1,3})"   # a slash follwed by a 1-3 digits number
          "{0,3}?"          # zero of four times

          # building and flat
          "(?:"             # optional non-captureing group starts
            "\/[A-Z]"       # slash followed by a single capital character
            "(?:"           # optional non-captureing group starts
              "\/\d{1,3}"   # slash followed by an 1-3 digit number
            ")?"            # optional non-capturing group ends
          ")?"              # optional non-capturing group ends          
          #hrsz_regex ends,
        ")"
        "|"      
        # normal house number
        "(?:" 			# non-capturing group start

          # Capture starting house number 
          "(?P<kezdoHazszam>"         # named capturing group starts
            #hazszam_regex starts
            "\d{1,4}"      # any number with 1-4 digits (avoid matching with "/"-less hrsz)
            "\\b"      # end of word, avoid matching first n digits of a long number
            #hazszam_regex ends
          ")"         # capturing group ends

          # Any character after first digit and before dash
          "(?:" 			# non-capturing group starts
            ".*"      # any character between zero to unlimited times
          ")"         # non-capturing group ends
        ")"         # non-capturing group ends
      ")"         # non-capturing group ends

      # Dash between starting and ending house number groups.
      # It looks always like this and it is always present.
      "(?:" 			# non-capturing group starts
        "\s-\s"   # whitespace, dash, whitespace
      ")"         # non-capturing group ends

     
      "(?:"          # or wrapping group starts
        # Infinte ending number
        "(?P<to_infinite>"   # named capturing group
          "(?:999999 9|999998 9)"
        ")"
        "|"         # OR
        
        # Capture hrsz
        "(?P<to_hrsz>"   # named capturing group
            #hrsz_regex starts,
            "\d{4,}"          # number with at lease 4 digits

            # "alátörés"
            "(?:\/\d{1,3})"   # a slash follwed by a 1-3 digits number
            "{0,3}?"          # zero of four times

            # building and flat
            "(?:"             # optional non-captureing group starts
              "\/[A-Z]"       # slash followed by a single capital character
              "(?:"           # optional non-captureing group starts
                "\/\d{1,3}"   # slash followed by an 1-3 digit number
              ")?"            # optional non-capturing group ends
            ")?"              # optional non-capturing group ends          
            #hrsz_regex ends,
        ")"
        "|"         # OR

        # Capture second number from multiple house number
        "(?:"         # OR group starts
          "(?:"       # optional group starts
            "\d+"     # number with 1 or more digit
            "-"       # dash
          ")?"        # optional group ends
          "(?P<vegsoHazszamMulti>"         # named capturing group starts
            #hazszam_regex starts
            "\d{1,4}"      # any number with 1-4 digits (avoid matching with "/"-less hrsz)
            "\\b"      # end of word, avoid matching first n digits of a long number
            #hazszam_regex ends
          ")"         # capturing group ends
        ")"           # OR group ends
        "|"           # OR

        # Capture simple house number 
        "(?P<vegsoHazszamSingle>"         # named capturing group starts
          #hazszam_regex starts
          "\d{1,4}"      # any number with 1-4 digits (avoid matching with "/"-less hrsz)
          "\\b"      # end of word, avoid matching first n digits of a long number
          #hazszam_regex ends
        ")"         # capturing group ends
      ")"             # or wrapping group ends
    ")?"           # non-capturing group end
  ")"           # non-capturing group end
)

# pattern = ''.join(regex_parts)
#print(pattern)
# regex = rf"{pattern}"

def emptyOrStrip(string):
  return "" if not string else string.strip()

def isInt(value):
  try:
    int(value)
    return True
  except ValueError:
    return False

def intOrFallback(string, fb_value = None):
  result = int(string.replace(' ', '')) if string and isInt(string.replace(' ', '')) else fb_value
  return 9999 if (result and (result > 999999)) else result

def getGroupOrFallbackGroup(groupIndex, fbGroupIndex, matches):
  return emptyOrStrip(matches.group(groupIndex)) if emptyOrStrip(matches.group(groupIndex)) else emptyOrStrip(matches.group(fbGroupIndex))

def getUtcaLista(soup):
  logging.info('---getUtcaLista---')
  completeSettlement = soup.findAll("div", {"class": "nvi-complete-settlement-wrapper"})

  if completeSettlement:
    return {
      "kozteruletek": []
      }

  utcaList = soup.findAll("div", {"class": "nvi-search-list"})[0] \
  .findAll("div", {"class": "nvi-custom-table"})[0] \
  .findAll("table", {"class": "table"})[0] \
  .findAll("tr")

  logging.info('utcaList')
  logging.info(utcaList)

  def getUtcaNev(tRow):
    utcanev = tRow.findAll("div", {"class": "span6"})[0] \
    .getText() 

    return utcanev

  def getHazszamok(tRow):
    hazszamok = tRow.findAll("div", {"class": "span6"})[1] \
    .getText()

    return hazszamok
  
  utcaListPairs = []

  for item in utcaList:
    szkUtca = getUtcaNev(item)[8:]
    szkHazszamok = getHazszamok(item)[22:]

    matches = re.match(regex, szkUtca)

    kozteruletNev = getGroupOrFallbackGroup('kozteruletNev', 0, matches)
    kezdoHazszam = None if matches.group('from_hrsz') else intOrFallback(matches.group('kezdoHazszam'), 0)
    vegsoHazszam = None if matches.group('to_hrsz') else intOrFallback(matches.group('vegsoHazszamSingle') or matches.group('vegsoHazszamMulti'), None)
    vegsoHazszam = 9999 if matches.group('to_infinite') else vegsoHazszam
    megjegyzes = szkHazszamok.strip()

    fullStreet = not matches.group('to_hrsz') and not matches.group('to_infinite') and not matches.group('vegsoHazszamSingle') and not matches.group('vegsoHazszamMulti')

    if fullStreet:
      vegsoHazszam = 9999

    if megjegyzes == "Teljes közterület":
      kezdoHazszam = 0
      vegsoHazszam = 9999

    utcaListItem = {
      "leiras": szkUtca.strip(),
      "kozteruletNev": kozteruletNev,
      "kezdoHazszam": kezdoHazszam,
      "vegsoHazszam": vegsoHazszam,
      "megjegyzes": szkHazszamok.strip()
    }
    logging.info(utcaListItem)
    utcaListPairs.append(utcaListItem)

  logging.info(utcaListPairs)
    
  return {
    "kozteruletek": utcaListPairs
    }
  