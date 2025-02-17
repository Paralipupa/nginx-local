#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR

# Создание приватного ключа и CSR для wildcard сертификата:
openssl req -new -nodes -out ../wildcard.csr -keyout ../wildcard.key -config wildcard.cnf
# Подписание wildcard сертификата с помощью корневого сертификата:
openssl x509 -req -in ../wildcard.csr -CA ../rootCA.crt -CAkey ../rootCA.key -CAcreateserial -out ../wildcard.crt -days 500 -sha256 -extfile wildcard.cnf -extensions v3_req
# Создание dhparam
openssl dhparam -out ../dhparam.pem 2048

cp ../dhparam.pem  ../../certs/dhparam.pem
cp ../wildcard.crt ../../certs/default.crt
cp ../wildcard.key ../../certs/default.key
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR
