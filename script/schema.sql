-- Création de la base de données
CREATE DATABASE Akoho;

GO
    -- Utiliser la base
    USE Akoho;

CREATE TABLE Race (id INT IDENTITY(1, 1) PRIMARY KEY,nom VARCHAR(100) NOT NULL,pu_sakafo_par_gramme DECIMAL(10, 2),pv_par_gramme DECIMAL(10, 2),pu_atody DECIMAL(10, 2));

CREATE TABLE Lot (id INT IDENTITY(1, 1) PRIMARY KEY,name VARCHAR(100) NOT NULL,race_id INT NOT NULL,date_achat DATE NOT NULL,nombre_akoho INT NOT NULL,age INT,prix_achat DECIMAL(10, 2),CONSTRAINT FK_Lot_Race FOREIGN KEY (race_id) REFERENCES Race(id));

CREATE TABLE Configuration (id INT IDENTITY(1, 1) PRIMARY KEY,race_id INT NOT NULL,semaine INT NOT NULL,variation_poids DECIMAL(10, 2),sakafo_semaine DECIMAL(10, 2),CONSTRAINT FK_Config_Race FOREIGN KEY (race_id) REFERENCES Race(id));

CREATE TABLE Atody (id INT IDENTITY(1, 1) PRIMARY KEY,lot_id INT NOT NULL,date_production DATE NOT NULL,nombre_atody INT NOT NULL,CONSTRAINT FK_Atody_Lot FOREIGN KEY (lot_id) REFERENCES Lot(id));

CREATE TABLE Akoho_Maty (id INT IDENTITY(1, 1) PRIMARY KEY,lot_id INT NOT NULL,date_maty DATE NOT NULL,nombre INT NOT NULL,CONSTRAINT FK_Maty_Lot FOREIGN KEY (lot_id) REFERENCES Lot(id));

CREATE TABLE Eclosion (id INT IDENTITY(1, 1) PRIMARY KEY,lot_id INT NOT NULL,date_eclosion DATE NOT NULL,nombre_foy INT,CONSTRAINT FK_Eclosion_Lot FOREIGN KEY (lot_id) REFERENCES Lot(id));