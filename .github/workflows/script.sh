curl --location --transaction POST 'http://157.230.45.203:9000/api/endpoints/2/docker/images/create?fromImage=chunwarayut%2Fag-microservice:latest' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJtZWVwb29uZyIsInJvbGUiOjEsImV4cCI6MTYyMzI4NTQ5MX0.RCvHLKlpMSlThh4gVtex9mpOdEi57UBvOu9j7Qv1Mvs' \
--header 'Content-Type: application/json' \
--data-raw '{
    "fromImage": "chunwarayut/ag-microservice:latest"
}'
