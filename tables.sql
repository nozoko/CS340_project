

 CREATE TABLE `Players` (
 `playerID` int NOT NULL AUTO_INCREMENT,
 `email` varchar(50) NOT NULL,
 `firstName` varchar(50) NOT NULL,
 `lastName` varchar(50) NOT NULL,
 `gamerTag` varchar(50) NOT NULL,
 PRIMARY KEY (`playerID`),
 UNIQUE (playerID)
 ) ENGINE=InnoDB;

  CREATE TABLE `Games` (
  `gameID` int NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `genre` varchar(50) NOT NULL,
  `publishers` int NOT NULL,
  PRIMARY KEY (`gameID`),
  FOREIGN KEY(`publishers`) REFERENCES `Publishers` (`publisherID`),
  UNIQUE (gameID)
  ) ENGINE=InnoDB;

  CREATE TABLE `PlayersGames` (
  `playerID` int,
  `gameID` int,
  PRIMARY KEY (`playerID`,`gameID`),
  FOREIGN KEY(`playerID`) REFERENCES `Players` (`playerID`),
  FOREIGN KEY(`gameID`) REFERENCES `Games` (`gameID`)
  ) ENGINE=InnoDB;


/*
DESCRIBE Players;
DESCRIBE Games;
DESCRIBE PlayersGames;
*/



