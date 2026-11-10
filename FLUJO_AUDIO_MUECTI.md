# Flujo de producción de audiolibros MUECTI

## Perfil aprobado

| Parámetro | Valor |
| --- | --- |
| Convertidor | [MUECTI V4](Convertidor_Audiolibros_V4_Master_MUECTI.ipynb), paso 3 |
| Motor | Microsoft Neural mediante `edge-tts` |
| Voz | Elvira, español de España (`es-ES-ElviraNeural`) |
| Velocidad | Normal (`+0%`) |
| Entrega | Un MP3 por lectura en Google Drive privado |

Este perfil corresponde a las cuatro grabaciones de **Herramientas para los estudios sobre ciencia, tecnología e innovación** que Jhoana confirmó que podía escuchar. Reutilizar el perfil en las próximas lecturas. Si falla la síntesis, resolver el fallo antes de entregar el audio con otro motor o voz.

## Cómo incorporar una lectura

1. Registrar la lectura en el inventario privado con módulo, unidad, número de lectura, título y PDF de origen. Conservar una fila por lectura, incluso cuando una unidad tenga varios textos.
2. Abrir el V4, cargar el PDF y revisar el guion extraído contra la fuente. Verificar el orden de las páginas, las palabras cortadas y los encabezados repetidos. El paso 3 envía el guion a Microsoft para sintetizar la voz. Usarlo con material autorizado para ese procesamiento.
3. Generar el MP3 con el perfil aprobado. Para archivos nuevos, usar nombres como `M03-U03-L02-trabajo-de-campo.mp3`. Mantener los enlaces existentes al corregir un audio mediante **Gestionar versiones** en Drive.
4. Verificar que el MP3 se decodifica completo. Escuchar el inicio, la mitad y el final, contrastarlos con la lectura y comprobar que la voz y el ritmo coinciden con el perfil. La verificación técnica puede hacerse con `ffmpeg -v error -xerror -i "audiolibro.mp3" -f null -`.
5. Guardar el MP3 junto con su lectura en Drive privado. Comprobar que el enlace abre con la cuenta que estudia y que el audio se reproduce desde la app de Drive. Registrar por separado la verificación técnica y la prueba en el teléfono.
6. Si se integra en el reproductor sincronizado del portal, empaquetar el PDF, el audio definitivo y su mapa de segmentos en privado. Volver a calcular las marcas cuando cambie el audio y comprobar el salto entre texto y audio al principio, en la mitad y al final. El paso 3 del V4 genera el MP3. El paquete sincronizado se prepara aparte.

GitHub guarda la configuración, las instrucciones y el código del portal. Guardar los PDF privados, los guiones extraídos, los MP3, los mapas y los paquetes que contienen esos materiales en Drive privado.

## Inventario base de Herramientas CTI

| Módulo | Unidad | Lectura | Título de estudio |
| --- | --- | --- | --- |
| 3 | 1 | 1 | Cienciometría |
| 3 | 2 | 1 | Técnicas cuantitativas |
| 3 | 3 | 1 | Métodos cualitativos |
| 3 | 3 | 2 | Trabajo de campo |

Para cada lectura nueva, copiar estos campos en el inventario privado.

```text
Módulo / unidad / lectura:
Título:
PDF de origen (Drive privado):
Voz y velocidad:
MP3 y duración (Drive privado):
Revisión del guion:
Decodificación y escucha de muestra:
Reproducción desde el teléfono:
Paquete del portal y comprobación de sincronía (si aplica):
```

El cargador actual de [Herramientas CTI](herramientas_cti.js) espera las cuatro lecturas del módulo 3, en el orden de la tabla, con formato `muecti-hecti-v1`. Para otro módulo, reutilizar el perfil de audio y definir sus lecturas, actividades y formato de importación en el portal según su propio inventario.
