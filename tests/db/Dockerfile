FROM postgres:16.11-bookworm

RUN apt-get update \
  && apt-get install --yes --no-install-recommends postgresql-16-pgtap \
  && rm -rf /var/lib/apt/lists/*
