# RDCore

**RDCore** es una API desarrollada en Node.js que permite generar y verificar Pruebas de Conocimiento Cero (Zero‑Knowledge Proofs) utilizando circuitos escritos en **Circom**. Se incluyen circuitos para el cálculo de hashes Poseidon y la verificación de Merkle Trees.

---

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Requisitos](#requisitos)
3. [Instalación](#instalación)
4. [Compilación de circuitos](#compilación-de-circuitos)
5. [Uso de la API](#uso-de-la-api)
6. [Principales endpoints](#principales-endpoints)
7. [Estructura del proyecto](#estructura-del-proyecto)
8. [Contribuciones](#contribuciones)

---

## Introducción

El objetivo de RDCore es facilitar la creación de pruebas criptográficas en aplicaciones que requieran anonimato o validaciones sin revelar datos sensibles. La API expone varias rutas que permiten generar claves EDDSA, crear pruebas y verificarlas mediante `snarkjs`.

Entre los circuitos más relevantes se encuentran:

- **census.circom**: Verificador de Merkle Tree basado en una clave privada y nodos hermanos.
- **poseidonPK.circom**: Calcula el hash Poseidon para una clave pública.

Los archivos resultantes de la compilación (`r1cs`, `wasm` y `zkey`) se generan dentro de la carpeta `circuits_build`.

---

## Requisitos

- **Node.js** y **npm**.
- Herramientas de **circom** y **snarkjs** instaladas globalmente (para compilar circuitos).
- (Opcional) **nodemon** para reiniciar el servidor en desarrollo.

Todas las dependencias están definidas en el archivo [`package.json`](package.json).

---

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Argudo/RDCore.git
   cd RDCore
