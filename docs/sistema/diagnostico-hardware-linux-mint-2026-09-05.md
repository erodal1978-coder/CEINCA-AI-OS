# Perfil del Sistema, Diagnóstico de Hardware y Registro de Optimización
**Linux Mint 22.3 "Zena" — Equipo de Eduardo**  
**Fecha:** 2026-09-05  
**Autor:** Antigravity (Auditoría Técnica y Mantenimiento)

---

## 1. Perfil de Hardware

| Componente | Especificación Técnica Real | Detalle y Estado |
| :--- | :--- | :--- |
| **Procesador (CPU)** | Intel(R) Core(TM) i5-3570 @ 3.40GHz | 4 núcleos físicos / 4 hilos (sin Hyper-Threading). Socket LGA1155 (~2012). Frecuencia base 3.40 GHz, turbo hasta 3.80 GHz. Carga normal sostenida en 3.5–3.9 en entornos multitarea. |
| **Memoria RAM** | 7.7 GiB útiles (~8 GB físicos instalados) | 4 slots físicos DDR3 DIMM. Capacidad máxima de placa: **32 GB**. Velocidad configurada: 1600 MT/s (PC3-12800). Ver desglose de slots abajo. |
| **Tarjeta Gráfica (GPU)** | AMD Radeon HD 8670 / R5 340X OEM (Oland XT, rev 83) | GPU dedicada PCIe (Dell OEM, arquitectura GCN 1.0). Soporta decodificación y procesamiento de video VAAPI (`scale_vaapi`), sin aceleración de codificación por hardware (`VAEntrypointEncSlice` ausente). |
| **Disco Interno (sda)** | Western Digital Blue 250 GB (`WDC WD2500AAKX-75U6AA0`) | HDD mecánico SATA 3.0 (6.0 Gb/s), 7200 RPM, 3.5 pulgadas (~2012). Particionado con LVM2: `/dev/mapper/vgmint-root` (ext4) y `vgmint-swap_1` (swap 1.9 GB). |
| **Controladora de Disco** | Intel 7 Series/C216 SATA RAID Controller | Modos SATA 6 Gb/s soportados. **Sin soporte ni puertos NVMe/M.2 en placa madre.** |
| **Disco Externo (sdb1)** | Unidad USB "DOCUMENTOS1" (107.4 GB, FAT32) | Montado en `/media/eduardo/DOCUMENTOS1`. Ocupación al 100% (402 MB libres). Contiene carpeta raíz `CEINCA RESPALDO` (108 GB). |
| **Unidad Óptica (sr0)** | TSSTcorp DVD+/-RW | Lector/Grabador óptico SATA. |
| **Impresora USB** | HP LaserJet Professional P 1102w | Conexión USB directa (`hp:/usb/HP_LaserJet_Professional_P_1102w?serial=000000000W446ED5PR1a`). Driver `hpcups 3.23.12` con plugin privativo. |
| **Bluetooth** | Ninguno detectado | `/sys/class/bluetooth/` vacío; `rfkill` no reporta dispositivos Bluetooth. |

### Topología Física de Ranuras de Memoria RAM (`dmidecode`)
* **Capacidad Máxima Soportada por la Placa Madre:** 32 GB (4 × 8 GB DDR3).
* **Ranuras Totales:** 4 ranuras DIMM.
  * **Slot 1 (`ChannelA-DIMM0`):** **4 GB** DDR3 1600 MT/s (Módulo RMR5030EF68F9W1600).
  * **Slot 2 (`ChannelA-DIMM1`):** **2 GB** DDR3 1600 MT/s Micron (Módulo 8JTF25664AZ-1G6M1).
  * **Slot 3 (`ChannelB-DIMM0`):** **VACÍO (No Module Installed)** — *¡Ranura disponible para ampliación directa!*
  * **Slot 4 (`ChannelB-DIMM1`):** **2 GB** DDR3 1600 MT/s Micron (Módulo 8JTF25664AZ-1G6M1).

---

## 2. Perfil de Software

