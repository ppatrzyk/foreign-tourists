import requests
import json

HEADERS = {'X-ClientId': '7cdd07b1-a88d-46ab-aace-08d87d719481'}
FORMAT_PARAMS = {
    'format': 'json',
    'page-size': 100,
}

# Docs:
# https://api.stat.gov.pl/Home/BdlApi

# links to variables are here, take all one call sufficient
# https://bdl.stat.gov.pl/api/v1/variables?subject-id=P2759&format=json&page-size=100
    
# loop through all ids e.g. 148074
# these will have more than one page
# https://bdl.stat.gov.pl/api/v1/data/by-variable/148095?format=json&page=0&page-size=100

def get_variables():
    """
    list of variables from given 'topic'
    """
    url = 'https://bdl.stat.gov.pl/api/v1/variables'
    params = {
        **FORMAT_PARAMS,
        'subject-id': 'P2759',
    }
    result = requests.get(url, params=params, headers=HEADERS)
    data = result.json()
    return data

def main():
    """
    data export
    """
    data = get_variables()
    print(json.dumps(data, indent=4))

if __name__ == "__main__":
    main()
