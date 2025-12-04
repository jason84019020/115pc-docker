#!/bin/sh
#
# restore-groups-and-users.sh
#
# 功能:
# 1. 將系統現有群組與使用者補齊到 /etc/cont-groups.d。
# 2. 避免初始化腳本清空 /etc/group 和 /etc/passwd 後資料消失。
# 3. 已存在的群組/使用者目錄會跳過，不覆蓋原資料。
#
# 使用範例:
#   sudo /usr/local/bin/restore-groups-and-users.sh
#

set -eu

CONTAINER_GROUPS_DIR="/etc/cont-groups.d"
CONTAINER_USERS_DIR="/etc/cont-users.d"

echo "正在將系統群組與使用者補齊至 ${CONTAINER_GROUPS_DIR} 和 ${CONTAINER_USERS_DIR} ..."

mkdir -p "${CONTAINER_GROUPS_DIR}" "${CONTAINER_USERS_DIR}"

# -------------------------
# 補齊群組
# -------------------------
while IFS=: read group_name _ group_id _; do
    group_dir="${CONTAINER_GROUPS_DIR}/${group_name}"
    id_file="${group_dir}/id"
    disabled_file="${group_dir}/disabled"

    # 如果目錄已存在就跳過
    if [ -d "${group_dir}" ]; then
        echo "已存在群組，跳過: ${group_name}"
        continue
    fi

    mkdir -p "${group_dir}"
    echo "${group_id}" > "${id_file}"
    echo "0" > "${disabled_file}"  # 預設啟用
    echo "已新增群組: ${group_name} (GID=${group_id})"
done < /etc/group

# -------------------------
# 補齊使用者
# -------------------------
while IFS=: read user_name _ user_id group_id _ home_dir _; do
    user_dir="${CONTAINER_USERS_DIR}/${user_name}"
    id_file="${user_dir}/id"
    gid_file="${user_dir}/gid"
    home_file="${user_dir}/home"
    grps_file="${user_dir}/grps"
    disabled_file="${user_dir}/disabled"

    # 如果目錄已存在就跳過
    if [ -d "${user_dir}" ]; then
        echo "已存在使用者，跳過: ${user_name}"
        continue
    fi

    mkdir -p "${user_dir}"
    echo "${user_id}" > "${id_file}"
    echo "${group_id}" > "${gid_file}"
    echo "${home_dir}" > "${home_file}"
    echo "" > "${grps_file}"       # 預設無其他群組
    echo "0" > "${disabled_file}"  # 預設啟用
    echo "已新增使用者: ${user_name} (UID=${user_id}, GID=${group_id})"
done < /etc/passwd

echo "所有群組與使用者處理完成。"
