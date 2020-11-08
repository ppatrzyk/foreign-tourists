import json
import pandas as pd

with open('data_export/country_codes.json', 'r') as f:
    COUNTRY_CODES = json.loads(f.read())
WOJEWODZTWA = (
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
    country_mapping = {val.get('pl'): key for key, val in COUNTRY_CODES.items()}
    with open('data_export/raw_data.json', 'r') as f:
        raw_data = json.loads(f.read())
    formatted_data = []
    for country, data in raw_data.items():
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
    all_data = {'bywojewodztwo': {}, 'bycountry': {}, 'total': {}}
    df = load_all_data()
    df = df[df.country != 'TOTAL']
    total = df[df.region == 'POLSKA']
    df = df[df.region.isin(WOJEWODZTWA)]
    years = tuple(df.year.unique())

    total = pd.merge(
        total,
        total.groupby('year').sum('count').reset_index().rename({'count': 'year_total'}, axis=1),
        on='year',
        how='left'
    )
    total['year_prop'] = total['count'] / total['year_total']
    retain_keys = ('country', 'year', 'count', 'year_prop')
    data = tuple({key: val for key, val in entry.items() if key in retain_keys} for index, entry in total.to_dict(orient='index').items())
    for year in years:
        all_data['total'][year] = tuple(el for el in data if el.get('year') == year)
    
    for wojewodztwo in WOJEWODZTWA:
        woj_data = df[df.region == wojewodztwo]
        woj_data = pd.merge(
            woj_data,
            woj_data.groupby('year').sum('count').reset_index().rename({'count': 'year_total'}, axis=1),
            on='year',
            how='left'
        )
        woj_data['year_prop'] = woj_data['count'] / woj_data['year_total']
        retain_keys = ('country', 'year', 'count', 'year_prop')
        data = tuple({key: val for key, val in entry.items() if key in retain_keys} for index, entry in woj_data.to_dict(orient='index').items())
        all_data['bywojewodztwo'][wojewodztwo] = {}
        for year in years:
            all_data['bywojewodztwo'][wojewodztwo][year] = tuple(el for el in data if el.get('year') == year)
    
    for country in COUNTRY_CODES.keys():
        country_data = df[df.country == country]
        country_data = pd.merge(
            country_data,
            country_data.groupby('year').sum('count').reset_index().rename({'count': 'year_total'}, axis=1),
            on='year',
            how='left'
        )
        country_data['year_prop'] = country_data['count'] / country_data['year_total']
        retain_keys = ('region', 'year', 'count', 'year_prop')
        data = tuple({key: val for key, val in entry.items() if key in retain_keys} for index, entry in country_data.to_dict(orient='index').items())
        all_data['bycountry'][country] = {}
        for year in years:
            all_data['bycountry'][country][year] = tuple(el for el in data if el.get('year') == year)
    
    with open('data_export/tourists_clean.json', 'w') as out_file:
        out_file.write(json.dumps(all_data))


if __name__ == "__main__":
    main()
