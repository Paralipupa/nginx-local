# Makefile для генерации и установки SSL сертификатов
# Автор: Claude&Co
# Описание: Автоматизация процесса создания wildcard сертификатов и их установки

# Определяем пути к директориям
CERT_BUILD_DIR := generate/build
CERT_OUTPUT_DIR := generate
CERT_INSTALL_DIR := certs

# Настройки сертификата (можно переопределить через make)
# CA Defaults (Подписант)
# CA_NAME ?= Тестовый УЦ ООО "КРИПТО-ПРО"
# CA_OGRN ?= 1234567890123
# CA_INN ?= 001234567890
# CA_O ?= ООО "КРИПТО-ПРО"
# CA_STREET ?= ул. Сущёвский вал д. 18
# CA_L ?= Москва
# CA_ST ?= г. Москва
# CA_C ?= RU

# User Defaults (Владелец)
USER_CN ?= Чипкинеев Александр Альбертович
USER_GN ?= Александр Альбертович
USER_SN ?= Чипкинеев
USER_INN ?= 380801228165
USER_SNILS ?= 03948973214
USER_EMAIL ?= a917kk@mail.ru
USER_O ?= Local Developer
USER_STREET ?= ул.Ясеневая
USER_L ?= Москва
USER_ST ?= 77 г.Москва
USER_C ?= RU

# Доменное имя (Common Name) для сертификата (если нужно отличие от CN пользователя)
# В данном случае CN пользователя - это ФИО, а домен обычно идет в SAN (Subject Alt Names)
# Но если нужен именно домен в CN, можно переопределить USER_CN
# Здесь мы следуем примеру "именного" сертификата, где CN = ФИО.
# Важно: Браузеры смотрят SAN для валидации домена, поэтому CN=ФИО допустимо, если SAN настроен верно.
DOMAIN_CN ?= *.local

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
	@echo "Генерация корневого сертификата (Подписант: $(CA_NAME))..."
	openssl req -x509 -new -nodes -utf8 \
		-key $(CERT_OUTPUT_DIR)/rootCA.key \
		-sha256 -days 1024 \
		-out $@ \
		-config $(CERT_BUILD_DIR)/wildcard.cnf \
		-subj "/C=$(CA_C)/ST=$(CA_ST)/L=$(CA_L)/street=$(CA_STREET)/O=$(CA_O)/ogrn=$(CA_OGRN)/innorg=$(CA_INN)/CN=$(CA_NAME)"

# Создание wildcard сертификата и ключа
$(CERT_OUTPUT_DIR)/wildcard.csr $(CERT_OUTPUT_DIR)/wildcard.key:
	@echo "Генерация CSR (Владелец: $(USER_CN))..."
	openssl req -new -nodes -utf8 \
		-out $(CERT_OUTPUT_DIR)/wildcard.csr \
		-keyout $(CERT_OUTPUT_DIR)/wildcard.key \
		-config $(CERT_BUILD_DIR)/wildcard.cnf \
		-subj "/CN=$(USER_CN)/GN=$(USER_GN)/SN=$(USER_SN)/L=$(USER_L)/street=$(USER_STREET)/C=$(USER_C)/emailAddress=$(USER_EMAIL)/SNILS=$(USER_SNILS)/INN=$(USER_INN)"
# -subj "/C=$(USER_C)/ST=$(USER_ST)/L=$(USER_L)/street=$(USER_STREET)/O=$(USER_O)/CN=$(USER_CN)/GN=$(USER_GN)/SN=$(USER_SN)/emailAddress=$(USER_EMAIL)/snils=$(USER_SNILS)/inn=$(USER_INN)"
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