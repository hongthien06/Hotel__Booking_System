# BACKUP DATABASE PROD

### Tạo thư mục backup trong container

```bash
docker exec hbms-sqlserver mkdir -p /var/opt/mssql/backup
```

### Backup database hiện tại (Chạy trên một dòng)

```bash
docker exec hbms-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Hbms@2026!" -No -Q "BACKUP DATABASE HotelBookingDB TO DISK='/var/opt/mssql/backup/hotel_backup.bak' WITH FORMAT, INIT"
```

### Sao chép file backup ra máy Host (Windows)

```bash
docker cp hbms-sqlserver:/var/opt/mssql/backup/hotel_backup.bak D:/Nam2/backup/hotel_backup_20260610.bak
```

# RESTORE DATABASE

### Sao chép file .bak từ máy Host vào container

```bash
docker cp D:/Nam2/backup/hotel_backup_20260610.bak hbms-sqlserver:/var/opt/mssql/backup/hotel_backup.bak
```

### Thực hiện Restore trong container (Chạy trên một dòng)

```bash
docker exec hbms-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Hbms@2026!" -No -Q "ALTER DATABASE HotelBookingDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE; RESTORE DATABASE HotelBookingDB FROM DISK='/var/opt/mssql/backup/hotel_backup.bak' WITH REPLACE, RECOVERY; ALTER DATABASE HotelBookingDB SET MULTI_USER;"
```


