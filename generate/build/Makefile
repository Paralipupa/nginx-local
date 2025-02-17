# Makefile для генерации и установки SSL сертификатов
# Автор: Claude&Co
# Описание: Автоматизация процесса создания wildcard сертификатов и их установки

# Определяем пути к директориям
CERT_BUILD_DIR := .
CERT_OUTPUT_DIR := ..
CERT_INSTALL_DIR := ../../certs

# Целевые файлы сертификатов
CERTS := $(CERT_OUTPUT_DIR)/wildcard.crt \
         $(CERT_OUTPUT_DIR)/wildcard.key \
         $(CERT_OUTPUT_DIR)/wildcard.csr \
         $(CERT_OUTPUT_DIR)/dhparam.pem

# Установочные файлы
INSTALL_FILES := $(CERT_INSTALL_DIR)/default.crt \
                 $(CERT_INSTALL_DIR)/default.key \
                 $(CERT_INSTALL_DIR)/dhparam.pem

.PHONY: all clean install

# Основная цель - создание всех сертификатов
all: $(CERTS) install

# Создание wildcard сертификата и ключа
$(CERT_OUTPUT_DIR)/wildcard.csr $(CERT_OUTPUT_DIR)/wildcard.key:
	openssl req -new -nodes \
		-out $(CERT_OUTPUT_DIR)/wildcard.csr \
		-keyout $(CERT_OUTPUT_DIR)/wildcard.key \
		-config wildcard.cnf

# Подписание сертификата корневым CA
$(CERT_OUTPUT_DIR)/wildcard.crt: $(CERT_OUTPUT_DIR)/wildcard.csr
	openssl x509 -req \
		-in $(CERT_OUTPUT_DIR)/wildcard.csr \
		-CA $(CERT_OUTPUT_DIR)/rootCA.crt \
		-CAkey $(CERT_OUTPUT_DIR)/rootCA.key \
		-CAcreateserial \
		-out $(CERT_OUTPUT_DIR)/wildcard.crt \
		-days 500 -sha256 \
		-extfile wildcard.cnf \
		-extensions v3_req

# Генерация DH параметров
$(CERT_OUTPUT_DIR)/dhparam.pem:
	openssl dhparam -out $@ 2048

# Установка сертификатов в целевую директорию
install: $(CERTS)
	@mkdir -p $(CERT_INSTALL_DIR)
	cp $(CERT_OUTPUT_DIR)/dhparam.pem $(CERT_INSTALL_DIR)/dhparam.pem
	cp $(CERT_OUTPUT_DIR)/wildcard.crt $(CERT_INSTALL_DIR)/default.crt
	cp $(CERT_OUTPUT_DIR)/wildcard.key $(CERT_INSTALL_DIR)/default.key

# Очистка сгенерированных файлов
clean:
	rm -f $(CERTS) $(INSTALL_FILES) 