#!/bin/bash
# Reemplaza el placeholder __UNSPLASH_CLIENT_ID__ en el HTML por la variable de entorno
set -e
CLIENT_ID=${UNSPLASH_CLIENT_ID:?Debes definir UNSPLASH_CLIENT_ID}
sed -i "s|__UNSPLASH_CLIENT_ID__|$CLIENT_ID|g" ex00/public/index.html
