FROM jwilder/nginx-proxy

RUN apt-get update && \
    apt-get install -y curl iputils-ping dnsutils net-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY conf.d/ /etc/nginx/conf.d/
