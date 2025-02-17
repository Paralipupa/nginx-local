#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR

# Создание приватного ключа и запроса на подпись сертификата (CSR) для промежуточного сертификата:
openssl req -config intermediate.cnf -new -keyout ../intermediate.key -out ../intermediate.csr -nodes
# Создание и подпись промежуточного сертификата корневым CA:
openssl x509 -req -in ../intermediate.csr -CA ../rootCA.crt -CAkey ../rootCA.key -CAcreateserial -out ../intermediate.crt -days 3650 -sha256 -extfile intermediate.cnf -extensions intermediate_req_extensions
