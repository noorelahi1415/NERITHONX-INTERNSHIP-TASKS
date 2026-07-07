FROM ghost:5

WORKDIR /var/lib/ghost

COPY config.production.json /var/lib/ghost/config.production.json

RUN chown node:node /var/lib/ghost/config.production.json

USER node

EXPOSE 2368

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:2368/ || exit 1
