import requests
import json

HEADERS = {'X-ClientId': '7cdd07b1-a88d-46ab-aace-08d87d719481'}
FORMAT_PARAMS = {
    'format': 'json',
    'page-size': 100,
}

# Docs:
# https://api.stat.gov.pl/Home/BdlApi
    
# loop through all ids e.g. 148074
# these will have more than one page
# https://bdl.stat.gov.pl/api/v1/data/by-variable/148095?format=json&page=0&page-size=100

def get_country_ids():
    """
    list of variables from given 'topic'
    here one variable is one foreign country
    """
    url = 'https://bdl.stat.gov.pl/api/v1/variables'
    params = {
        **FORMAT_PARAMS,
        'subject-id': 'P2759',
    }
    response = requests.get(url, params=params, headers=HEADERS)
    # tuple of (id, country_name) tuples
    data = tuple((el.get('id'), el.get('n2')) for el in response.json().get('results'))
    return data

def get_country_data():
    """
    get data for one country (country=variable_id)
    all powiats/years returned here
    """
    pass

def main():
    """
    data export
    """
    data = get_country_ids()
    print(json.dumps(data, indent=4))

if __name__ == "__main__":
    main()
