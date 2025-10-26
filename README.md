
# ImageGallery - Globant Piscine

## Descripción
Una galería de imágenes que utiliza la API de Unsplash, permite login OAuth, búsqueda y favoritos. Hecho con HTML5, CSS3, JavaScript (ES6, sin frameworks) y Docker.

## Tecnologías
- HTML5, CSS3
- JavaScript ES6 (Vanilla)
- Node.js (backend proxy y estáticos)
- Docker y docker-compose

## Funcionalidades
- **Login OAuth 2.0** con Unsplash
- **Galería** de fotos populares
- **Búsqueda** de fotos por palabra clave
- **Favoritos** (requiere login)
- **Responsive**: usable en móvil y escritorio

## Requisitos previos
- Docker y docker-compose instalados
- Clave de API de Unsplash (CLIENT_ID)

## Cómo ejecutar
1. Clona el repositorio:
	```sh
	git clone <repo_url>
	cd ImageGallery_Globant
	```
2. (Opcional) Crea un archivo `.env` con tu CLIENT_ID y CLIENT_SECRET si quieres sobreescribir los valores por defecto.
3. Construye y ejecuta el contenedor:
	```sh
	docker-compose up --build
	```
4. Accede a la app en [http://localhost:3000/ex00/public/index.html](http://localhost:3000/ex00/public/index.html)

## Notas
- Si ves errores de "Rate Limit Exceeded", espera unos minutos antes de recargar.
- El backend Node.js sirve tanto la API como los archivos estáticos.
- Código limpio, comentado y sin frameworks JS.

---

© Globant Piscine 2025
