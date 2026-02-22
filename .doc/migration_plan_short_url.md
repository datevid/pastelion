# Plan de Migración Arquitectónica: URLs Cortas Aleatorias (Base58 7-char + Unique + Retry)

## 📌 Contexto
Para alinear el proyecto con una arquitectura de escala global y simplificar la infraestructura, migramos a un modelo de generación de slugs (URLs cortas) **Aleatorios en Backend**, utilizando el alfabeto **Base58 (BTC)**.

Este modelo es altamente escalable porque:
1. **No depende de un contador global** (como `BIGSERIAL` o secuencias), evitando cuellos de botella en inserciones masivas multi-nodo.
2. **Espacio de nombres masivo:** Con 7 caracteres en Base58, el espacio es de ~2.2 billones (`58^7`), lo que hace que las colisiones sean extremadamente raras incluso con millones de registros.
3. **Mantenibilidad:** El proceso se maneja directamente en el backend con lógica de reintento simple.

---

## 🛠️ Fases del Desarrollo

### Fase 1: Modificaciones en la Base de Datos (Supabase)
1. **Asegurar Restricción de Unicidad:**
   La columna `short_url` en la tabla `pastes` debe tener una restricción `UNIQUE`.
   ```sql
   ALTER TABLE pastes ADD CONSTRAINT pastes_short_url_key UNIQUE (short_url);
   ```

### Fase 2: Configuración del Proyecto (Next.js)
1. **Alfabeto Base58 (Estándar BTC):**
   Utilizaremos el alfabeto que excluye caracteres visualmente ambiguos: `123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`.

2. **Lógica de Generación:**
   Se utiliza el módulo `crypto` de Node.js para generar bytes aleatorios y mapearlos al alfabeto Base58.

### Fase 3: Modificación del Backend (`src/app/actions/paste.ts`)
1. **Implementar `generateRandomSlug`:**
   Una función helper que genera una cadena aleatoria de 7 caracteres.

2. **Refactorizar `createPaste` con Reintentos:**
   El nuevo flujo de inserción opera de esta manera:
   * **Paso A:** Se genera un `short_url` aleatorio en el backend.
   * **Paso B:** Se intenta realizar un `INSERT` en Supabase incluyendo el `short_url`.
   * **Paso C:** Si el insert falla por colisión (error Postgres `23505`), se genera un nuevo slug y se reintenta hasta un máximo de veces (ej. 5).
   * **Paso D:** Se devuelve la URL corta al front-end.

---

## ✅ Ventajas de este Modelo
* **Escalabilidad Horizontal:** Al no depender de una secuencia centralizada, diferentes nodos de escritura pueden insertar registros simultáneamente sin bloquearse entre sí por el ID secuencial.
* **Seguridad por Oscuridad:** Las URLs no son predecibles (a diferencia de Hashids si se conoce el Salt), lo que evita el "scraping" secuencial simple.
* **Simplicidad:** Se elimina la necesidad de un "Update" secundario después del insert, reduciendo la latencia y el consumo de recursos.
