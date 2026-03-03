FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf || true

# Copy our custom config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
