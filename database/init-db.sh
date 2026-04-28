#!/bin/bash
SQL_FILE="/docker-entrypoint-initdb.d/HotelBookingDB.sql"
DB_NAME="HotelBookingDB"
SA_PASS="${MSSQL_SA_PASSWORD}"
MAX_ATTEMPTS=60
INTERVAL=2

log() { echo "[HBMS-INIT] $1"; }

if [ ! -f "$SQL_FILE" ]; then
    log "LỖI: Không tìm thấy $SQL_FILE"
    exit 1
fi
log "File SQL: OK"

log "Đợi SQL Server khởi động..."
i=0
while [ $i -lt $MAX_ATTEMPTS ]; do
    i=$((i+1))
    if /opt/mssql-tools18/bin/sqlcmd \
        -S localhost -U sa -P "$SA_PASS" \
        -Q "SELECT 1" -No -C > /dev/null 2>&1; then
        log "SQL Server sẵn sàng (lần thử $i)"
        break
    fi
    [ $i -ge $MAX_ATTEMPTS ] && { log "LỖI: Timeout"; exit 1; }
    sleep $INTERVAL
done

log "Đang nạp script SQL '$SQL_FILE'..."
if /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "$SA_PASS" \
    -i "$SQL_FILE" -b -No -C; then
    log "Nạp script thành công!"
else
    log "LỖI khi chạy SQL!"
    exit 1
fi

log "Init hoàn thành."