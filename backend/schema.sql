USE obligatorio_db;

CREATE TABLE IF NOT EXISTS Departamento (
	IdDepartamento INT PRIMARY KEY,
	Nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Localidad (
	IdLocalidad INT PRIMARY KEY,
	Nombre VARCHAR(100) NOT NULL,
	Tipo VARCHAR(50),
	IdDepartamento INT NOT NULL,
	FOREIGN KEY (IdDepartamento) REFERENCES Departamento (IdDepartamento)
);

CREATE TABLE IF NOT EXISTS Zona (
	IdZona INT PRIMARY KEY,
	Nombre VARCHAR(100) NOT NULL,
	IdLocalidad INT NOT NULL,
	FOREIGN KEY (IdLocalidad) REFERENCES Localidad (IdLocalidad)
);

CREATE TABLE IF NOT EXISTS Establecimiento (IdEstablecimiento INT PRIMARY KEY, Nombre VARCHAR(100), Tipo VARCHAR(50), IdZona INT NOT NULL, FOREIGN KEY (IdZona) REFERENCES Zona (IdZona));

CREATE TABLE IF NOT EXISTS Comisaria (NumeroComisaria INT PRIMARY KEY, NombreComisaria VARCHAR(100), IdDepartamento INT NOT NULL, FOREIGN KEY (IdDepartamento) REFERENCES Departamento (IdDepartamento));

CREATE TABLE IF NOT EXISTS Circuito (
	NumeroCircuito INT PRIMARY KEY,
	IdEstablecimiento INT NOT NULL,
	EsAccesible BOOLEAN,
	NumeroDeVotos INT,
	PrimeraCredencial INT,
	UltimaCredencial INT,
	FOREIGN KEY (IdEstablecimiento) REFERENCES Establecimiento (IdEstablecimiento)
);

CREATE TABLE IF NOT EXISTS Mesa (
	IdMesa INT PRIMARY KEY,
	NumeroCircuito INT UNIQUE NOT NULL,
	Estado VARCHAR(50),
	FOREIGN KEY (NumeroCircuito) REFERENCES Circuito (NumeroCircuito)
);

CREATE TABLE IF NOT EXISTS PartidoPolitico (
	IdPartido INT PRIMARY KEY, 
	Direccion VARCHAR(255), 
	Nombre VARCHAR(255)
	);

CREATE TABLE IF NOT EXISTS Lista (
	NumeroLista INT PRIMARY KEY,
	IdPartido INT NOT NULL,
	IdDepartamento INT NOT NULL,
	FOREIGN KEY (IdPartido) REFERENCES PartidoPolitico (IdPartido),
	FOREIGN KEY (IdDepartamento) REFERENCES Departamento (IdDepartamento)
);

CREATE TABLE IF NOT EXISTS Persona (CI INT PRIMARY KEY, CredencialCivica INT UNIQUE NOT NULL, Nombre VARCHAR(100) NOT NULL, Apellido VARCHAR(100) NOT NULL, FechaNacimiento DATE);

CREATE TABLE IF NOT EXISTS Session (SessionId VARCHAR(100) PRIMARY KEY, FechaExpiracion DATE NOT NULL, Utilizado BOOLEAN NOT NULL);

CREATE TABLE IF NOT EXISTS Eleccion (IdEleccion INT PRIMARY KEY, Tipo VARCHAR(50), Fecha DATE NOT NULL);

CREATE TABLE IF NOT EXISTS Votante (
	CIPersona INT PRIMARY KEY,
	NumeroCircuito INT NOT NULL,
	Contrasena VARCHAR(255) NOT NULL,
	Voto BOOLEAN DEFAULT FALSE,
	FOREIGN KEY (CIPersona) REFERENCES Persona (CI),
	FOREIGN KEY (NumeroCircuito) REFERENCES Circuito (NumeroCircuito)
);

CREATE TABLE IF NOT EXISTS MiembroMesa (
	CIPersona INT PRIMARY KEY,
	IdMesa INT NOT NULL,
	OrganismoEstado VARCHAR(100),
	Rol VARCHAR(50),
	Contrasena VARCHAR(255) NOT NULL,
	FOREIGN KEY (CIPersona) REFERENCES Persona (CI),
	FOREIGN KEY (IdMesa) REFERENCES Mesa (IdMesa)
);

CREATE TABLE IF NOT EXISTS AgentePolicial (
	CIPersona INT PRIMARY KEY,
	NumeroComisaria INT NOT NULL,
	IdEstablecimiento INT NOT NULL,
	FOREIGN KEY (CIPersona) REFERENCES Persona (CI),
	FOREIGN KEY (NumeroComisaria) REFERENCES Comisaria (NumeroComisaria),
	FOREIGN KEY (IdEstablecimiento) REFERENCES Establecimiento (IdEstablecimiento)
);

CREATE TABLE IF NOT EXISTS Candidato (
	CIPersona INT,
	IdEleccion INT NOT NULL,
	IdPartido INT NOT NULL,
	PRIMARY KEY (CIPersona, IdEleccion),
	FOREIGN KEY (CIPersona) REFERENCES Persona (CI),
	FOREIGN KEY (IdEleccion) REFERENCES Eleccion (IdEleccion),
	FOREIGN KEY (IdPartido) REFERENCES PartidoPolitico (IdPartido)
);

CREATE TABLE IF NOT EXISTS Integra (
	CIPersona INT NOT NULL,
	NumeroLista INT NOT NULL,
	OrdenLista INT,
	Organo VARCHAR(100),
	PRIMARY KEY (CIPersona, NumeroLista),
	FOREIGN KEY (CIPersona) REFERENCES Persona (CI),
	FOREIGN KEY (NumeroLista) REFERENCES Lista (NumeroLista)
);

CREATE TABLE IF NOT EXISTS Voto (
	IdVoto INT PRIMARY KEY,
	SessionId VARCHAR(100) UNIQUE NOT NULL,
	NumeroLista INT NOT NULL,
	IdEleccion INT NOT NULL,
	NumeroCircuito INT NOT NULL,
	Tipo VARCHAR(50),
	EsObservado BOOLEAN,
	Autorizado BOOLEAN DEFAULT FALSE,
	FOREIGN KEY (SessionId) REFERENCES Session (SessionId),
	FOREIGN KEY (NumeroLista) REFERENCES Lista (NumeroLista),
	FOREIGN KEY (IdEleccion) REFERENCES Eleccion (IdEleccion),
	FOREIGN KEY (NumeroCircuito) REFERENCES Circuito (NumeroCircuito)
);

CREATE TABLE IF NOT EXISTS Token (
	IDToken INT AUTO_INCREMENT PRIMARY KEY,
	CIPersona INT,
	fechaExpiracion DATETIME,
	FOREIGN KEY (CIPersona) REFERENCES Persona (CI)
);