* **Distribución:** Linux Mint 22.3 "Zena" (64-bit), base Ubuntu 24.04 LTS ("Noble Numbat").
* **Kernel en Ejecución:** `7.0.0-31-generic` (línea HWE 24.04).
* **Kernel de Respaldo Retenido:** `7.0.0-30-generic` (como fallback seguro en `/boot`).
* **Kernels Obsoletos Eliminados:** 5 versiones completas purgadas (`6.14.0-29`, `6.14.0-37`, `6.17.0-14`, `6.17.0-19`, `6.17.0-20`) junto con sus 33 paquetes dependientes de headers, modules y herramientas.
* **Cargador de Arranque (GRUB):** Regenerado con `update-grub`, limpio con solo las dos entradas de kernel válidas.
* **Docker:** Desinstalado y purgado por completo (`docker.io`, `containerd`, `docker-compose-v2`, `ubuntu-fan`, `bridge-utils`, `runc`, `pigz`), eliminando 10.7 segundos de sobrecarga en el arranque del sistema.
* **Logs del Sistema:** Reducidos a 198 MB con rotación automática mediante `journalctl --vacuum-size=200M`.

---

## 3. Impresora: Estado y Diagnóstico de Comportamiento

### Estado Tras Limpieza
Se eliminó la cola redundante duplicada en CUPS (`HP_LaserJet_Professional_P_1102w`).  
El sistema cuenta ahora con una **única cola oficial configurada**:
* **Nombre:** `HP-LaserJet-Professional-P-1102w`
* **Destino Predeterminado del Sistema:** `HP-LaserJet-Professional-P-1102w`
* **URI del Dispositivo:** `hp:/usb/HP_LaserJet_Professional_P_1102w?serial=000000000W446ED5PR1a`
* **Driver:** `hpcups 3.23.12` con plugin propietario requerido instalado.

### Diagnóstico del Bug: "Cuando no tiene papel se detiene y no permite continuar"
1. **Causa Raíz Identificada:** La HP LaserJet Pro P1102w es una impresora de bajo costo basada en host (arquitectura GDI/software). No dispone de procesador de PostScript/PCL autónomo; el renderizado lo realiza la CPU de la computadora y el binario privativo de HP (`hp-plugin`) carga el microcódigo vía USB antes de cada trabajo.
2. **Mecanismo del Conflicto en CUPS:**  
   Cuando la impresora detecta bandeja vacía durante una impresión:
   - El backend `hp:/usb/...` reporta un evento de error de E/S o timeout.
   - CUPS marca internamente la impresora con `State Stopped` y `Reason paused` (directiva `ErrorPolicy retry-job`).
   - Al reponer las hojas, la impresora no reanuda la comunicación bidireccional automáticamente con el demonio de CUPS y queda en estado `deshabilitada / Unplugged or turned off`.
3. **Solución Rápida Temporal (sin reiniciar el equipo):**  
   Al colocar papel nuevo, ejecutar en terminal:
   ```bash
   cupsenable HP-LaserJet-Professional-P-1102w
   ```
4. **Tarea Técnica Pendiente (registrada en handoff):**  
   Revisar el subsistema HPLIP (`hp-toolbox`, `hp-check -t`) y evaluar la actualización a versión upstream 3.24.x o configurar un script de reactivación desatendido (udev rule o hook de CUPS) para que al recuperar la señal USB limpie el estado `paused` sin intervención manual.

---

## 4. Hallazgo Clave de Rendimiento: eCryptfs + HDD Mecánico

* **El Cuello de Botella Primario:** El directorio `/home/eduardo` está cifrado con **eCryptfs** montado sobre un **disco rígido mecánico de 7200 RPM de 2012**.
* **Impacto Técnico:**
  - eCryptfs cifra y descifra archivo por archivo en el espacio del kernel sobre una capa VFS apilada.
  - Cada acceso a disco (como `git status`, indexación de IDEs, cachés de navegadores, compilación o `du -sh`) genera múltiples operaciones de seek magnético aleatorio multiplicadas por las llamadas de cifrado.
  - Esto explica por qué un comando tan simple como `du -sh` sobre `~/.cache` o `CEINCA-WORKSPACE` demoraba más de 20 segundos y elevaba el I/O Wait de CPU (`%wa`) hasta 45%.
  - **Conclusión:** La CPU i5-3570 aún ofrece potencia suficiente para tareas de desarrollo y oficina; el verdadero freno del equipo es el tiempo de acceso aleatorio del disco mecánico bajo eCryptfs.

---

## 5. Registro de Cambios Ejecutados

