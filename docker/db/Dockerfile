FROM mysql:8.0
MAINTAINER docker-db

COPY ./my.cnf /etc/mysql/my.cnf

RUN mkdir -p /var/lib/mysql-files
RUN mkdir /var/log/mysql
RUN chown mysql:mysql /var/log/mysql
