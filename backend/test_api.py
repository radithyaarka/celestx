import requests
import json

url = "http://localhost:8000/predict-user"
data = {"tweets": ["saya merasa sangat sedih hari ini", "tidak ada minat lagi dalam hidup"]}
headers = {"Content-Type": "application/json"}

try:
    print("\n--- Testing /predict-user ---")
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(response.status_code)
    print(json.dumps(response.json(), indent=2))

    print("\n--- Testing /explain ---")
    explain_url = "http://localhost:8000/explain"
    explain_data = {"text": "saya merasa sangat sedih hari ini"}
    response = requests.post(explain_url, data=json.dumps(explain_data), headers=headers)
    print(response.status_code)
    # Just print first few words of explanation to avoid huge output
    res_json = response.json()
    print(f"Text: {res_json['text']}")
    print(f"Explanation (first 3): {res_json['explanation'][:3]}")
except Exception as e:
    print(f"Error: {e}")
