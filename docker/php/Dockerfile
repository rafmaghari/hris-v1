FROM php:8.3-fpm-alpine AS base

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    linux-headers \
    bash \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    icu-dev \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo_mysql \
        opcache \
        intl \
        zip \
        bcmath \
        pcntl \
        exif \
        gd

# Install Redis extension
RUN apk add --no-cache \
    pcre-dev \
    $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del pcre-dev $PHPIZE_DEPS

# Install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Create non-root user for better security
ARG USER=laravel
ARG UID=1000
RUN adduser --disabled-password --gecos "" --home "/home/${USER}" --uid "${UID}" "${USER}"

# PHP configuration
COPY docker/php/conf.d/php.ini /usr/local/etc/php/conf.d/php.ini

# Development stage
FROM base AS development

# Install development dependencies
RUN apk add --no-cache \
    nodejs \
    npm

USER ${USER}

EXPOSE 9000
CMD ["php-fpm"] 