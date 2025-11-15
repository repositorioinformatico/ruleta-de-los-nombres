# La Ruleta de los Nombres

Web estática pensada para usar en clase y elegir alumnado al azar. Se puede alojar en GitHub Pages sin backend y está desplegada en https://repositorioinformatico.github.io/ruleta-de-los-nombres/.

## Cómo funciona
- Al abrir `index.html` se muestra una ruleta dibujada en `canvas` con un panel de controles.
- Puedes pegar nombres directamente en el área "Pegar listado manualmente" o cargar un fichero `.txt` con un nombre por línea.
- El listado detectado se puede editar a mano; cualquier cambio actualiza la ruleta.
- Dos botones permiten quedarse solo con los apellidos (todas las palabras menos la última) o solo con el nombre (última palabra).
- Al pulsar "Girar ruleta" se anima el giro y el nombre seleccionado aparece en un banner oscuro bajo la ruleta.

## Estructura
```
.
├── index.html   # Maquetación principal
├── styles.css   # Estilos y layout responsive
├── script.js    # Lógica de ruleta, carga y animación
└── README.md    # Este archivo
```

## Despliegue
1. El repositorio ya está preparado para GitHub Pages (rama `main`).
2. Activa Pages en GitHub → Settings → Pages → Branch `main` → Save.
3. La web estará disponible en `https://<tu_usuario>.github.io/ruleta-de-los-nombres/`.

## Desarrollo local
```
python3 -m http.server 8000
```
Abre `http://localhost:8000` y prueba los cambios.
