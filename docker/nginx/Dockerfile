FROM nginx:stable-alpine

# Add user
ARG USER=laravel
ARG UID=1000
RUN adduser --disabled-password --gecos "" --home "/home/${USER}" --uid "${UID}" "${USER}"

# Copy Nginx configuration
COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Create necessary directories and set permissions
RUN mkdir -p /var/run/nginx /var/cache/nginx /var/log/nginx \
    && chown -R ${USER}:${USER} /var/run/nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && chmod -R 755 /var/run/nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Remove default nginx.pid and create directory for it
RUN rm -f /var/run/nginx.pid \
    && mkdir -p /tmp/nginx \
    && chown -R ${USER}:${USER} /tmp/nginx

# Copy modified nginx.conf
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Switch to non-root user
USER ${USER}

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 