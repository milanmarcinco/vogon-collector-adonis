source .env

payload='{
	"address": "A0:B7:65:24:E0:70",
	"sensor": 1,
	"parameter": 1,
	"value": 0
}'

mosquitto_pub -h 192.168.12.85 -p 8002 \
  -t 'vogonair/A0:B7:65:24:E0:70/raw' -q 1 -m "$payload" \
  --cafile infra/certs/ca.pem \
  --cert infra/certs/client.pem \
  --key infra/certs/client.key \
  -d -V mqttv5
