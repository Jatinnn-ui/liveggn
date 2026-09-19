# CityPulse is a static site (HTML/CSS/JS, no build step).
# Serve it with a lightweight nginx image.
FROM nginx:1.27-alpine

# The site's files live in the citypulse/ subfolder of this repo.
COPY citypulse/ /usr/share/nginx/html/

# Custom nginx config (SPA-style fallback + sensible static defaults).
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
