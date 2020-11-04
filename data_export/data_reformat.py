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
    df = df[df.region.isin(WOJEWODZTWA)]

    total = pd.merge(
        total,
        total.groupby('year').sum('count').reset_index().rename({'count': 'year_total'}, axis=1),
        on='year',
        how='left'
    )
    total['year_prop'] = total['count'] / total['year_total']
    for wojewodztwo in WOJEWODZTWA:
        woj_data = df[df.region == wojewodztwo]
        woj_data = pd.merge(
            woj_data,
            woj_data.groupby('year').sum('count').reset_index().rename({'count': 'year_total'}, axis=1),
            on='year',
            how='left'
        )
        woj_data['year_prop'] = woj_data['count'] / woj_data['year_total']
        # TODO write this data somewhere
        # print('-'*50)
        # print(wojewodztwo)
        # print(woj_data[woj_data.year == '2019'].sort_values('year_prop'))
        # print('-'*50)
    for country in COUNTRY_CODES.keys():
        country_data = df[df.country == country]
        country_data = pd.merge(
            country_data,
            country_data.groupby('year').sum('count').reset_index().rename({'count': 'year_total'}, axis=1),
            on='year',
            how='left'
        )
        country_data['year_prop'] = country_data['count'] / country_data['year_total']
        # TODO write this data somewhere
        # print('-'*50)
        # print(country)
        # print(country_data[country_data.year == '2019'].sort_values('year_prop'))
        # print('-'*50)


if __name__ == "__main__":
    main()
