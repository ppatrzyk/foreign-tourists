import json
import pandas as pd

woj = (
    'MAŁOPOLSKIE', 'LUBUSKIE', 'WIELKOPOLSKIE',
    'ZACHODNIOPOMORSKIE', 'DOLNOŚLĄSKIE', 'OPOLSKIE',
    'KUJAWSKO-POMORSKIE', 'POMORSKIE', 'WARMIŃSKO-MAZURSKIE',
    'LUBELSKIE', 'PODKARPACKIE', 'PODLASKIE', 'MAZOWIECKIE',
    'ŚWIĘTOKRZYSKIE', 'ŁÓDZKIE', 'ŚLĄSKIE',
)

def parse_entry(entry):
    """
    """
    assert isinstance(entry, dict), entry
    values = entry.get('values')
    assert isinstance(values, list), values
    data = tuple({'region': entry.get('name'), 'year': el.get('year'), 'count': el.get('val')} for el in values)
    return data

def load_all_data():
    """
    docstring
    """
    with open('data_export/country_codes.json', 'r') as f:
        country_codes = json.loads(f.read())
    country_mapping = {val.get('pl'): key for key, val in country_codes.items()}
    with open('data_export/raw_data.json', 'r') as f:
        raw_data = json.loads(f.read())
    formatted_data = []
    for country, data in raw_data.items():
        print(country)
        country_code = country_mapping[country]
        for country_outer in data:
            for el in country_outer:
                try:
                    parsed_entries = parse_entry(el)
                except:
                    print(f'ERROR: {el}')
                    continue
                entries = tuple({'country': country_code, **el} for el in parsed_entries)
                formatted_data.extend(entries)
    df = pd.DataFrame(formatted_data)
    return df

def main():
    """
    """
    df = load_all_data()
    df = df[df.country != 'TOTAL']
    total = df[df.region == 'POLSKA']
    df = df[df.region.isin(woj)]

    total = pd.merge(
        total,
        total.groupby('year').sum('count').reset_index().rename({'count': 'year_total'}, axis=1),
        on='year',
        how='left'
    )
    total['year_prop'] = total['count'] / total['year_total']

if __name__ == "__main__":
    main()
