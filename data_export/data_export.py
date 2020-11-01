import requests
import json
from math import ceil

HEADERS = {'X-ClientId': '7cdd07b1-a88d-46ab-aace-08d87d719481'}
PAGE_SIZE = 100
FORMAT_PARAMS = {
    'format': 'json',
    'page-size': PAGE_SIZE,
}

# Docs:
# https://api.stat.gov.pl/Home/BdlApi

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
    # tuple of (variable_id, country_name) tuples
    data = tuple((el.get('id'), el.get('n2')) for el in response.json().get('results'))
    return data

def get_country_data(variable_id):
    """
    get data for one country (country=variable_id)
    all powiats/years returned here
    """
    url = f'https://bdl.stat.gov.pl/api/v1/data/by-variable/{variable_id}'
    response = requests.get(url, params=FORMAT_PARAMS, headers=HEADERS)
    total = response.json().get('totalRecords')
    pages = ceil(total / PAGE_SIZE)
    country_data = []
    for page in range(pages):
        print(f'page {page}/{pages}\r')
        params = {
            **FORMAT_PARAMS,
            'page': page,
        }
        response = requests.get(url, params=params, headers=HEADERS)
        country_data.append(response.json().get('results'))
    return country_data

def main():
    """
    data export
    """
    country_ids = get_country_ids()
    all_data = dict()
    for variable_id, country in country_ids:
        print('\n' + '-'*50 + f'\n{country}\n' + '-'*50 + '\n')
        country_data = get_country_data(variable_id)
        all_data[country] = country_data
    with open('data_export/raw_data.json', 'w', encoding='utf-8') as f:
        f.write(json.dumps(all_data))
    return True

if __name__ == "__main__":
    main()
