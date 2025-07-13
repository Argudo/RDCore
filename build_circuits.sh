#!/bin/bash

set -e

MAIN_DIR=$(pwd)
CIRCUITS_DIR="$MAIN_DIR/circuits"
TEMPLATE_DIR="$MAIN_DIR/templates"
BUILD_DIR="$MAIN_DIR/circuits_build"
PTAU_FILE="$BUILD_DIR/powersOfTau28_hez_final_16.ptau"

DEPTHS=(1 2 3 4 5 6 7)

echo "📦 Preparando directorios..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/r1cs" "$BUILD_DIR/witness" "$BUILD_DIR/verification"
mkdir -p "$CIRCUITS_DIR"
echo "✅ Directorios creados en $BUILD_DIR"

# Descargar PTAU si no existe
if [ ! -f "$PTAU_FILE" ]; then
  echo "⬇️ Descargando powersOfTau28_hez_final_16.ptau..."
  wget -O "$PTAU_FILE" https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_16.ptau
  echo "✅ Archivo PTAU descargado en $PTAU_FILE"
else
  echo "ℹ️ PTAU ya existente en $PTAU_FILE"
fi

echo "🛠️ Generando circuitos desde template..."

for DEPTH in "${DEPTHS[@]}"; do
  CIRCUIT_FILE="$CIRCUITS_DIR/census_${DEPTH}.circom"
  echo "✏️  Generando $CIRCUIT_FILE con profundidad $DEPTH..."
  sed -E "s/component main \{public \[root\]\} = MTVerifier\([0-9]+\);/component main {public [root]} = MTVerifier($DEPTH);/" \
    "$TEMPLATE_DIR/census_template.circom" > "$CIRCUIT_FILE"
done

echo "✅ Circuitos generados desde template."

echo "🔧 Compilando circuitos..."

for file in "$CIRCUITS_DIR"/census_*.circom; do
  BASENAME=$(basename "$file" .circom)
  echo -e "\n➡️ Compilando $BASENAME..."

  # R1CS
  circom "$file" --r1cs --wasm -l "$MAIN_DIR" --output "$BUILD_DIR"
  echo "✅ Compilado $BASENAME"

  # Mover wasm a witness/
  if [ -d "$BUILD_DIR/${BASENAME}_js" ]; then
    mv "$BUILD_DIR/${BASENAME}_js" "$BUILD_DIR/witness/"
    echo "📁 WASM movido a witness/"
  else
    echo "⚠️ No se encontró carpeta JS para $BASENAME"
    continue
  fi

  # ZKEY
  echo "🔐 Generando zkey para $BASENAME..."
  if npx snarkjs groth16 setup "$BUILD_DIR/$BASENAME.r1cs" "$PTAU_FILE" "$BUILD_DIR/verification/$BASENAME.zkey"; then
    echo "✅ ZKEY generada"
  else
    echo "❌ Error al generar zkey para $BASENAME"
    continue
  fi

  echo "🧾 Exportando clave de verificación..."
  if npx snarkjs zkey export verificationkey "$BUILD_DIR/verification/$BASENAME.zkey" "$BUILD_DIR/verification/${BASENAME}_vkey.json"; then
    echo "✅ Verification key exportada"
  else
    echo "❌ Error al exportar verification key para $BASENAME"
    continue
  fi

done

echo -e "\n🎉 Proyecto compilado completamente."
