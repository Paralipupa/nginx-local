#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR

# Создание приватного ключа и самоподписанного корневого сертификата
# Используйте конфигурационный файл для создания корневого сертификата:
openssl req -x509 -new -nodes -keyout ../rootCA.key -sha256 -days 1024 -out ../rootCA.crt -config rootCA.cnf

