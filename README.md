# Ethan Burst — versión local

Reinterpretación de https://alegriamacarena.wixstudio.com/ethanburst. Conserva los colores originales, la tipografía Rumonds y los clips públicos de Wix. Toma como referencias la selección de films de https://lagunasanta.com/films y la narrativa editorial de https://joyzamora.com/.

## Arrancar

```sh
npm install
npm run dev
```

Abre la dirección que imprime Vite (normalmente http://127.0.0.1:5173).

```sh
npm run build
npm run preview
```

## Contenido

- `src/main.js`: catálogo, filtros, reproductor y preparación de consultas.
- `src/style.css`: diseño adaptable a móvil, tablet y escritorio.
- `public/media`: medios originales descargados de Wix. Los seis vídeos son fragmentos del portfolio, no películas completas. Los nombres editoriales describen los clips; los títulos y localizaciones provisionales de Wix no se presentan como datos confirmados.
- `public/fonts/rumonds.woff2`: tipografía servida en la web original.
- `index.html`: textos de presentación y adaptación al español de la biografía original.

El formulario prepara un texto y permite copiarlo para enviarlo en la web original. No hay backend, envío de correo ni almacenamiento de datos. Para envío directo será necesario configurar un destinatario y un servicio de formularios.

Todos los recursos visuales y tipográficos se sirven localmente. Solo el enlace de contacto original requiere salir de la web. Antes de publicar, confirmar las licencias de los medios y la tipografía, los textos y los datos definitivos del portfolio.

La sesión de implementación no dispone de navegador conectado: se verifican compilación y respuestas HTTP; la comprobación visual e interactiva en navegador queda pendiente.
# ethan-burst
