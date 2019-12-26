drop database cipher;
create database cipher;
use cipher;

create table user (
    email varchar(255),
    username varchar(15),
    primary key (email, username)
);