| Acción / Tarea | Comando Exacto Ejecutado | Resultado Obtenido | Espacio / Beneficio |
| :--- | :--- | :--- | :--- |
| **Limpieza de APT** | `sudo apt-get clean && sudo apt-get autoclean` | Eliminados todos los paquetes `.deb` descargados y obsoletos en `/var/cache/apt/archives`. | **De 2.4 GB a 676 KB** (~2.4 GB liberados). |
| **Compactación de Journals** | `sudo journalctl --vacuum-size=200M` | Purgados 48 archivos de journal archivados antiguos. | **De 516.5 MB a 198 MB** (318.4 MB liberados). |
| **Purga de 5 Kernels Viejos** | `sudo apt-get purge -y linux-headers-6.14... linux-image-6.14... [33 paquetes] && sudo apt-get autoremove -y && sudo update-grub` | Eliminadas versiones 6.14.0-29, 6.14.0-37, 6.17.0-14, 6.17.0-19, 6.17.0-20. Conservados `7.0.0-31` y `7.0.0-30`. | `/boot` pasó **de 778 MB a 228 MB** (**550 MB directos en /boot** + módulos del sistema). |
| **Eliminación de Impresora Duplicada** | `sudo lpadmin -x HP_LaserJet_Professional_P_1102w` | Cola redundante removida. Destino por defecto consolidado en `HP-LaserJet-Professional-P-1102w`. | Cero colas duplicadas ni conflictos de selección en apps. |
| **Purga Completa de Docker** | `sudo systemctl disable --now docker containerd docker.socket && sudo apt-get purge -y containerd docker-compose-v2 docker.io && sudo apt-get autoremove -y` | Servicios deshabilitados y purgados; `/var/lib/docker` eliminado; dependencias huérfanas (`bridge-utils`, `pigz`, `runc`, `ubuntu-fan`) purgadas. | **~37.4 MB** en librerías + eliminación de 10.7 segundos de retraso en el inicio del sistema. |
| **Instalación y Diagnóstico SMART** | `sudo apt-get install -y smartmontools && sudo smartctl -a /dev/sda > /tmp/smart_sda.txt` | Herramienta instalada e informe técnico extraído para evaluación de vida útil. | Monitoreo activo del único disco del sistema. |

### Balance Total de Espacio en la Partición Raíz (`/`)
* **Antes de la intervención:** 92 GB usados / 123 GB libres (43% de uso).
* **Después de la intervención:** **87 GB usados / 129 GB libres (41% de uso).**
* **Liberación neta recuperada en disco:** **+5.0 Gigabytes libres**.

---

## 6. Resultado SMART del Disco Rígido (`/dev/sda`)

* **Modelo:** Western Digital Blue 250 GB (`WDC WD2500AAKX-75U6AA0`)
* **Número de Serie:** `WD-WCC2H0803534`
* **Evaluación General SMART:** **PASSED**
* **Horas de Uso Acumuladas (`Power_On_Hours`):** **33,528 horas** (equivalente a **3.82 años de funcionamiento continuo ininterrumpido 24/7**).
* **Temperatura Operativa:** 45 °C (dentro del rango térmico admisible para 7200 RPM).
* **Atributos Críticos de Superficie:**
  * `ID# 5 Reallocated_Sector_Ct`: **0** (Valor RAW = 0, sin sectores reasignados).
  * `ID# 196 Reallocated_Event_Count`: **0**.
  * `ID# 197 Current_Pending_Sector`: **0** (Sin sectores inestables pendientes de reubicación).
  * `ID# 198 Offline_Uncorrectable`: **0**.
  * `ID# 199 UDMA_CRC_Error_Count`: **0** (El cable SATA y el puerto operan sin pérdidas de paquetes).
* **Historial de Autopruebas Internas:**  
  > [!WARNING]
  > El registro interno de autotests (`SMART Self-test log`) documenta que en las horas 20,141 y 20,156 (hace ~13,000 horas de uso) fallaron pruebas cortas por error de lectura en el LBA 5812891 (`read failure`). Aunque los sectores fueron reescritos y actualmente no hay sectores pendientes, este historial confirma desgaste en la superficie magnética, lo que desaconseja mantener este disco como almacenamiento principal sin copias de seguridad continuas.

---

## 7. Recomendaciones Técnicas y Decisiones del Usuario

### A. Recomendación de Compra de Hardware
1. **Unidad de Estado Sólido (SSD SATA de 2.5 pulgadas):**
   - **Interfaz Requerida:** SATA III (6.0 Gb/s) de 2.5 pulgadas (la placa madre no posee ranuras M.2 ni controladora PCIe NVMe).
   - **Capacidad sugerida:** 480 GB a 1 TB.
   - **Modelos recomendados con alta durabilidad y caché confiable:** Crucial MX500 o BX500, Western Digital Blue SA510, Kingston KC600 o A400.
   - **Impacto previsto:** Reducción de tiempos de arranque de ~1.5 min a ~15 segundos; operaciones de indexación de código, Chrome y git prácticamente instantáneas.
