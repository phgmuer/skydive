# Fallschirmspringer Logbuch


## Management Summary

Als ambitionierter Fallschirmspringer und ehemaliger Schweizermeister im Freefly Skydiving weiss ich um die
Wichtigkeit des korrekten führens eines Sprung-Logbuchs, um jeden Fallschirmsprung nachvollziehen zu können.
Dies wird meistens schriflich (offline) gemacht. In dieser Projektarbeit erarbeite ich eine online Lösung für
das führen eines Logbuchs für Fallschirmpringer.

Benutzer können sich nach erfolgreicher Registration ihre Sprünge mit Datum und Beschreibung speichern
und anzeigen lassen.



## Anwendung

### Funktionalität

Benutzer können sich mit Email, Benutzernamen und Password registrieren, und
sich nach der registrierung entweder mittels des Benutzernamens oder der Email Adresse
einloggen.

Nach erolgreichem Login, kann der User:
* Auflisten aller Sprünge.
* Hinzufügen neuer Sprünge zum Logbuch.




## Infrastruktur

Die App wird auf AWS gehosted, mit zwei Komponenten:
* EC2 Serving Instanz.
* EDS Postgres Datenbank,

AWS ist der Marktführer im Cloud Computing und bietet ein umfangreiches Angebot sowie viele Resourcen und Dokumentationen zur Verfügung.
Die notwendige Konfiguration der beiden Komponenten geschieht einfach über die AWS Webkonsole:
* Erstellen/Starten/Stoppen der EC2 Instanz,
* Öffnen der korrekten Ports,
* Erstellen der Datenbank, sowie erlauben des internen Traffics von der EC2 instanz zur Datenbank.


Die geöffeten Ports erlauben folgende Verbindungen
![alt text](doc/img/aws_connectivity.png)

Um einerseits den Zugriff von aussen auf die EC2 Instanz zu erlauben und andererseits von der EC2 Instanz auf die EDS
Datenabnk.


### Serving

Ich clone das komplette GIT Repository direkt auf die EC2 Maschine. Dies kann entweder durch das manuelle hochladen
des Repositories (via `zip` file und `scp`) oder mit `git clone` von der EC2 Instanz geschehen.

Danach installiere ich manuell `docker`, `python` und `docker-compose` (via `yum` und `pip3`) und
füge füge den EC2 user zur korrekten Gruppe hinzu (von [hier](https://gist.github.com/diegopacheco/a63abbdb128592a758687d222bbd3392)).

Danach starte ich die serving Instanz mittels `docker-compose up --build` und der Konfugrationsdatei
[docker-compose](https://github.com/phgmuer/skydive/blob/main/docker-compose.yml).

In der `docker-compose.yml` sind drei kleine Änderungen zwischen der lokalen Entwicklungsumgebung markiert.
Der wichtigste davon ist das Ausführen von `npm build` anstelle von `npm start`. Die entsprechenden
`npm` Befehle sind im [package.json](https://github.com/phgmuer/skydive/blob/main/client/package.json) definiert.

In der `npm start` (zur lokalen Entwicklung) werden die Frontend Anfragen direkt von `react-scripts` beantwortet,
und änderungen am Skript werden so direkt ausgeführt.

Mit `npm build` hingegen, werden die `react` komponenten lediglich vorbereitet und dann durch den
statischen HTTP Server `serve` zur Verfügung gestellt.

Mehr Details finden sich in der offiziellen `react` Dokumentation [hier](https://create-react-app.dev/docs/deployment/).
 

Zu einem späteren Zeitpunkt sollten das erstellen/kreieren des Docker Images ausserhalb der Serving Infrastruktur
geschehen um die einzelnen Komponenten besser zu isolieren. 



### Postgres

Postgres wurde mehrheitlich gewählt weil es eine modernere Alternative zu MySQL ist. Desweiteren ist die lokale Installation
für das testen und iterieren während der Entwicklung sehr einfach.
Die gleiche Funktionalität könnte aber auch gut durch eine andere Datenbank Lösung abgedeckt werden, und die Code-Anpassungen wären minimal.

Die Befehle zur Erstellung der notwendigen Tabellen finden sich in https://github.com/phgmuer/skydive/blob/main/api/database/init.sql

Da die Datenbank nur von der EC2 Instanz erreichbar ist (nicht aber von extern), muss zum Installieren zuerst via
SSH auf die EC2 Instanz verbunden werden und danach den Postgres Client von AWS zu installieren um damit die `init.sql`
Befehle auszuführen.

```shell script
$ PGPASSWORD=<DatenbankPassword> psql -U postgres -h  <DatenbankHost>  -f init.sql
$ sudo amazon-linux-extras install postgresql10
```

Die Platzhalter `DatenbankPassword` und `DatenbankHost` sind mit den entsprechenden Werten zu ersetzen.

Neben dem erstellen der Datenbank und Tabellen, kreiert obiges Skript ebenfalls secondary Indizes auf den Tabellen:
* `sessions` für Spalte `session_token`,
*  `jump` für Spalte `user_id`),
*  `accounts` für Spalte `username`.

Die Indizes reflektieren die verwendeten Zugriffsformen auf die Datenbanken (abgesehen der Primary Keys), und stellt
einen schnellen Zugriff sicher.
Mit der aktuell geringen Datenmengen wären sie jedoch nicht nötig.
