# syntax=docker/dockerfile:1
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY ex00/public ./
COPY ex00/assets ./assets/
COPY replace_env.sh /replace_env.sh

EXPOSE 80

# Entrypoint personalizado: reemplaza el CLIENT_ID y arranca nginx
ENTRYPOINT ["/bin/sh", "-c", ". /replace_env.sh && exec nginx -g 'daemon off;'"]
