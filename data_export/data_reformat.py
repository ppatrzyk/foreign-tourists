import json

def main():
    """
    docstring
    """
    with open('data_export/raw_data.json', 'r') as f:
        raw_data = json.loads(f.read())
    print(raw_data.keys())

if __name__ == "__main__":
    main()