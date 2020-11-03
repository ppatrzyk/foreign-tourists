import json

def parse_entry(entry):
    """
    """
    assert isinstance(entry, dict), entry
    values = entry.get('values')
    assert isinstance(values, list), values
    data = tuple({'region': entry.get('name'), 'year': el.get('year'), 'count': el.get('val')} for el in values)
    return data

def main():
    """
    docstring
    """
    with open('data_export/raw_data.json', 'r') as f:
        raw_data = json.loads(f.read())
    formattted_data = []
    for country, data in raw_data.items():
        print(country)
        for country_outer in data:
            for el in country_outer:
                try:
                    parsed_entries = parse_entry(el)
                except:
                    print(f'ERROR: {el}')
                    continue
                entries = tuple({'country': country, **el} for el in parsed_entries)
                formattted_data.extend(entries)
    print(len(formattted_data))

if __name__ == "__main__":
    main()