2. **Memoria RAM DDR3:**
   - La placa madre dispone de **4 ranuras** y actualmente el **Slot 3 (`ChannelB-DIMM0`) está totalmente libre**.
   - **Módulo a comprar:** 1 módulo DIMM de **4 GB u 8 GB DDR3 a 1600 MHz (PC3-12800)** sin ECC (unbuffered) para computadora de escritorio (1.5V).
   - Con un módulo adicional de 4 GB o 8 GB, el equipo pasará a **12 GB o 16 GB totales**, resolviendo el cuello de botella de memoria en multitarea pesada.

### B. Rutas de Migración al Adquirir el SSD (Para Sesión Futura)
* **Ruta 1 (Rápida - Clonación direct-image):** Clonar con *Clonezilla* el disco mecánico `/dev/sda` al nuevo SSD. Mantiene exactamente el sistema actual y eCryptfs sin tener que reinstalar aplicaciones. Gana velocidad de inmediato por la lectura y seek del SSD.
* **Ruta 2 (Recomendada Técnica - Instalación limpia con LUKS):** Instalar Linux Mint 22.3 limpio en el SSD seleccionando "Cifrado de disco completo (LUKS)". LUKS trabaja a nivel de bloque en el kernel (muchísimo más rápido que eCryptfs) y no degrada el rendimiento de lectura aleatoria. Luego se migran los archivos de `/home/eduardo`.

### C. Inventario y Limpieza de Disco Recomendada
1. **Carpeta `~/Descargas` (~18 GB):**
   - Se detectaron archivos comprimidos duplicados que ya tienen sus carpetas extraídas en el mismo lugar:
     * `CEINCA TODO-20260721T212023Z-1-001.zip` (2.0 GB) y `...002.zip` (1.4 GB) — **~3.4 GB recuperables** si la carpeta `CEINCA TODO` (2.1 GB) ya contiene los archivos requeridos.
     * `Casa Campo Barinas.zip` (855 MB) — duplicado de la carpeta extraída `Casa Campo Barinas` (860 MB).
     * `casa campo fotos nuevas.zip` (107 MB).
     * Paquetes de instalación sueltos ya instalados: `code_1.123.0-1780481570_amd64.deb` (168 MB).
2. **Carpeta `~/CEINCA-WORKSPACE`:**
   - Archivos sueltos en raíz del workspace a archivar o borrar si ya no se requieren:
     * `Antigravity.tar.gz` (164 MB).
     * `Recording_2026_09_01.webm` (11 MB).
3. **Unidad Externa `DOCUMENTOS1` (107 GB, FAT32):**
   - La carpeta `/media/eduardo/DOCUMENTOS1/CEINCA RESPALDO` ocupa 108 GB, dejando solo 402 MB libres. Se aconseja consolidar o depurar respaldos antiguos antes de agregar nuevos archivos.

### D. Servicios Candidatos a Deshabilitar en el Arranque (Aprobación Pendiente)
Los siguientes servicios están habilitados en systemd pero corresponden a funciones que el hardware no utiliza:
* `bluetooth.service` y `blueman-mechanism.service`: No hay dispositivo Bluetooth instalado en la tarjeta madre.
* `ModemManager.service`: Monitorea módems de banda ancha móvil USB (3G/4G/LTE); innecesario en red fija Ethernet/Wi-Fi.
* `touchegg.service`: Demonio de gestos táctiles para touchpads de laptops; innecesario en PC de sobremesa.
*(Nota de seguridad: El servicio de `me.proton.vpn.split_tunneling.service` se mantiene habilitado por si se utiliza la VPN).*

### E. Tarea Pendiente Registrada: Subsistema de Impresión HPLIP
* **Problema:** La impresora HP LaserJet Pro P1102w detiene su cola de impresión al quedarse sin papel y no permite reanudar el trabajo tras reponer hojas sin intervención.
* **Acción para próxima sesión:**
  1. Revisar configuración de alertas en `hp-toolbox` y permisos del servicio `cups`.
  2. Implementar regla UDEV o script de reactivación automática (`cupsenable`) ante eventos de reconexión USB.
  3. Evaluar actualización de versión de HPLIP o instalación limpia del plugin oficial.
