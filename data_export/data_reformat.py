import json

def parse_entry(entry):
    """
    """
    data = tuple({'region': entry.get('name'), 'year': el.get('year'), 'count': el.get('val')} for el in entry.get('values'))
    return data

def main():
    """
    docstring
    """
    with open('data_export/raw_data.json', 'r') as f:
        raw_data = json.loads(f.read())
    print(raw_data.keys())

if __name__ == "__main__":
    main()