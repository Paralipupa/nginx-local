# Makefile для генерации и установки SSL сертификатов
# Автор: Claude&Co
# Описание: Автоматизация процесса создания wildcard сертификатов и их установки

# Определяем пути к директориям
CERT_BUILD_DIR := generate/build
CERT_OUTPUT_DIR := generate
CERT_INSTALL_DIR := certs

# Целевые файлы сертификатов
ROOT_CA := $(CERT_OUTPUT_DIR)/rootCA.crt $(CERT_OUTPUT_DIR)/rootCA.key
CERTS := $(CERT_OUTPUT_DIR)/wildcard.crt \
         $(CERT_OUTPUT_DIR)/wildcard.key \
         $(CERT_OUTPUT_DIR)/wildcard.csr \
         $(CERT_OUTPUT_DIR)/dhparam.pem

# Установочные файлы
INSTALL_FILES := $(CERT_INSTALL_DIR)/default.crt \
                 $(CERT_INSTALL_DIR)/default.key \
                 $(CERT_INSTALL_DIR)/dhparam.pem

.PHONY: all clean install root-ca

# Основная цель - создание всех сертификатов
all: root-ca $(CERTS) install

# Создание корневого CA если он отсутствует
root-ca: $(ROOT_CA)

$(CERT_OUTPUT_DIR)/rootCA.key:
	@echo "Генерация корневого ключа..."
	@mkdir -p $(CERT_OUTPUT_DIR)
	openssl genrsa -out $@ 4096

$(CERT_OUTPUT_DIR)/rootCA.crt: $(CERT_OUTPUT_DIR)/rootCA.key
	@echo "Генерация корневого сертификата..."
	openssl req -x509 -new -nodes \
		-key $(CERT_OUTPUT_DIR)/rootCA.key \
		-sha256 -days 1024 \
		-out $@ \
		-subj "/C=RU/ST=Moscow/L=Moscow/O=Local Development/OU=IT/CN=Local Root CA"

# Создание wildcard сертификата и ключа
$(CERT_OUTPUT_DIR)/wildcard.csr $(CERT_OUTPUT_DIR)/wildcard.key:
	openssl req -new -nodes \
		-out $(CERT_OUTPUT_DIR)/wildcard.csr \
		-keyout $(CERT_OUTPUT_DIR)/wildcard.key \
		-config $(CERT_BUILD_DIR)/wildcard.cnf

# Подписание сертификата корневым CA
$(CERT_OUTPUT_DIR)/wildcard.crt: $(CERT_OUTPUT_DIR)/wildcard.csr $(ROOT_CA)
	openssl x509 -req \
		-in $(CERT_OUTPUT_DIR)/wildcard.csr \
		-CA $(CERT_OUTPUT_DIR)/rootCA.crt \
		-CAkey $(CERT_OUTPUT_DIR)/rootCA.key \
		-CAcreateserial \
		-out $(CERT_OUTPUT_DIR)/wildcard.crt \
		-days 500 -sha256 \
		-extfile $(CERT_BUILD_DIR)/wildcard.cnf \
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
	rm -f $(CERTS) $(INSTALL_FILES) $(ROOT_CA) $(CERT_OUTPUT_DIR)/*.srl 