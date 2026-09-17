# Ethan Burst — versión local

Reinterpretación de https://alegriamacarena.wixstudio.com/ethanburst. Conserva los colores originales, la tipografía Rumonds y los clips públicos de Wix. Toma como referencias la selección de films de https://lagunasanta.com/films y la narrativa editorial de https://joyzamora.com/.

La iteración actual lleva el diseño hacia un registro indie con acentos de rock: grano de película permanente, texturas de fanzine (semitono, cinta adhesiva, sombras duras de serigrafía), un verde ácido como segundo acento y la gótica Rumonds usada como logotipo de banda.

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

## Vistas y navegación

La web es una sola página con cuatro vistas enrutadas por hash: `#/`, `#/films`, `#/about` y `#/contact`. Cada vista es enlazable, cambia el `<title>` y mueve el foco a su encabezado. About aparece en la navegación principal (con la coletilla «quién hay detrás»), en un pase de backstage fijo en la cabecera, en un bloque de presentación en la portada, en el menú móvil y en el pie.

## Transiciones

- **Entre vistas.** Una tira de película con perforaciones barre la pantalla sobre un lienzo de estática, con marca de cambio de rollo y el nombre del destino en gótica con separación RGB. La dirección del barrido sigue el orden del menú. La vista entrante se asienta con un pequeño salto de fotograma.
- **Entre cortos.** El reproductor abre con el obturador cerrado: estática, marca de rollo y dos palas que se separan sobre el fotograma. Al cerrar, las palas vuelven a juntarse.

## Sonido

`src/noise.js` sintetiza ruido blanco con la Web Audio API: no hay archivos de audio. Cada voz es ruido filtrado con envolvente propia — siseo al cambiar de vista, arranque de proyector al abrir un corto, golpe seco al cerrarlo y roce de cinta en las microinteracciones. El contexto de audio se crea en el primer gesto del usuario, nunca al cargar. El interruptor de la cabecera guarda la preferencia en `localStorage`.

## Contenido

- `src/main.js`: enrutado, transiciones, catálogo, filtros y reproductor.
- `src/noise.js`: síntesis de ruido blanco y control de sonido.
- `src/style.css`: diseño adaptable a móvil, tablet y escritorio.
- `public/media`: medios originales descargados de Wix. Los seis vídeos son fragmentos del portfolio, no películas completas. Los nombres editoriales describen los clips; los títulos y localizaciones provisionales de Wix no se presentan como datos confirmados. `about.png` es el monograma de la marca, no una fotografía.
- `public/fonts/rumonds.woff2`: tipografía servida en la web original. Es una gótica condensada de cartel cuyas casillas de mayúsculas contienen glifos ajenos: solo se compone en minúsculas (`text-transform:lowercase`), que el archivo dibuja como versales. El papel de serif editorial lo cubre Georgia.
- `index.html`: textos de presentación y adaptación al español de la biografía original.

El formulario prepara un texto y permite copiarlo para enviarlo en la web original. No hay backend, envío de correo ni almacenamiento de datos. Para envío directo será necesario configurar un destinatario y un servicio de formularios.

Se respeta `prefers-reduced-motion`: sin grano, sin barrido, sin obturador y sin vídeos automáticos. El sonido es independiente de esa preferencia y se controla con su propio interruptor.

Todos los recursos visuales y tipográficos se sirven localmente. Solo el enlace de contacto original requiere salir de la web. Antes de publicar, confirmar las licencias de los medios y la tipografía, los textos y los datos definitivos del portfolio.

La comprobación se ha hecho con compilación de Vite y capturas en Chrome headless (portada, films, about, contacto y los estados de las dos transiciones). Falta una pasada manual con sonido, navegador real y dispositivo táctil.
