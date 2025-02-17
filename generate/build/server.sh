#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR

# Создание приватного ключа и запроса на подпись сертификата (CSR) для конечного сертификата:
openssl req -config server.cnf -new -keyout ../server.key -out ../server.csr -nodes
# Создание и подпись конечного сертификата промежуточным CA:
openssl x509 -req -in ../server.csr -CA ../intermediate.crt -CAkey ../intermediate.key -CAcreateserial -out ../server.crt -days 365 -sha256 -extfile server.cnf -extensions server_req_extensions
# Создание цепочки сертификатов
cat ../intermediate.crt ../rootCA.crt > ../server.chain.pem
