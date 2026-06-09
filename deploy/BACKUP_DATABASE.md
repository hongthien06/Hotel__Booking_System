# BACKUP DATABASE PROD

### tạo thư mục backup

sudo docker exec hbms-sqlserver mkdir -p /var/opt/mssql/backup

### backup db hiện tại

sudo docker exec hbms-sqlserver /opt/mssql-tools18/bin/sqlcmd \
 -S localhost -U sa -P "PASSWORD" -No \
 -Q "BACKUP DATABASE HotelBookingDB TO DISK='/var/opt/mssql/backup/hotel*backup*<DATE>.bak'"

### move ra máy host

sudo docker cp hbms-sqlserver:/var/opt/mssql/backup/hotel*backup_20260609.bak ~/database/hotel_backup*<DATE>.bak

# RESTORE DATABASE

### move .bak vào container

sudo docker cp ~/database/hotel*backup_20260609.bak hbms-sqlserver:/var/opt/mssql/backup/hotel_backup*<DATE>.bak

### Restore

sudo docker exec hbms-sqlserver /opt/mssql-tools18/bin/sqlcmd \
 -S localhost -U sa -P "PASSWORD" -No \
 -Q "RESTORE DATABASE HotelBookingDB FROM DISK='/var/opt/mssql/backup/hotel_backup_20260609.bak' WITH REPLACE, RECOVERY"
