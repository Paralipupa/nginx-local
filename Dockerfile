FROM nginx:1.25

RUN apt-get update && \
    apt-get install -y curl iputils-ping dnsutils net-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
