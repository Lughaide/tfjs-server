(echo -n '{"image": "'; base64 -w 0 dog.png; echo '"}') | curl -H "Content-Type: application/json" -d @- localhost:8080/predict | jq
curl -X POST localhost:8080/figlet -H "Content-Type: application/json" -d '{"text": "Anzio"}' | jq -r .reply
